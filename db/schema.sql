-- INVAQUEST DATABASE SCHEMA
-- Run this in your Supabase SQL Editor

-- 1. Profiles Table (Public metadata for users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  level integer default 1,
  xp integer default 0,
  region text default 'ON',
  badges jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. Trigger to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, region)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'province', 'ON')
  );
  return new;
end;
$$;

-- Drop trigger if exists to allow updating logic
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Sightings Table
create table if not exists public.sightings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  species_id text not null, -- Maps to JSON data (e.g., 'phragmites')
  latitude double precision not null,
  longitude double precision not null,
  image_url text,
  description text,
  verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.sightings enable row level security;

create policy "Sightings are viewable by everyone."
  on sightings for select
  using ( true );

create policy "Authenticated users can insert sightings."
  on sightings for insert
  with check ( auth.uid() = user_id );

-- 4. Storage Bucket for Images (Optional for now, but good to have)
-- insert into storage.buckets (id, name, public) values ('sightings', 'sightings', true);
-- create policy "Public Access" on storage.objects for select using ( bucket_id = 'sightings' );
-- create policy "Auth Upload" on storage.objects for insert with check ( bucket_id = 'sightings' and auth.role() = 'authenticated' );
