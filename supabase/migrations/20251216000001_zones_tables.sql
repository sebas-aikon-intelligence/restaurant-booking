-- Create Zones Table
create table public.zones (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Tables Table (Physical Tables)
create table public.tables (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) not null,
  zone_id uuid references public.zones(id) on delete cascade not null,
  number text not null, -- Short identifier like "T1", "VIP-1"
  seats integer default 4,
  position jsonb default '{"x": 0, "y": 0, "rotation": 0, "shape": "rect"}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Prevent duplicate table numbers in the same zone
  unique(zone_id, number)
);

-- Enable RLS
alter table public.zones enable row level security;
alter table public.tables enable row level security;

-- RLS Policies for Zones
create policy "Users can view own zones"
  on public.zones for select
  using ( org_id = public.get_my_org_id() );

create policy "Admins can manage zones"
  on public.zones for all
  using ( org_id = public.get_my_org_id() );

-- RLS Policies for Tables
create policy "Users can view own tables"
  on public.tables for select
  using ( org_id = public.get_my_org_id() );

create policy "Admins can manage tables"
  on public.tables for all
  using ( org_id = public.get_my_org_id() );
