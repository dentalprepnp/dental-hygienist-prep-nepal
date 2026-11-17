-- HL Preparation: secure payment database migration
-- Run in Supabase Dashboard > SQL Editor after reviewing the project schema.
-- This migration does NOT connect to Fonepay or activate any demo checkout.

begin;

-- Keep the duration used by the membership UI.
alter table public.memberships
  add column if not exists paid_duration_days integer;

-- Allow Fonepay payment records. Preserve existing eSewa/Khalti records.
alter table public.membership_payments
  drop constraint if exists membership_payments_provider_check;

alter table public.membership_payments
  add constraint membership_payments_provider_check
  check (provider in ('esewa', 'khalti', 'fonepay'));

create index if not exists membership_payments_status_created_idx
  on public.membership_payments (status, created_at desc);

-- This function is callable only by the trusted Supabase service role.
-- The Edge Function must call it ONLY after successful verification with Fonepay.
-- Plan amounts are rechecked here; the browser cannot choose an arbitrary duration.
create or replace function public.complete_verified_membership_payment(
  p_payment_id uuid,
  p_provider_transaction_id text
)
returns public.memberships
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_payment public.membership_payments%rowtype;
  v_membership public.memberships%rowtype;
  v_days integer;
begin
  if p_payment_id is null or nullif(trim(p_provider_transaction_id), '') is null then
    raise exception 'Payment reference is required.';
  end if;

  select * into v_payment
  from public.membership_payments
  where id = p_payment_id
  for update;

  if not found then
    raise exception 'Payment record not found.';
  end if;

  if v_payment.provider <> 'fonepay' then
    raise exception 'Unsupported payment provider.';
  end if;

  -- Idempotency: never extend a membership twice for the same payment.
  if v_payment.status = 'completed' then
    select * into v_membership
    from public.memberships
    where user_id = v_payment.user_id;
    return v_membership;
  end if;

  if v_payment.status <> 'pending' then
    raise exception 'Payment is not pending.';
  end if;

  v_days := case v_payment.amount_paisa
    when 50000 then 30
    when 100000 then 90
    when 150000 then 180
    when 200000 then 365
    else null
  end;

  if v_days is null then
    raise exception 'Payment amount does not match an available plan.';
  end if;

  if exists (
    select 1 from public.membership_payments
    where provider = 'fonepay'
      and provider_transaction_id = p_provider_transaction_id
      and id <> p_payment_id
  ) then
    raise exception 'This provider transaction has already been used.';
  end if;

  update public.membership_payments
  set status = 'completed',
      provider_transaction_id = p_provider_transaction_id,
      paid_at = now()
  where id = p_payment_id;

  insert into public.memberships (
    user_id, membership_type, status, paid_started_at, paid_until, paid_duration_days
  )
  values (
    v_payment.user_id, 'premium', 'active', now(),
    now() + make_interval(days => v_days), v_days
  )
  on conflict (user_id) do update
  set membership_type = 'premium',
      status = 'active',
      paid_started_at = case
        when public.memberships.paid_until > now()
          then public.memberships.paid_started_at
        else now()
      end,
      paid_until = greatest(coalesce(public.memberships.paid_until, now()), now())
        + make_interval(days => v_days),
      paid_duration_days = v_days,
      updated_at = now()
  returning * into v_membership;

  return v_membership;
end;
$$;

revoke all on function public.complete_verified_membership_payment(uuid, text) from public;
revoke all on function public.complete_verified_membership_payment(uuid, text) from anon;
revoke all on function public.complete_verified_membership_payment(uuid, text) from authenticated;
grant execute on function public.complete_verified_membership_payment(uuid, text) to service_role;

commit;

-- IMPORTANT:
-- 1. Never expose the Supabase service_role key or Fonepay secret in browser code.
-- 2. Only a deployed Edge Function may create payment orders and verify provider responses.
-- 3. Do not call complete_verified_membership_payment from the client.
-- 4. Do not treat the frontend Demo Checkout as a real or successful payment.
