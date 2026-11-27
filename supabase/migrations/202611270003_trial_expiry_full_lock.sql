-- Trial-expiry full-lock policy for the faculty-aware content RPC.
-- Draft-only additive migration. Do not apply to production until the complete
-- faculty content migration and client rollout have passed non-production tests.
--
-- Policy:
--   active trial   -> Free + Trial rows
--   active premium -> Free + Trial + Premium rows
--   no membership, free, expired trial, expired premium, cancelled -> NO rows
--
-- This RPC policy alone does NOT secure content still bundled in public JS files.
-- All bundled/local fallbacks must be removed or converted to server-fetched content
-- before claiming that expired users are fully blocked.

create or replace function public.get_learning_content_by_faculty(
  p_faculty text,
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
set search_path = pg_catalog, public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_membership public.memberships%rowtype;
  v_tier text := 'blocked';
begin
  if v_user_id is null then
    raise exception 'Please login to access learning content.';
  end if;

  if p_faculty is null or btrim(p_faculty) = '' then
    raise exception 'A faculty is required to access learning content.';
  end if;

  select * into v_membership
  from public.memberships
  where user_id = v_user_id;

  if found then
    if v_membership.membership_type = 'premium'
       and v_membership.status = 'active'
       and (v_membership.paid_until is null or v_membership.paid_until > now()) then
      v_tier := 'premium';
    elsif v_membership.status = 'trial'
       and v_membership.trial_ends_at is not null
       and v_membership.trial_ends_at > now() then
      v_tier := 'trial';
    end if;
  end if;

  return query
  select lc.content_id, lc.faculty, lc.subject, lc.content_type,
         lc.access_tier, lc.display_order, lc.content_data
  from public.learning_content lc
  where lc.is_published = true
    and lc.faculty = p_faculty
    and (p_subject is null or lc.subject = p_subject)
    and (p_content_type is null or lc.content_type = p_content_type)
    and (
      (v_tier = 'trial' and lc.access_tier in ('free', 'trial'))
      or (v_tier = 'premium' and lc.access_tier in ('free', 'trial', 'premium'))
    )
  order by lc.subject, lc.content_type, lc.display_order;
end;
$$;

revoke all on function public.get_learning_content_by_faculty(text, text, text)
  from public, anon;
grant execute on function public.get_learning_content_by_faculty(text, text, text)
  to authenticated;

-- Required non-production tests before any production rollout:
-- 1. Anonymous: RPC rejects the request.
-- 2. Active Trial: only Free + Trial rows for the exact faculty are returned.
-- 3. Expired Trial: zero rows are returned for every faculty.
-- 4. Active Premium with valid paid_until: Free + Trial + Premium rows are returned.
-- 5. Expired Premium, cancelled, Free, or no membership: zero rows are returned.
-- 6. Wrong/unknown faculty: zero rows; identical subject names never cross faculties.
-- 7. Direct SELECT on learning_content remains denied to anon/authenticated.
-- 8. Confirm existing progress, bookmarks, and mock attempts are unchanged.
-- 9. Confirm no faculty module can fall back to bundled/local restricted content.
