-- Enable the pgcrypto extension for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum for User Roles
CREATE TYPE user_role AS ENUM ('admin', 'staff');

-- 1. Restaurants Table
CREATE TABLE public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    hero_url TEXT,
    config_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Users Table (Extends auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    role user_role DEFAULT 'staff'::user_role NOT NULL,
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Zones Table
CREATE TABLE public.zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tables Table (Mesas)
CREATE TABLE public.tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE NOT NULL,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 2,
    image_url TEXT,
    x_position NUMERIC DEFAULT 0,
    y_position NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Events Table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Menu Items Table
CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Bookings Table
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');

CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status booking_status DEFAULT 'pending'::booking_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Messages Table
CREATE TYPE message_status AS ENUM ('new', 'in_progress', 'resolved');

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    customer_phone TEXT NOT NULL,
    content TEXT NOT NULL,
    status message_status DEFAULT 'new'::message_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
--------------------------------------------------------------------------------

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper Function to get the current user's restaurant_id
CREATE OR REPLACE FUNCTION get_user_restaurant_id()
RETURNS UUID AS $$
    SELECT restaurant_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. Restaurants Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.restaurants
    FOR SELECT USING (true);
CREATE POLICY "Admins can update their own restaurant" ON public.restaurants
    FOR UPDATE USING (id = get_user_restaurant_id());

-- 2. Users Policies
CREATE POLICY "Users can view users in their own restaurant" ON public.users
    FOR SELECT USING (restaurant_id = get_user_restaurant_id());
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (id = auth.uid());

-- 3. Zones Policies
CREATE POLICY "Zones are viewable by everyone" ON public.zones
    FOR SELECT USING (true);
CREATE POLICY "Staff can manage zones for their restaurant" ON public.zones
    FOR ALL USING (restaurant_id = get_user_restaurant_id());

-- 4. Tables Policies
CREATE POLICY "Tables are viewable by everyone" ON public.tables
    FOR SELECT USING (true);
CREATE POLICY "Staff can manage tables for their restaurant" ON public.tables
    FOR ALL USING (restaurant_id = get_user_restaurant_id());

-- 5. Events Policies
CREATE POLICY "Events are viewable by everyone" ON public.events
    FOR SELECT USING (true);
CREATE POLICY "Staff can manage events for their restaurant" ON public.events
    FOR ALL USING (restaurant_id = get_user_restaurant_id());

-- 6. Menu Items Policies
CREATE POLICY "Menu items are viewable by everyone" ON public.menu_items
    FOR SELECT USING (true);
CREATE POLICY "Staff can manage menu items for their restaurant" ON public.menu_items
    FOR ALL USING (restaurant_id = get_user_restaurant_id());

-- 7. Bookings Policies
CREATE POLICY "Anyone can insert bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can manage bookings for their restaurant" ON public.bookings
    FOR SELECT USING (restaurant_id = get_user_restaurant_id());
CREATE POLICY "Staff can update bookings for their restaurant" ON public.bookings
    FOR UPDATE USING (restaurant_id = get_user_restaurant_id());
CREATE POLICY "Staff can delete bookings for their restaurant" ON public.bookings
    FOR DELETE USING (restaurant_id = get_user_restaurant_id());

-- 8. Messages Policies
CREATE POLICY "Anyone can insert messages" ON public.messages
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can view messages for their restaurant" ON public.messages
    FOR SELECT USING (restaurant_id = get_user_restaurant_id());
CREATE POLICY "Staff can update messages for their restaurant" ON public.messages
    FOR UPDATE USING (restaurant_id = get_user_restaurant_id());
