-- Enforce one shared 7-day trial / active Premium gate for secure learning_content.
-- Run AFTER membership.sql, explicit-trial-consent.sql, and bmlt-content-loader-setup.sql.
-- Students must have a currently valid trial or Premium membership to fetch any
-- published learning_content row. Admins in public.admin_users may inspect all rows.
begin;

alter table public.learning_content enable row level security;

-- Browser clients must use the checked RPC, not query the table directly.
revoke select on table public.learning_content from anon, authenticated;

create or replace function public.get_learning_content(
  p_subject text,
  p_content_type text default null
)
returns table (
  content_type text,
  display_order integer,
  content_data jsonb
)
language plpgsql
stable
security definer
set search_path = public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_is_admin boolean := false;
  v_has_access boolean := false;
begin
  if v_user_id is null then
    raise exception 'Please login first.';
  end if;

  select exists (
    select 1 from public.admin_users au where au.user_id = v_user_id
  ) into v_is_admin;

  if not v_is_admin then
    select exists (
      select 1
      from public.memberships m
      where m.user_id = v_user_id
        and (
          (m.membership_type = 'trial'
            and m.status = 'trial'
            and m.trial_ends_at is not null
            and m.trial_ends_at > now())
          or
          (m.membership_type = 'premium'
            and m.status = 'active'
            and m.paid_until is not null
            and m.paid_until > now())
        )
    ) into v_has_access;

    if not v_has_access then
      raise exception 'Your trial has ended. Please activate Premium membership to continue.';
    end if;
  end if;

  return query
  select lc.content_type, lc.display_order, lc.content_data
  from public.learning_content lc
  where lc.subject = p_subject
    and lc.is_published = true
    and (p_content_type is null or lc.content_type = p_content_type)
  order by lc.display_order asc, lc.content_id asc;
end;
$function$;

revoke all on function public.get_learning_content(text, text) from public, anon;
grant execute on function public.get_learning_content(text, text) to authenticated;

commit;

-- Quick verification (run separately after commit):
-- select public.get_learning_content('BMLT NHPC Licensing', null);
-- A student without an active trial/Premium should receive the expiry exception.
