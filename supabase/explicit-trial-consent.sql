-- Explicit-consent free trial migration.
-- Run AFTER membership.sql and fixed-membership-plans.sql in Supabase SQL Editor.
-- Existing memberships remain unchanged. New users must explicitly accept before a trial is created.

create or replace function public.start_membership_trial_with_consent(p_consent boolean)
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
  if p_consent is distinct from true then
    raise exception 'Please confirm that you want to start the free trial.';
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
  values (
    v_user_id, 'trial', 'trial', now(), now() + interval '7 days'
  )
  on conflict (user_id) do nothing;

  return query select * from public.memberships where user_id = v_user_id;
end;
$$;

-- Refresh expiry without starting or renewing a trial.
create or replace function public.refresh_membership_status()
returns setof public.memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Please login first.';
  end if;
  update public.memberships
  set status = 'expired', updated_at = now()
  where user_id = v_user_id
    and (
      (status = 'trial' and trial_ends_at <= now())
      or (membership_type = 'premium' and status = 'active' and paid_until is not null and paid_until <= now())
    );
  return query select * from public.memberships where user_id = v_user_id;
end;
$$;

revoke all on function public.refresh_membership_status() from public, anon;
grant execute on function public.refresh_membership_status() to authenticated;

-- Prevent browser clients from starting a trial through the old no-consent RPC.
revoke all on function public.start_membership_trial() from public, anon, authenticated;
grant execute on function public.start_membership_trial_with_consent(boolean) to authenticated;
revoke all on function public.start_membership_trial_with_consent(boolean) from public, anon;
