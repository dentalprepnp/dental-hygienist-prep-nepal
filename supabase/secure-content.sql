-- Secure learning content access for Free / 7-day Trial / Premium members.
-- Run after supabase/membership.sql in Supabase SQL Editor.

create table if not exists public.learning_content (
  content_id text primary key,
  faculty text not null,
  subject text not null,
  content_type text not null check (content_type in ('mcq','mock','note')),
  access_tier text not null default 'premium'
    check (access_tier in ('free','trial','premium')),
  display_order integer not null default 0,
  content_data jsonb not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_content_subject_type_order_idx
  on public.learning_content (faculty, subject, content_type, display_order)
  where is_published = true;

alter table public.learning_content enable row level security;

-- Intentionally no browser SELECT/INSERT/UPDATE/DELETE policy.
-- Content is served only through the access-checking RPC below.
revoke all on public.learning_content from anon, authenticated;

create or replace function public.get_learning_content(
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
  v_tier text := 'free';
begin
  if v_user_id is null then
    raise exception 'Please login to access learning content.';
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
    and (p_subject is null or lc.subject = p_subject)
    and (p_content_type is null or lc.content_type = p_content_type)
    and (
      lc.access_tier = 'free'
      or (v_tier = 'trial' and lc.access_tier in ('free','trial'))
      or (v_tier = 'premium' and lc.access_tier in ('free','trial','premium'))
    )
  order by lc.faculty, lc.subject, lc.content_type, lc.display_order;
end;
$$;

revoke all on function public.get_learning_content(text,text) from public, anon;
grant execute on function public.get_learning_content(text,text) to authenticated;

-- Do not insert gateway secrets here. Payment-confirmation Edge Functions
-- will update memberships only after server-side eSewa/Khalti verification.
