-- ============================================================
-- 1. Add slug to organizations + unique constraint
-- ============================================================
alter table public.organizations add column if not exists slug text;
alter table public.organizations add column if not exists logo_url text;
alter table public.organizations add column if not exists cover_url text;
alter table public.organizations add column if not exists phone text;
alter table public.organizations add column if not exists address text;
alter table public.organizations add column if not exists description text;
alter table public.organizations add column if not exists primary_color text default '#000000';

-- Unique slug per organization
create unique index if not exists organizations_slug_unique on public.organizations(slug) where slug is not null;

-- Public can read organizations by slug (for booking page)
create policy "Public can view organizations by slug"
  on public.organizations for select
  using (true);

-- ============================================================
-- 2. Update handle_new_user trigger to include slug
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  new_org_id uuid;
  restaurant_name text;
  full_name text;
  org_slug text;
begin
  restaurant_name := new.raw_user_meta_data->>'restaurant_name';
  full_name       := coalesce(new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'full_name');
  org_slug        := new.raw_user_meta_data->>'slug';

  if restaurant_name is not null then
    insert into public.organizations (name, slug)
    values (restaurant_name, org_slug)
    returning id into new_org_id;

    insert into public.profiles (id, org_id, role, full_name)
    values (new.id, new_org_id, 'owner', full_name);
  else
    insert into public.profiles (id, full_name)
    values (new.id, full_name);
  end if;

  return new;
end;
$$;

-- ============================================================
-- 3. Business Hours
-- ============================================================
create table if not exists public.business_hours (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0=Sun, 6=Sat
  open_time time,
  close_time time,
  is_closed boolean default false,
  booking_duration_minutes integer default 90,
  max_bookings_per_slot integer default 10,
  created_at timestamptz default now() not null,
  unique(org_id, day_of_week)
);

alter table public.business_hours enable row level security;

create policy "Users can manage own business hours"
  on public.business_hours for all
  using (org_id = public.get_my_org_id());

create policy "Public can view business hours"
  on public.business_hours for select
  using (true);

-- ============================================================
-- 4. Blocked Dates
-- ============================================================
create table if not exists public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  blocked_date date not null,
  reason text,
  created_at timestamptz default now() not null,
  unique(org_id, blocked_date)
);

alter table public.blocked_dates enable row level security;

create policy "Users can manage blocked dates"
  on public.blocked_dates for all
  using (org_id = public.get_my_org_id());

create policy "Public can view blocked dates"
  on public.blocked_dates for select
  using (true);

-- ============================================================
-- 5. Events
-- ============================================================
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  title text not null,
  description text,
  event_date date,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now() not null
);

alter table public.events enable row level security;

create policy "Users can manage own events"
  on public.events for all
  using (org_id = public.get_my_org_id());

create policy "Public can view active events"
  on public.events for select
  using (is_active = true);

-- ============================================================
-- 6. Menu Categories + Items
-- ============================================================
create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  sort_order integer default 0,
  created_at timestamptz default now() not null
);

alter table public.menu_categories enable row level security;

create policy "Users can manage own menu categories"
  on public.menu_categories for all
  using (org_id = public.get_my_org_id());

create policy "Public can view menu categories"
  on public.menu_categories for select
  using (true);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2),
  image_url text,
  is_active boolean default true,
  is_featured boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now() not null
);

alter table public.menu_items enable row level security;

create policy "Users can manage own menu items"
  on public.menu_items for all
  using (org_id = public.get_my_org_id());

create policy "Public can view active menu items"
  on public.menu_items for select
  using (is_active = true);

-- ============================================================
-- 7. Bookings
-- ============================================================
create type if not exists public.booking_status as enum (
  'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  zone_id uuid references public.zones(id) on delete set null,
  table_id uuid references public.tables(id) on delete set null,
  -- Guest info
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  guest_comments text,
  -- Booking details
  booking_date date not null,
  booking_time time not null,
  party_size integer not null default 2,
  status public.booking_status default 'pending',
  -- Internal notes
  internal_notes text,
  confirmation_code text unique default upper(substring(gen_random_uuid()::text, 1, 8)),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.bookings enable row level security;

create policy "Users can manage own bookings"
  on public.bookings for all
  using (org_id = public.get_my_org_id());

create policy "Anyone can insert bookings"
  on public.bookings for insert
  with check (true);

-- ============================================================
-- 8. Messages (WhatsApp / internal)
-- ============================================================
create type if not exists public.message_status as enum ('new', 'in_progress', 'resolved');

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  booking_id uuid references public.bookings(id) on delete set null,
  guest_name text,
  guest_phone text,
  content text not null,
  internal_note text,
  status public.message_status default 'new',
  source text default 'manual', -- 'whatsapp', 'manual', 'email'
  created_at timestamptz default now() not null
);

alter table public.messages enable row level security;

create policy "Users can manage own messages"
  on public.messages for all
  using (org_id = public.get_my_org_id());

-- ============================================================
-- 9. Add image_url to tables (for table photos)
-- ============================================================
alter table public.tables add column if not exists image_url text;
alter table public.tables add column if not exists status text default 'available' check (status in ('available','reserved','occupied','blocked','out_of_service'));
