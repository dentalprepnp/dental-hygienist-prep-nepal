-- BMLT NHPC Licensing content loader setup
-- Run once in Supabase Dashboard > SQL Editor.
-- Existing BMLT batch files insert rows into public.learning_content.
begin;

create table if not exists public.learning_content (
  content_id text primary key,
  faculty text not null,
  subject text not null,
  content_type text not null check (content_type in ('note','mcq','mock')),
  access_tier text not null default 'free',
  display_order integer not null default 0,
  content_data jsonb not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists learning_content_subject_type_order_idx
  on public.learning_content (subject, content_type, display_order)
  where is_published = true;

alter table public.learning_content enable row level security;

drop policy if exists "Authenticated students read published free learning content"
  on public.learning_content;
create policy "Authenticated students read published free learning content"
  on public.learning_content
  for select to authenticated
  using (is_published = true and access_tier = 'free');

create or replace function public.get_learning_content(
  p_subject text,
  p_content_type text default null
)
returns table (
  content_type text,
  display_order integer,
  content_data jsonb
)
language sql
stable
security definer
set search_path = public
as $function$
  select lc.content_type, lc.display_order, lc.content_data
  from public.learning_content as lc
  where lc.subject = p_subject
    and lc.is_published = true
    and lc.access_tier = 'free'
    and (p_content_type is null or lc.content_type = p_content_type)
  order by lc.display_order asc, lc.content_id asc;
$function$;

revoke all on function public.get_learning_content(text, text) from public;
grant execute on function public.get_learning_content(text, text) to authenticated;

commit;

-- Verify imported BMLT content after running:
select content_type, count(*) as total
from public.learning_content
where faculty = 'BMLT'
  and subject = 'BMLT NHPC Licensing'
  and is_published = true
group by content_type
order by content_type;
