-- Strict membership-only access for ALL faculty content.
-- Non-destructive: does not delete learning_content, memberships, progress,
-- bookmarks, mock attempts, or payment history.
-- Run only after reviewing the faculty loader migration plan.

begin;

-- Remove any legacy browser SELECT policies, including the older BMLT free policy.
do $$
declare p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'learning_content'
  loop
    execute format('drop policy if exists %I on public.learning_content', p.policyname);
  end loop;
end $$;

alter table public.learning_content enable row level security;
revoke all on table public.learning_content from anon, authenticated;

-- Remove browser access to older RPCs that may return free content without
-- checking an active membership. Keep the table and its rows untouched.
revoke all on function public.get_learning_content(text,text) from public, anon, authenticated;

create or replace function public.get_membership_learning_content(
  p_faculty text default null,
  p_subject text default null,
  p_content_type text default null
)
returns table (
  content_id text,
  faculty text,
  subject text,
  content_type text,
  access_tier text,
  display_order integer,
  content_data jsonb
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_membership public.memberships%rowtype;
  v_allowed boolean := false;
begin
  if v_user_id is null then
    raise exception 'Login is required to study.';
  end if;

  select m.* into v_membership
  from public.memberships m
  where m.user_id = v_user_id;

  if found then
    v_allowed :=
      (v_membership.membership_type = 'trial'
       and v_membership.status = 'trial'
       and v_membership.trial_ends_at is not null
       and v_membership.trial_ends_at > now())
      or
      (v_membership.membership_type = 'premium'
       and v_membership.status = 'active'
       and v_membership.paid_until is not null
       and v_membership.paid_until > now());
  end if;

  if not v_allowed then
    raise exception 'Your study access period has ended. Renew your membership to continue.';
  end if;

  return query
  select lc.content_id, lc.faculty, lc.subject, lc.content_type,
         lc.access_tier, lc.display_order, lc.content_data
  from public.learning_content lc
  where lc.is_published = true
    and (p_faculty is null or lc.faculty = p_faculty)
    and (p_subject is null or lc.subject = p_subject)
    and (p_content_type is null or lc.content_type = p_content_type)
  order by lc.faculty, lc.subject, lc.content_type, lc.display_order, lc.content_id;
end;
$$;

revoke all on function public.get_membership_learning_content(text,text,text)
  from public, anon;
grant execute on function public.get_membership_learning_content(text,text,text)
  to authenticated;

commit;

-- Verification: old users with no active trial/premium should receive an
-- access-denied exception from the new RPC. Existing records remain intact.
