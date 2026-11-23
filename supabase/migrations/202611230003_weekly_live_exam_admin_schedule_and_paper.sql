-- Admin-only scheduling and paper assembly for Weekly Live Exams.
-- Additive migration; preserves all existing content and student records.

create or replace function public.hlp_admin_schedule_live_exam(
  p_faculty_code text,
  p_exam_year integer,
  p_exam_month integer,
  p_week_number integer,
  p_title text,
  p_starts_at timestamptz,
  p_duration_minutes integer default 60,
  p_question_count integer default 50,
  p_marks_per_question numeric default 1,
  p_negative_marks numeric default 0,
  p_pass_marks numeric default 25
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_exam_id uuid;
begin
  if not public.hlp_is_live_exam_admin() then
    raise exception 'Admin permission required';
  end if;
  if p_week_number not between 1 and 4 then
    raise exception 'Week number must be 1 to 4';
  end if;
  if p_duration_minutes not between 1 and 180 then
    raise exception 'Duration must be 1 to 180 minutes';
  end if;
  if p_question_count not between 1 and 300 then
    raise exception 'Question count must be 1 to 300';
  end if;
  if p_marks_per_question <= 0 or p_negative_marks < 0 or p_pass_marks < 0 then
    raise exception 'Invalid marks configuration';
  end if;
  if not exists (
    select 1 from public.live_exam_faculties f
    where f.faculty_code = p_faculty_code and f.is_active
  ) then
    raise exception 'Faculty is not active';
  end if;

  insert into public.live_exams
    (faculty_code,exam_year,exam_month,week_number,title,starts_at,
     duration_minutes,question_count,marks_per_question,negative_marks,
     pass_marks,status,created_by)
  values
    (p_faculty_code,p_exam_year,p_exam_month,p_week_number,
     coalesce(nullif(trim(p_title),''),p_faculty_code||' Weekly Practice Exam'),
     p_starts_at,p_duration_minutes,p_question_count,p_marks_per_question,
     p_negative_marks,p_pass_marks,'draft',auth.uid())
  returning exam_id into v_exam_id;

  return v_exam_id;
end;
$$;
revoke all on function public.hlp_admin_schedule_live_exam(text,integer,integer,integer,text,timestamptz,integer,integer,numeric,numeric,numeric) from public, anon, authenticated;
grant execute on function public.hlp_admin_schedule_live_exam(text,integer,integer,integer,text,timestamptz,integer,integer,numeric,numeric,numeric) to authenticated;


create or replace function public.hlp_admin_build_live_exam_paper(p_exam_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_exam public.live_exams%rowtype;
  v_added integer;
begin
  if not public.hlp_is_live_exam_admin() then
    raise exception 'Admin permission required';
  end if;

  select * into v_exam from public.live_exams e
  where e.exam_id = p_exam_id and e.status = 'draft'
  for update;
  if not found then raise exception 'Draft exam not found'; end if;

  delete from public.live_exam_paper_questions pq where pq.exam_id = p_exam_id;

  with selected as (
    select q.question_id,
           row_number() over (order by random())::integer as rn
    from public.live_exam_question_bank q
    where q.faculty_code = v_exam.faculty_code
      and q.status = 'approved'
    order by random()
    limit v_exam.question_count
  )
  insert into public.live_exam_paper_questions(exam_id,question_id,question_order,marks)
  select p_exam_id,question_id,rn,v_exam.marks_per_question
  from selected;

  get diagnostics v_added = row_count;
  if v_added < v_exam.question_count then
    raise exception 'Not enough approved questions: found %, required %',
      v_added,v_exam.question_count;
  end if;
  return v_added;
end;
$$;
revoke all on function public.hlp_admin_build_live_exam_paper(uuid) from public, anon, authenticated;
grant execute on function public.hlp_admin_build_live_exam_paper(uuid) to authenticated;

comment on function public.hlp_admin_schedule_live_exam(text,integer,integer,integer,text,timestamptz,integer,integer,numeric,numeric,numeric) is
  'Admin-only creates a draft weekly exam with faculty-specific exam configuration.';
comment on function public.hlp_admin_build_live_exam_paper(uuid) is
  'Admin-only assembles a random paper from approved questions for a draft exam; exam remains draft until admin schedules it.';


create or replace function public.hlp_admin_publish_live_exam_schedule(p_exam_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_exam public.live_exams%rowtype;
  v_count integer;
begin
  if not public.hlp_is_live_exam_admin() then
    raise exception 'Admin permission required';
  end if;
  select * into v_exam from public.live_exams e
  where e.exam_id = p_exam_id and e.status = 'draft'
  for update;
  if not found then raise exception 'Draft exam not found'; end if;

  select count(*) into v_count
  from public.live_exam_paper_questions pq
  where pq.exam_id = p_exam_id;
  if v_count <> v_exam.question_count then
    raise exception 'Paper has % questions; expected %',v_count,v_exam.question_count;
  end if;
  if v_exam.starts_at <= now() then
    raise exception 'Choose a future start time before scheduling';
  end if;

  update public.live_exams
    set status = 'scheduled', updated_at = now()
    where exam_id = p_exam_id;
  return true;
end;
$$;
revoke all on function public.hlp_admin_publish_live_exam_schedule(uuid) from public, anon, authenticated;
grant execute on function public.hlp_admin_publish_live_exam_schedule(uuid) to authenticated;

comment on function public.hlp_admin_publish_live_exam_schedule(uuid) is
  'Admin-only validates a complete draft paper and publishes its scheduled listing to students.';
