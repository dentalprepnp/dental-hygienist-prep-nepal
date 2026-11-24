-- Update Premium prices to the newly agreed rates.
-- Run once in Supabase SQL Editor.
-- Existing pending payment requests keep their original recorded amount.

update public.membership_plans
set price_paisa = case plan_code
  when 'premium_30' then 70000
  when 'premium_90' then 150000
  when 'premium_180' then 250000
  when 'premium_365' then 400000
  else price_paisa
end,
is_available = true,
updated_at = now()
where plan_code in ('premium_30','premium_90','premium_180','premium_365');

-- Preserve historical pending requests at the amount stored when they were submitted.
-- New requests always take the current plan price in submit_manual_payment_request().
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
  if not found then
    raise exception 'यो Premium Plan उपलब्ध छैन।';
  end if;

  -- The request amount is a server-created snapshot; do not compare it to the
  -- current plan price, so older pending requests remain reviewable.
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

select plan_code, duration_days, price_paisa, is_available
from public.membership_plans
where plan_code in ('premium_30','premium_90','premium_180','premium_365')
order by display_order;
