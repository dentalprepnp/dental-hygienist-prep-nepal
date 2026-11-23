-- Weekly Live Exam: secure start/resume and sanitized question delivery.
-- Additive migration. Does not delete or reset existing student data.

create or replace function public.hlp_start_live_exam(p_exam_id uuid)
returns table (
  attempt_id uuid,
  exam_id uuid,
  started_at timestamptz,
  deadline_at timestamptz,
  attempt_status text,
  exam_title text,
  duration_minutes integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_exam public.live_exams%rowtype;
  v_attempt public.live_exam_attempts%rowtype;
  v_now timestamptz := now();
begin
  if v_user is null then raise exception 'Authentication required'; end if;

  select * into v_exam
  from public.live_exams
  where live_exams.exam_id = p_exam_id
    and live_exams.status in ('scheduled','live')
  for update;

  if not found then raise exception 'Exam is not available'; end if;

  if v_now < v_exam.starts_at then
    raise exception 'Exam has not started yet';
  end if;

  if v_now >= v_exam.starts_at + make_interval(mins => v_exam.duration_minutes) then
    raise exception 'Exam time has ended';
  end if;

  if not exists (
    select 1 from public.live_exam_registrations r
    where r.exam_id = p_exam_id and r.user_id = v_user
  ) then
    raise exception 'Please register for this exam first';
  end if;

  if (select count(*) from public.live_exam_paper_questions pq
      where pq.exam_id = p_exam_id) < v_exam.question_count then
    raise exception 'Exam paper is not ready yet';
  end if;

  select * into v_attempt
  from public.live_exam_attempts a
  where a.exam_id = p_exam_id and a.user_id = v_user
  for update;

  if not found then
    insert into public.live_exam_attempts
      (exam_id,user_id,started_at,deadline_at,status)
    values (
      p_exam_id,v_user,v_now,
      v_exam.starts_at + make_interval(mins => v_exam.duration_minutes),
      'in_progress'
    )
    returning * into v_attempt;
  end if;

  if v_attempt.status <> 'in_progress' then
    raise exception 'This exam attempt has already been submitted';
  end if;

  if v_attempt.deadline_at <= v_now then
    raise exception 'Exam time has ended';
  end if;

  return query select
    v_attempt.attempt_id,
    v_attempt.exam_id,
    v_attempt.started_at,
    v_attempt.deadline_at,
    v_attempt.status,
    v_exam.title,
    v_exam.duration_minutes;
end;
$$;

revoke all on function public.hlp_start_live_exam(uuid) from public, anon;
grant execute on function public.hlp_start_live_exam(uuid) to authenticated;

create or replace function public.hlp_get_live_exam_questions(p_attempt_id uuid)
returns table (
  question_id uuid,
  question_order integer,
  marks numeric,
  question_en text,
  question_ne text,
  option_a text,
  option_b text,
  option_c text,
  option_d text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Authentication required'; end if;

  if not exists (
    select 1 from public.live_exam_attempts a
    where a.attempt_id = p_attempt_id
      and a.user_id = v_user
      and a.status = 'in_progress'
      and a.deadline_at > now()
  ) then
    raise exception 'Active exam attempt not found';
  end if;

  return query
  select q.question_id, pq.question_order, pq.marks,
         q.question_en, q.question_ne,
         q.option_a, q.option_b, q.option_c, q.option_d
  from public.live_exam_attempts a
  join public.live_exam_paper_questions pq on pq.exam_id = a.exam_id
  join public.live_exam_question_bank q on q.question_id = pq.question_id
  where a.attempt_id = p_attempt_id
    and a.user_id = v_user
    and a.status = 'in_progress'
    and a.deadline_at > now()
  order by pq.question_order;
end;
$$;

revoke all on function public.hlp_get_live_exam_questions(uuid) from public, anon;
grant execute on function public.hlp_get_live_exam_questions(uuid) to authenticated;

comment on function public.hlp_start_live_exam(uuid) is
  'Starts or resumes a single registered student exam attempt; server controls the deadline.';
comment on function public.hlp_get_live_exam_questions(uuid) is
  'Returns only question text and options for the authenticated owner of an active attempt; never returns answer keys.';
