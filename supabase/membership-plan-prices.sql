-- Dental Prep Nepal: final Premium plan prices (NPR).
-- Run once in Supabase SQL Editor. Prices are stored in paisa.
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
insert into public.membership_plans
  (plan_code,plan_name,duration_days,price_paisa,is_available,display_order)
values
  ('premium_30','Premium – 1 Month',30,50000,true,1),
  ('premium_90','Premium – 3 Months',90,100000,true,2),
  ('premium_180','Premium – 6 Months',180,150000,true,3),
  ('premium_365','Premium – 1 Year',365,200000,true,4)
on conflict (plan_code) do update set
  plan_name=excluded.plan_name,
  duration_days=excluded.duration_days,
  price_paisa=excluded.price_paisa,
  is_available=excluded.is_available,
  display_order=excluded.display_order,
  updated_at=now();

select plan_code,duration_days,price_paisa,is_available
from public.membership_plans order by display_order;
