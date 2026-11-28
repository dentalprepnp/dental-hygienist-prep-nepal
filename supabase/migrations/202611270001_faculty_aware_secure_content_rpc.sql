-- Faculty-aware secure content RPC.
-- Additive migration: keeps the existing get_learning_content(text,text) RPC intact.
-- Apply only after reviewing the faculty/subject values and testing in a non-production
-- Supabase project. This migration does not move, delete, or update learning content.

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
  v_tier text := 'free';
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
      lc.access_tier = 'free'
      or (v_tier = 'trial' and lc.access_tier in ('free', 'trial'))
      or (v_tier = 'premium' and lc.access_tier in ('free', 'trial', 'premium'))
    )
  order by lc.subject, lc.content_type, lc.display_order;
end;
$$;

revoke all on function public.get_learning_content_by_faculty(text, text, text)
  from public, anon;
grant execute on function public.get_learning_content_by_faculty(text, text, text)
  to authenticated;

-- Verification after applying in a test project:
-- 1. Anonymous request: RPC must fail with "Please login".
-- 2. Signed-in Free user: only published Free rows for the exact faculty.
-- 3. Active Trial user: published Free + Trial rows for the exact faculty.
-- 4. Active Premium user with valid paid_until: all three tiers for the exact faculty.
-- 5. Expired Trial/Premium user: Free rows only.
-- 6. A different faculty with an identically named subject must never appear.
-- 7. Direct SELECT from learning_content as anon/authenticated must remain denied.
-- Do not remove local fallbacks or change client RPC calls until these tests pass
-- and all existing content has been safely migrated to learning_content.
