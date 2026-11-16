-- Fixed-duration Premium plans and verified-payment activation.
-- Run in Supabase SQL Editor AFTER membership.sql.
-- Prices intentionally remain unset until Fonepay/eSewa/Khalti fees and final plan prices are confirmed.

create table if not exists public.membership_plans (
  plan_code text primary key,
  plan_name text not null,
  duration_days integer not null unique check (duration_days in (30,90,180,365)),
  price_paisa bigint,
  currency text not null default 'NPR' check (currency = 'NPR'),
  is_available boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_plan_price check (price_paisa is null or price_paisa > 0),
  constraint available_plan_has_price check (not is_available or price_paisa is not null)
);

insert into public.membership_plans (plan_code,plan_name,duration_days,price_paisa,is_available,display_order)
values
  ('premium_30','Premium – 30 Days',30,null,false,1),
  ('premium_90','Premium – 90 Days',90,null,false,2),
  ('premium_180','Premium – 180 Days',180,null,false,3),
  ('premium_365','Premium – 365 Days',365,null,false,4)
on conflict (plan_code) do update set
  plan_name=excluded.plan_name,
  duration_days=excluded.duration_days,
  display_order=excluded.display_order,
  updated_at=now();

alter table public.memberships
  add column if not exists active_plan_code text references public.membership_plans(plan_code),
  add column if not exists paid_duration_days integer;

alter table public.membership_payments
  add column if not exists plan_code text references public.membership_plans(plan_code);

alter table public.membership_payments
  drop constraint if exists membership_payments_provider_check;

alter table public.membership_payments
  add constraint membership_payments_provider_check
  check (provider in ('esewa','khalti','fonepay'));

alter table public.membership_plans enable row level security;
drop policy if exists "Students read available membership plans" on public.membership_plans;
create policy "Students read available membership plans" on public.membership_plans
  for select to authenticated using (is_available = true);
revoke insert, update, delete on public.membership_plans from anon, authenticated;
grant select on public.membership_plans to authenticated;

-- Expire elapsed Premium memberships on the next authenticated membership refresh.
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
  from auth.users where id = v_user_id;

  if v_verified_at is null then
    raise exception 'Please verify your email before starting the free trial.';
  end if;

  update public.memberships
  set status = 'expired', updated_at = now()
  where user_id = v_user_id
    and (
      (status = 'trial' and trial_ends_at <= now())
      or (membership_type = 'premium' and status = 'active' and paid_until is not null and paid_until <= now())
    );

  insert into public.memberships (
    user_id, membership_type, status, trial_started_at, trial_ends_at
  )
  values (v_user_id, 'trial', 'trial', now(), now() + interval '7 days')
  on conflict (user_id) do nothing;

  return query select * from public.memberships where user_id = v_user_id;
end;
$$;

revoke all on function public.start_membership_trial() from public;
grant execute on function public.start_membership_trial() to authenticated;

-- Call ONLY after a trusted Edge Function has independently verified the
-- provider transaction with Fonepay/eSewa/Khalti. This function does not
-- contact or trust the payment provider by itself.
create or replace function public.complete_verified_membership_payment(
  p_purchase_order_id text,
  p_provider_transaction_id text,
  p_provider_payload jsonb default '{}'::jsonb
)
returns public.memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.membership_payments%rowtype;
  v_plan public.membership_plans%rowtype;
  v_membership public.memberships%rowtype;
  v_start timestamptz;
  v_end timestamptz;
begin
  if auth.role() <> 'service_role' then
    raise exception 'Not authorized.';
  end if;
  if nullif(trim(p_purchase_order_id),'') is null
     or nullif(trim(p_provider_transaction_id),'') is null then
    raise exception 'Missing payment reference.';
  end if;

  select * into v_payment
  from public.membership_payments
  where purchase_order_id = p_purchase_order_id
  for update;

  if not found or v_payment.status <> 'pending' then
    raise exception 'Payment not found or is not pending.';
  end if;

  select * into v_plan
  from public.membership_plans
  where plan_code = v_payment.plan_code
    and is_available = true
  for share;

  if not found or v_plan.price_paisa is null
     or v_payment.amount_paisa <> v_plan.price_paisa then
    raise exception 'Plan or payment amount mismatch.';
  end if;

  update public.membership_payments
  set status = 'completed',
      provider_transaction_id = p_provider_transaction_id,
      provider_payload = coalesce(p_provider_payload,'{}'::jsonb),
      paid_at = now()
  where id = v_payment.id;

  select * into v_membership
  from public.memberships
  where user_id = v_payment.user_id
  for update;

  if found and v_membership.membership_type = 'premium'
     and v_membership.status = 'active'
     and v_membership.paid_until > now() then
    v_start := v_membership.paid_until;
    v_end := v_start + make_interval(days => v_plan.duration_days);
  else
    v_start := now();
    v_end := v_start + make_interval(days => v_plan.duration_days);
  end if;

  insert into public.memberships (
    user_id,membership_type,status,paid_started_at,paid_until,active_plan_code,paid_duration_days,updated_at
  )
  values (
    v_payment.user_id,'premium','active',v_start,v_end,v_plan.plan_code,v_plan.duration_days,now()
  )
  on conflict (user_id) do update set
    membership_type='premium',
    status='active',
    paid_started_at=excluded.paid_started_at,
    paid_until=excluded.paid_until,
    active_plan_code=excluded.active_plan_code,
    paid_duration_days=excluded.paid_duration_days,
    updated_at=now()
  returning * into v_membership;

  update public.membership_payments
  set membership_id = v_membership.id
  where id = v_payment.id;

  return v_membership;
end;
$$;

revoke all on function public.complete_verified_membership_payment(text,text,jsonb) from public, anon, authenticated;
grant execute on function public.complete_verified_membership_payment(text,text,jsonb) to service_role;

-- Verification: four fixed plans should exist; prices remain NULL and disabled
-- until official gateway approval and business pricing decisions are complete.
select plan_code, duration_days, price_paisa, is_available
from public.membership_plans
order by display_order;
