-- Align Premium plan prices with the approved app prices.
-- Supabase stores NPR amounts in paisa (100 paisa = NPR 1).
-- Run only after membership_plans exists. This migration changes prices only;
-- it does not activate memberships, alter trials, or change access permissions.

do $$
declare
  v_plan_count integer;
begin
  select count(*) into v_plan_count
  from public.membership_plans
  where plan_code in ('premium_30','premium_90','premium_180','premium_365');

  if v_plan_count <> 4 then
    raise exception 'Expected all 4 Premium plans before updating prices; found %.', v_plan_count;
  end if;
end;
$$;

update public.membership_plans
set price_paisa = case plan_code
  when 'premium_30' then 70000
  when 'premium_90' then 150000
  when 'premium_180' then 250000
  when 'premium_365' then 400000
end,
updated_at = now()
where plan_code in ('premium_30','premium_90','premium_180','premium_365');

select plan_code, duration_days, price_paisa, price_paisa / 100.0 as price_npr, is_available
from public.membership_plans
where plan_code in ('premium_30','premium_90','premium_180','premium_365')
order by display_order;
