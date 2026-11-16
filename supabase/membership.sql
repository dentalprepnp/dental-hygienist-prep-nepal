-- Membership foundation for Dental Hygienist Prep Nepal
-- Run this file in Supabase Dashboard > SQL Editor.
-- Safe to run again. Students cannot write membership or payment rows directly.

create extension if not exists pgcrypto;

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  membership_type text not null default 'trial'
    check (membership_type in ('trial','premium')),
  status text not null default 'trial'
    check (status in ('trial','active','expired','cancelled')),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  paid_started_at timestamptz,
  paid_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_trial_window check (
    trial_ends_at is null or trial_started_at is null or trial_ends_at > trial_started_at
  )
);

create table if not exists public.membership_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  membership_id uuid references public.memberships(id) on delete set null,
  provider text not null check (provider in ('esewa','khalti')),
  purchase_order_id text not null unique,
  provider_transaction_id text,
  amount_paisa bigint not null check (amount_paisa > 0),
  currency text not null default 'NPR' check (currency = 'NPR'),
  status text not null default 'pending'
    check (status in ('pending','completed','failed','refunded')),
  provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  unique (provider, provider_transaction_id)
);

create index if not exists memberships_status_expiry_idx
  on public.memberships (status, trial_ends_at, paid_until);
create index if not exists membership_payments_user_created_idx
  on public.membership_payments (user_id, created_at desc);

alter table public.memberships enable row level security;
alter table public.membership_payments enable row level security;

drop policy if exists "Students read own membership" on public.memberships;
create policy "Students read own membership" on public.memberships
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Students read own payment history" on public.membership_payments;
create policy "Students read own payment history" on public.membership_payments
  for select to authenticated using (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies are granted to browser clients.
-- Only this verified-account function starts a one-time 7-day trial.
create or replace function public.start_membership_trial()
returns setof public.memberships
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_verified_at timestamptz;
begin
  if v_user_id is null then
    raise exception 'Please login first.';
  end if;

  select email_confirmed_at into v_verified_at
  from auth.users
  where id = v_user_id;

  if v_verified_at is null then
    raise exception 'Please verify your email before starting the free trial.';
  end if;

  update public.memberships
  set status = 'expired', updated_at = now()
  where user_id = v_user_id
    and status = 'trial'
    and trial_ends_at <= now();

  insert into public.memberships (
    user_id, membership_type, status, trial_started_at, trial_ends_at
  )
  values (
    v_user_id, 'trial', 'trial', now(), now() + interval '7 days'
  )
  on conflict (user_id) do nothing;

  return query
  select * from public.memberships where user_id = v_user_id;
end;
$$;

revoke all on function public.start_membership_trial() from public;
grant execute on function public.start_membership_trial() to authenticated;

-- Payment status and premium activation will be written only by trusted
-- Supabase Edge Functions after eSewa/Khalti server-side verification.
-- Never add gateway secrets or Supabase secret/service-role keys to frontend code.
