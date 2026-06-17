-- =====================================================
-- FIX: "Database error saving new user" on sign up
-- =====================================================
-- Cause: a trigger on auth.users (the standard handle_new_user
-- pattern) inserts into public.profiles and throws, which rolls
-- back the whole auth.users insert -> GoTrue returns HTTP 500
-- "Database error saving new user".
--
-- This script makes the profile bootstrap robust:
--   * ensures the profiles table + columns exist
--   * recreates handle_new_user() as SECURITY DEFINER (bypasses RLS)
--   * wraps it so a profile failure can NEVER block auth signup
--   * ON CONFLICT DO NOTHING so it coexists with the app's own insert
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- =====================================================

-- 1. Make sure the table exists with the columns the app uses.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  full_name text,
  location text,
  region text,
  district text,
  farm_size text,
  crops text[] default '{}',
  preferred_language text default 'en',
  avatar_url text,
  notification_preferences jsonb default '{"push": true, "sms": false, "email": false}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- If an older profiles table exists, make sure the columns are present.
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists preferred_language text default 'en';

-- NOTE: a UNIQUE constraint on phone makes >1 user with an empty phone
-- collide. Keep phone non-unique (drop the constraint if you added one):
--   alter table public.profiles drop constraint if exists profiles_phone_key;

-- 2. Row Level Security + policies (idempotent).
alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- 3. Robust trigger function. SECURITY DEFINER bypasses RLS; the
--    exception handler guarantees signup never fails on profile errors.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, location, preferred_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'location', ''),
    'en'
  )
  on conflict (id) do nothing;
  return new;
exception
  when others then
    raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
    return new;  -- do not block auth signup
end;
$$;

-- 4. Recreate the trigger cleanly.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- If signup still fails after this, an OLD trigger with a
-- different name is the culprit. List them with:
--
--   select tgname, proname
--   from pg_trigger t
--   join pg_proc p on p.oid = t.tgfoid
--   where t.tgrelid = 'auth.users'::regclass and not t.tgisinternal;
--
-- then: drop trigger <tgname> on auth.users;
-- =====================================================
