-- Dental Hygienist Prep Nepal: Supabase database setup
-- Run this entire file once in Supabase Dashboard > SQL Editor.
-- Public study content remains public. These tables store only each student's own records.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  target_exam text not null default 'NHPC' check (target_exam in ('NHPC','DHA','Loksewa')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Admin roles are deliberately separate from profiles. Students cannot grant themselves admin.
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  progress_key text not null,
  progress_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, progress_key)
);

create table if not exists public.mock_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_track text not null default 'NHPC',
  subject text not null,
  score integer not null check (score >= 0),
  total integer not null check (total > 0 and score <= total),
  completed_at timestamptz not null default now()
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_key text not null,
  item_type text not null check (item_type in ('note','question')),
  item_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, item_key)
);

create table if not exists public.wrong_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_key text not null,
  exam_track text not null default 'NHPC',
  subject text not null,
  question_data jsonb not null,
  last_answered_at timestamptz not null default now(),
  times_wrong integer not null default 1 check (times_wrong > 0),
  unique (user_id, item_key)
);

create index if not exists mock_attempts_user_date_idx
  on public.mock_attempts (user_id, completed_at desc);
create index if not exists wrong_answers_user_date_idx
  on public.wrong_answers (user_id, last_answered_at desc);

-- Automatically create a basic profile whenever a new account is registered.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_progress enable row level security;
alter table public.mock_attempts enable row level security;
alter table public.bookmarks enable row level security;
alter table public.wrong_answers enable row level security;

-- A signed-in student can read and edit only their own profile.
drop policy if exists "Students read own profile" on public.profiles;
create policy "Students read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
drop policy if exists "Students update own profile" on public.profiles;
create policy "Students update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Students can only see their own role row; role assignment is performed by project owner in SQL.
drop policy if exists "Users read own role" on public.user_roles;
create policy "Users read own role" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

-- Each student's private learning records are isolated by user_id.
drop policy if exists "Own progress only" on public.user_progress;
create policy "Own progress only" on public.user_progress
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Own mock attempts only" on public.mock_attempts;
create policy "Own mock attempts only" on public.mock_attempts
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Own bookmarks only" on public.bookmarks;
create policy "Own bookmarks only" on public.bookmarks
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Own wrong answers only" on public.wrong_answers;
create policy "Own wrong answers only" on public.wrong_answers
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- IMPORTANT: after the owner creates their account, assign the first admin manually:
-- insert into public.user_roles (user_id, role)
-- select id, 'admin' from auth.users where email = 'YOUR-ADMIN-EMAIL';
-- Never add a service_role key to frontend code or this repository.
