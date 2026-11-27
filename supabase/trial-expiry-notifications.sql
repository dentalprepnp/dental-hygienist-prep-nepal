-- Membership expiry notification queue.
-- Apply only after reviewing the staged rollout. Service-role only; no student access.

begin;

create table if not exists public.membership_notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  membership_id uuid not null references public.memberships(id) on delete cascade,
  notification_type text not null check (notification_type in (
    'trial_reminder', 'trial_expired', 'premium_reminder', 'premium_expired'
  )),
  period_end timestamptz not null,
  email text not null,
  display_name text not null default '',
  status text not null default 'pending'
    check (status in ('pending','sending','sent','failed')),
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (user_id, notification_type, period_end)
);

create index if not exists membership_notification_pending_idx
  on public.membership_notification_log (status, created_at);

alter table public.membership_notification_log enable row level security;
revoke all on public.membership_notification_log from public, anon, authenticated;
grant all on public.membership_notification_log to service_role;

create or replace function public.enqueue_membership_expiry_notifications()
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_count integer := 0;
begin
  if auth.role() <> 'service_role' then
    raise exception 'Service role required.';
  end if;

  insert into public.membership_notification_log
    (user_id, membership_id, notification_type, period_end, email, display_name)
  select m.user_id, m.id, x.notification_type, x.period_end, u.email,
         coalesce(nullif(u.raw_user_meta_data->>'name',''), '')
  from public.memberships m
  join auth.users u on u.id = m.user_id
  cross join lateral (
    select 'trial_reminder'::text as notification_type, m.trial_ends_at as period_end
    where m.membership_type = 'trial' and m.status = 'trial'
      and m.trial_ends_at > now() and m.trial_ends_at <= now() + interval '24 hours'
    union all
    select 'trial_expired', m.trial_ends_at
    where m.membership_type = 'trial' and m.trial_ends_at is not null
      and m.trial_ends_at <= now() and m.status in ('trial','expired')
    union all
    select 'premium_reminder', m.paid_until
    where m.membership_type = 'premium' and m.status = 'active'
      and m.paid_until is not null and m.paid_until > now()
      and m.paid_until <= now() + interval '24 hours'
    union all
    select 'premium_expired', m.paid_until
    where m.membership_type = 'premium' and m.paid_until is not null
      and m.paid_until <= now() and m.status in ('active','expired')
  ) x
  where u.email is not null and u.email <> ''
  on conflict (user_id, notification_type, period_end) do nothing;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.claim_membership_expiry_notifications()
returns table (
  id uuid,
  email text,
  display_name text,
  notification_type text,
  period_end timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'Service role required.';
  end if;

  return query
  with picked as (
    select q.id
    from public.membership_notification_log q
    where q.status in ('pending','failed')
       or (q.status = 'sending' and q.updated_at < now() - interval '20 minutes')
    order by q.created_at
    limit 100
    for update skip locked
  )
  update public.membership_notification_log q
     set status = 'sending',
         attempts = q.attempts + 1,
         updated_at = now(),
         last_error = null
    from picked
   where q.id = picked.id
  returning q.id, q.email, q.display_name, q.notification_type, q.period_end;
end;
$$;

revoke all on function public.enqueue_membership_expiry_notifications() from public, anon, authenticated;
revoke all on function public.claim_membership_expiry_notifications() from public, anon, authenticated;
grant execute on function public.enqueue_membership_expiry_notifications() to service_role;
grant execute on function public.claim_membership_expiry_notifications() to service_role;

commit;
