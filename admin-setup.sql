-- HL Preparation Admin Dashboard setup
-- Run this entire script in Supabase Dashboard > SQL Editor.
-- Then replace prabinrazz99@gmail.com below with the email used for the app account.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
drop policy if exists "admin users can read own admin row" on public.admin_users;
create policy "admin users can read own admin row" on public.admin_users
for select to authenticated using (user_id = auth.uid());

create table if not exists public.app_events (
  id bigint generated always as identity primary key,
  session_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  faculty text not null default 'home',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists app_events_created_at_idx on public.app_events(created_at desc);
create index if not exists app_events_user_id_idx on public.app_events(user_id);
create index if not exists app_events_session_id_idx on public.app_events(session_id);
alter table public.app_events enable row level security;
drop policy if exists "anyone can record app events" on public.app_events;
create policy "anyone can record app events" on public.app_events
for insert to anon, authenticated with check (
  length(session_id) between 1 and 100 and length(event_type) between 1 and 80
  and length(faculty) between 1 and 80
);
drop policy if exists "admins can read app events" on public.app_events;
create policy "admins can read app events" on public.app_events
for select to authenticated using (
  exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

create table if not exists public.admin_student_directory (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  last_sign_in_at timestamptz
);
alter table public.admin_student_directory enable row level security;
drop policy if exists "admins can read student directory" on public.admin_student_directory;
create policy "admins can read student directory" on public.admin_student_directory
for select to authenticated using (
  exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

create or replace function public.hlp_sync_auth_user_to_directory()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.admin_student_directory(user_id,email,display_name,created_at,last_sign_in_at)
  values(new.id,new.email,new.raw_user_meta_data->>'name',coalesce(new.created_at,now()),new.last_sign_in_at)
  on conflict(user_id) do update set email=excluded.email,display_name=excluded.display_name,last_sign_in_at=excluded.last_sign_in_at;
  return new;
end;
$$;
drop trigger if exists hlp_auth_user_directory_trigger on auth.users;
create trigger hlp_auth_user_directory_trigger
after insert or update of email,last_sign_in_at,raw_user_meta_data on auth.users
for each row execute function public.hlp_sync_auth_user_to_directory();

insert into public.admin_student_directory(user_id,email,display_name,created_at,last_sign_in_at)
select id,email,raw_user_meta_data->>'name',created_at,last_sign_in_at from auth.users
on conflict(user_id) do update set email=excluded.email,display_name=excluded.display_name,last_sign_in_at=excluded.last_sign_in_at;

-- Grant dashboard access ONLY to your own account after you have registered/logged in.
insert into public.admin_users(user_id,email)
select id,email from auth.users where lower(email)=lower('prabinrazz99@gmail.com')
on conflict(user_id) do update set email=excluded.email;

-- Verify the admin was added. If this returns 0 rows, create the app account first,
-- replace the email above, and run the INSERT block again.
select user_id,email,created_at from public.admin_users;
