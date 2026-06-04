-- Create Organizations Table
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text, 
  subscription_plan text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Profiles Table (Linked to Auth)
create type public.app_role as enum ('owner', 'manager', 'waiter', 'chef');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id),
  role public.app_role default 'waiter',
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;

-- Function: Get User's Organization ID (Performance Helper)
create or replace function public.get_my_org_id()
returns uuid
language sql
stable
security definer
as $$
  select org_id from public.profiles where id = auth.uid();
$$;

-- RLS Policies

-- Profiles: Users can see their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using ( id = auth.uid() );

-- Profiles: Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using ( id = auth.uid() );

-- Organizations: Users can view their own organization
create policy "Users can view own organization"
  on public.organizations for select
  using ( id = public.get_my_org_id() );

-- Trigger: Handle New User Signup (Owner Flow)
-- If metadata contains 'restaurant_name', create Org + Owner Profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  new_org_id uuid;
  restaurant_name text;
  full_name text;
begin
  restaurant_name := new.raw_user_meta_data->>'restaurant_name';
  full_name := new.raw_user_meta_data->>'full_name';

  -- If restaurant_name is present, this is an Owner signup
  if restaurant_name is not null then
    -- 1. Create Organization
    insert into public.organizations (name)
    values (restaurant_name)
    returning id into new_org_id;

    -- 2. Create Profile as Owner
    insert into public.profiles (id, org_id, role, full_name)
    values (new.id, new_org_id, 'owner', full_name);
  else
    -- Fallback for invited users (logic to be added later or handled via invite link)
    -- For now, just create a profile without org if not provided, or handle differently
    -- But since this is MVP Owner flow, we assume owner for now.
    insert into public.profiles (id, full_name)
    values (new.id, full_name);
  end if;

  return new;
end;
$$;

-- Trigger execution
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
