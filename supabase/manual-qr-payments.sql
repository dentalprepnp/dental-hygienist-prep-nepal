-- Manual QR payment requests for Dental Hygienist Prep Nepal.
-- Run AFTER membership.sql, fixed-membership-plans.sql and explicit-trial-consent.sql.
-- Students can submit a reference number; only an existing admin_users member can approve.
-- Approval must happen only after checking the actual bank credit.

create table if not exists public.manual_payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text not null references public.membership_plans(plan_code),
  amount_paisa bigint not null check (amount_paisa > 0),
  transaction_reference text not null,
  payer_name text,
  payer_phone text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists manual_payment_reference_unique
  on public.manual_payment_requests (lower(transaction_reference));
create index if not exists manual_payment_requests_user_created_idx
  on public.manual_payment_requests (user_id, created_at desc);
create index if not exists manual_payment_requests_status_created_idx
  on public.manual_payment_requests (status, created_at desc);

alter table public.manual_payment_requests enable row level security;
drop policy if exists "Students read own manual payment requests" on public.manual_payment_requests;
create policy "Students read own manual payment requests"
  on public.manual_payment_requests for select to authenticated
  using (auth.uid() = user_id);

revoke insert, update, delete on public.manual_payment_requests from anon, authenticated;
grant select on public.manual_payment_requests to authenticated;

-- Set the agreed introductory prices: NPR 500 / 1,000 / 1,500 / 2,000.
update public.membership_plans set
  price_paisa = case plan_code
    when 'premium_30' then 50000
    when 'premium_90' then 100000
    when 'premium_180' then 150000
    when 'premium_365' then 200000
    else price_paisa
  end,
  is_available = case
    when plan_code in ('premium_30','premium_90','premium_180','premium_365') then true
    else is_available
  end,
  updated_at = now()
where plan_code in ('premium_30','premium_90','premium_180','premium_365');

create or replace function public.submit_manual_payment_request(
  p_plan_code text,
  p_transaction_reference text,
  p_payer_name text default null,
  p_payer_phone text default null
)
returns public.manual_payment_requests
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_verified_at timestamptz;
  v_plan public.membership_plans%rowtype;
  v_request public.manual_payment_requests%rowtype;
  v_reference text := nullif(trim(p_transaction_reference), '');
begin
  if v_user_id is null then raise exception 'कृपया पहिले Login गर्नुहोस्।'; end if;
  select email_confirmed_at into v_verified_at from auth.users where id = v_user_id;
  if v_verified_at is null then raise exception 'Payment request पठाउन Email verify गर्नुहोस्।'; end if;
  if v_reference is null or length(v_reference) < 4 or length(v_reference) > 120 then
    raise exception 'सही Transaction ID / Reference Number लेख्नुहोस्।';
  end if;
  select * into v_plan from public.membership_plans
    where plan_code = p_plan_code and is_available = true;
  if not found or v_plan.price_paisa is null then raise exception 'यो Premium Plan उपलब्ध छैन।'; end if;

  insert into public.manual_payment_requests
    (user_id, plan_code, amount_paisa, transaction_reference, payer_name, payer_phone)
  values
    (v_user_id, v_plan.plan_code, v_plan.price_paisa, v_reference,
     nullif(trim(p_payer_name), ''), nullif(trim(p_payer_phone), ''))
  returning * into v_request;
  return v_request;
exception when unique_violation then
  raise exception 'यो Transaction ID पहिले नै पठाइएको छ।';
end;
$$;

revoke all on function public.submit_manual_payment_request(text,text,text,text) from public, anon;
grant execute on function public.submit_manual_payment_request(text,text,text,text) to authenticated;

create or replace function public.review_manual_payment_request(
  p_request_id uuid,
  p_approve boolean,
  p_admin_note text default null
)
returns public.manual_payment_requests
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_admin_id uuid := auth.uid();
  v_request public.manual_payment_requests%rowtype;
  v_plan public.membership_plans%rowtype;
  v_membership public.memberships%rowtype;
  v_start timestamptz;
  v_end timestamptz;
begin
  if v_admin_id is null or not exists (
    select 1 from public.admin_users where user_id = v_admin_id
  ) then raise exception 'Admin अनुमति आवश्यक छ।'; end if;

  select * into v_request from public.manual_payment_requests
    where id = p_request_id for update;
  if not found then raise exception 'Payment request भेटिएन।'; end if;
  if v_request.status <> 'pending' then raise exception 'यो request पहिले नै review भइसकेको छ।'; end if;

  if not p_approve then
    update public.manual_payment_requests set status='rejected',
      admin_note=nullif(trim(p_admin_note),''), reviewed_by=v_admin_id, reviewed_at=now()
      where id=p_request_id returning * into v_request;
    return v_request;
  end if;

  select * into v_plan from public.membership_plans
    where plan_code=v_request.plan_code and is_available=true for share;
  if not found or v_plan.price_paisa <> v_request.amount_paisa then
    raise exception 'Plan वा रकम मिलेन।';
  end if;

  -- This approval is the manual bank-credit verification step.
  select * into v_membership from public.memberships
    where user_id=v_request.user_id for update;
  if found and v_membership.membership_type='premium'
     and v_membership.status='active' and v_membership.paid_until > now() then
    v_start := v_membership.paid_until;
  else
    v_start := now();
  end if;
  v_end := v_start + make_interval(days => v_plan.duration_days);

  insert into public.memberships
    (user_id,membership_type,status,paid_started_at,paid_until,active_plan_code,paid_duration_days,updated_at)
  values
    (v_request.user_id,'premium','active',v_start,v_end,v_plan.plan_code,v_plan.duration_days,now())
  on conflict (user_id) do update set
    membership_type='premium', status='active',
    paid_started_at=excluded.paid_started_at, paid_until=excluded.paid_until,
    active_plan_code=excluded.active_plan_code,
    paid_duration_days=excluded.paid_duration_days, updated_at=now();

  update public.manual_payment_requests set status='approved',
    admin_note=nullif(trim(p_admin_note),''), reviewed_by=v_admin_id, reviewed_at=now()
    where id=p_request_id returning * into v_request;
  return v_request;
end;
$$;

revoke all on function public.review_manual_payment_request(uuid,boolean,text) from public, anon, authenticated;
grant execute on function public.review_manual_payment_request(uuid,boolean,text) to authenticated;

-- Verify the four published prices.
select plan_code, duration_days, price_paisa, is_available
from public.membership_plans
where plan_code in ('premium_30','premium_90','premium_180','premium_365')
order by display_order;
