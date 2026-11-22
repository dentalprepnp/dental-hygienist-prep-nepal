-- Weekly Live Exam foundation (additive migration)
-- Apply in Supabase SQL Editor only after reviewing the project backup.
-- This migration creates new tables/functions; it does not alter or delete legacy learning data.

create extension if not exists pgcrypto;

-- Resolve admins using the existing admin_users membership table and/or user_roles.
-- Dynamic SQL keeps this helper compatible if one of the legacy tables is absent.
create or replace function public.hlp_is_live_exam_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  allowed boolean := false;
begin
  if auth.uid() is null then return false; end if;

  begin
    execute 'select exists (select 1 from public.admin_users where user_id = $1)'
      into allowed using auth.uid();
    if allowed then return true; end if;
  exception when undefined_table or undefined_column then
    null;
  end;

  begin
    execute 'select exists (select 1 from public.user_roles where user_id = $1 and role = ''admin'')'
      into allowed using auth.uid();
    if allowed then return true; end if;
  exception when undefined_table or undefined_column then
    null;
  end;

  return false;
end;
$$;

revoke all on function public.hlp_is_live_exam_admin() from public;
grant execute on function public.hlp_is_live_exam_admin() to authenticated;

create table if not exists public.live_exam_faculties (
  faculty_code text primary key check (faculty_code ~ '^[A-Z0-9]{2,10}$'),
  faculty_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.live_exam_question_bank (
  question_id uuid primary key default gen_random_uuid(),
  faculty_code text not null references public.live_exam_faculties(faculty_code),
  subject text not null,
  topic text not null default '',
  difficulty text not null default 'medium' check (difficulty in ('easy','medium','hard')),
  question_en text not null,
  question_ne text,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option char(1) not null check (correct_option in ('A','B','C','D')),
  explanation_en text not null default '',
  explanation_ne text,
  source_note text,
  status text not null default 'draft' check (status in ('draft','approved','archived')),
  created_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.live_exams (
  exam_id uuid primary key default gen_random_uuid(),
  faculty_code text not null references public.live_exam_faculties(faculty_code),
  exam_year integer not null,
  exam_month integer not null check (exam_month between 1 and 12),
  week_number integer not null check (week_number between 1 and 4),
  title text not null,
  starts_at timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes between 1 and 180),
  question_count integer not null default 50 check (question_count between 1 and 300),
  marks_per_question numeric(6,2) not null default 1 check (marks_per_question > 0),
  negative_marks numeric(6,2) not null default 0 check (negative_marks >= 0),
  pass_marks numeric(8,2) not null default 25 check (pass_marks >= 0),
  status text not null default 'draft' check (status in ('draft','scheduled','live','closed','results_published','cancelled')),
  created_by uuid references auth.users(id) on delete set null,
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (faculty_code, exam_year, exam_month, week_number)
);

create table if not exists public.live_exam_paper_questions (
  exam_id uuid not null references public.live_exams(exam_id) on delete cascade,
  question_id uuid not null references public.live_exam_question_bank(question_id) on delete restrict,
  question_order integer not null check (question_order > 0),
  marks numeric(6,2) not null default 1 check (marks > 0),
  primary key (exam_id, question_id),
  unique (exam_id, question_order)
);

create table if not exists public.live_exam_registrations (
  registration_id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.live_exams(exam_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol_number text not null,
  registered_at timestamptz not null default now(),
  unique (exam_id, user_id),
  unique (exam_id, symbol_number)
);

create table if not exists public.live_exam_attempts (
  attempt_id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.live_exams(exam_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  deadline_at timestamptz not null,
  submitted_at timestamptz,
  status text not null default 'in_progress' check (status in ('in_progress','submitted','auto_submitted')),
  created_at timestamptz not null default now(),
  unique (exam_id, user_id),
  check (deadline_at > started_at)
);

create table if not exists public.live_exam_answers (
  attempt_id uuid not null references public.live_exam_attempts(attempt_id) on delete cascade,
  question_id uuid not null references public.live_exam_question_bank(question_id) on delete restrict,
  selected_option char(1) check (selected_option in ('A','B','C','D')),
  marked_for_review boolean not null default false,
  saved_at timestamptz not null default now(),
  primary key (attempt_id, question_id)
);

create table if not exists public.live_exam_results (
  result_id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.live_exams(exam_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_id uuid not null unique references public.live_exam_attempts(attempt_id) on delete cascade,
  student_name text not null default '',
  symbol_number text not null,
  obtained_marks numeric(8,2) not null default 0,
  total_marks numeric(8,2) not null,
  percentage numeric(6,2) not null default 0,
  correct_count integer not null default 0,
  incorrect_count integer not null default 0,
  unanswered_count integer not null default 0,
  subject_analysis jsonb not null default '{}'::jsonb,
  passed boolean not null default false,
  rank_number integer,
  is_published boolean not null default false,
  calculated_at timestamptz not null default now(),
  unique (exam_id, user_id),
  check (total_marks > 0),
  check (percentage between 0 and 100)
);

create index if not exists live_exam_schedule_idx on public.live_exams (starts_at, status);
create index if not exists live_exam_faculty_schedule_idx on public.live_exams (faculty_code, starts_at desc);
create index if not exists live_exam_question_lookup_idx on public.live_exam_question_bank (faculty_code, subject, status);
create index if not exists live_exam_registration_user_idx on public.live_exam_registrations (user_id, registered_at desc);
create index if not exists live_exam_results_admin_idx on public.live_exam_results (exam_id, passed, rank_number);

alter table public.live_exam_faculties enable row level security;
alter table public.live_exam_question_bank enable row level security;
alter table public.live_exams enable row level security;
alter table public.live_exam_paper_questions enable row level security;
alter table public.live_exam_registrations enable row level security;
alter table public.live_exam_attempts enable row level security;
alter table public.live_exam_answers enable row level security;
alter table public.live_exam_results enable row level security;

-- Publicly readable faculty labels; changes remain admin-only.
drop policy if exists "Live exam faculty read" on public.live_exam_faculties;
create policy "Live exam faculty read" on public.live_exam_faculties
  for select to anon, authenticated using (is_active or public.hlp_is_live_exam_admin());
drop policy if exists "Live exam faculty admin manage" on public.live_exam_faculties;
create policy "Live exam faculty admin manage" on public.live_exam_faculties
  for all to authenticated using (public.hlp_is_live_exam_admin()) with check (public.hlp_is_live_exam_admin());

-- Question bank and answer keys are admin-only; students receive sanitized questions later via a secure RPC.
drop policy if exists "Live exam question bank admin only" on public.live_exam_question_bank;
create policy "Live exam question bank admin only" on public.live_exam_question_bank
  for all to authenticated using (public.hlp_is_live_exam_admin()) with check (public.hlp_is_live_exam_admin());

drop policy if exists "Live exams published read" on public.live_exams;
create policy "Live exams published read" on public.live_exams
  for select to authenticated using (status in ('scheduled','live','closed','results_published') or public.hlp_is_live_exam_admin());
drop policy if exists "Live exams admin manage" on public.live_exams;
create policy "Live exams admin manage" on public.live_exams
  for all to authenticated using (public.hlp_is_live_exam_admin()) with check (public.hlp_is_live_exam_admin());

drop policy if exists "Live exam paper admin only" on public.live_exam_paper_questions;
create policy "Live exam paper admin only" on public.live_exam_paper_questions
  for all to authenticated using (public.hlp_is_live_exam_admin()) with check (public.hlp_is_live_exam_admin());

drop policy if exists "Own live exam registrations read" on public.live_exam_registrations;
create policy "Own live exam registrations read" on public.live_exam_registrations
  for select to authenticated using (auth.uid() = user_id or public.hlp_is_live_exam_admin());
drop policy if exists "Live exam registrations admin read" on public.live_exam_registrations;
create policy "Live exam registrations admin read" on public.live_exam_registrations
  for all to authenticated using (public.hlp_is_live_exam_admin()) with check (public.hlp_is_live_exam_admin());

drop policy if exists "Own live exam attempts read" on public.live_exam_attempts;
create policy "Own live exam attempts read" on public.live_exam_attempts
  for select to authenticated using (auth.uid() = user_id or public.hlp_is_live_exam_admin());
drop policy if exists "Live exam attempts admin manage" on public.live_exam_attempts;
create policy "Live exam attempts admin manage" on public.live_exam_attempts
  for all to authenticated using (public.hlp_is_live_exam_admin()) with check (public.hlp_is_live_exam_admin());

drop policy if exists "Own live exam answers read" on public.live_exam_answers;
create policy "Own live exam answers read" on public.live_exam_answers
  for select to authenticated using (
    exists (select 1 from public.live_exam_attempts a where a.attempt_id = live_exam_answers.attempt_id and a.user_id = auth.uid())
    or public.hlp_is_live_exam_admin()
  );
drop policy if exists "Live exam answers admin manage" on public.live_exam_answers;
create policy "Live exam answers admin manage" on public.live_exam_answers
  for all to authenticated using (public.hlp_is_live_exam_admin()) with check (public.hlp_is_live_exam_admin());

drop policy if exists "Own published live exam results read" on public.live_exam_results;
create policy "Own published live exam results read" on public.live_exam_results
  for select to authenticated using ((auth.uid() = user_id and is_published) or public.hlp_is_live_exam_admin());
drop policy if exists "Live exam results admin manage" on public.live_exam_results;
create policy "Live exam results admin manage" on public.live_exam_results
  for all to authenticated using (public.hlp_is_live_exam_admin()) with check (public.hlp_is_live_exam_admin());

-- Student registration + symbol assignment is atomic and server-generated.
-- The caller can only register themselves; the serial counter is stored in the exam row.
alter table public.live_exams
  add column if not exists next_symbol_number integer not null default 1;

create or replace function public.hlp_register_live_exam(p_exam_id uuid)
returns table(registration_id uuid, symbol_number text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_exam public.live_exams%rowtype;
  v_registration public.live_exam_registrations%rowtype;
  v_faculty_code text;
  v_serial integer;
begin
  if v_user is null then raise exception 'Authentication required'; end if;

  select * into v_exam
  from public.live_exams
  where exam_id = p_exam_id
    and status in ('scheduled','live')
  for update;

  if not found then raise exception 'Exam is not open for registration'; end if;

  select * into v_registration
  from public.live_exam_registrations
  where exam_id = p_exam_id and user_id = v_user;

  if found then
    return query select v_registration.registration_id, v_registration.symbol_number;
    return;
  end if;

  v_serial := v_exam.next_symbol_number;
  update public.live_exams
    set next_symbol_number = next_symbol_number + 1
    where exam_id = p_exam_id;

  insert into public.live_exam_registrations (exam_id,user_id,symbol_number)
  values (p_exam_id,v_user,v_exam.faculty_code || '-W' || lpad(v_exam.week_number::text,2,'0') || '-' || lpad(v_serial::text,4,'0'))
  returning * into v_registration;

  return query select v_registration.registration_id, v_registration.symbol_number;
end;
$$;

revoke all on function public.hlp_register_live_exam(uuid) from public;
grant execute on function public.hlp_register_live_exam(uuid) to authenticated;

comment on table public.live_exam_question_bank is 'Admin-only approved and draft question bank; answer keys must never be exposed to student clients.';
comment on table public.live_exam_results is 'Private exam results; students can read only their own published result.';
comment on function public.hlp_register_live_exam(uuid) is 'Atomically assigns one faculty/exam-specific symbol number to the signed-in student.';
