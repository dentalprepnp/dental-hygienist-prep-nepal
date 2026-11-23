-- Weekly Live Exam: server-side answer autosave and final grading.
-- Additive and data-preserving. Student clients never calculate or receive answer keys.

create or replace function public.hlp_save_live_exam_answer(
  p_attempt_id uuid,
  p_question_id uuid,
  p_selected_option char(1),
  p_marked_for_review boolean default false
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_attempt public.live_exam_attempts%rowtype;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_selected_option is not null and p_selected_option not in ('A','B','C','D') then
    raise exception 'Invalid answer option';
  end if;

  select * into v_attempt
  from public.live_exam_attempts a
  where a.attempt_id = p_attempt_id and a.user_id = v_user
  for update;

  if not found then raise exception 'Attempt not found'; end if;
  if v_attempt.status <> 'in_progress' then raise exception 'Attempt is already submitted'; end if;
  if v_attempt.deadline_at <= now() then raise exception 'Exam time has ended'; end if;

  if not exists (
    select 1 from public.live_exam_paper_questions pq
    where pq.exam_id = v_attempt.exam_id and pq.question_id = p_question_id
  ) then raise exception 'Question is not part of this exam'; end if;

  insert into public.live_exam_answers
    (attempt_id,question_id,selected_option,marked_for_review,saved_at)
  values
    (p_attempt_id,p_question_id,p_selected_option,coalesce(p_marked_for_review,false),now())
  on conflict (attempt_id,question_id) do update
    set selected_option = excluded.selected_option,
        marked_for_review = excluded.marked_for_review,
        saved_at = now();

  return true;
end;
$$;

revoke all on function public.hlp_save_live_exam_answer(uuid,uuid,char,boolean) from public, anon;
grant execute on function public.hlp_save_live_exam_answer(uuid,uuid,char,boolean) to authenticated;


create or replace function public.hlp_submit_live_exam(p_attempt_id uuid)
returns table (
  obtained_marks numeric,
  total_marks numeric,
  percentage numeric,
  correct_count integer,
  incorrect_count integer,
  unanswered_count integer,
  passed boolean,
  attempt_status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_attempt public.live_exam_attempts%rowtype;
  v_exam public.live_exams%rowtype;
  v_symbol text;
  v_student_name text := '';
  v_total numeric(8,2);
  v_obtained numeric(8,2);
  v_correct integer;
  v_incorrect integer;
  v_unanswered integer;
  v_percentage numeric(6,2);
  v_passed boolean;
  v_status text;
  v_analysis jsonb;
begin
  if v_user is null then raise exception 'Authentication required'; end if;

  select * into v_attempt
  from public.live_exam_attempts a
  where a.attempt_id = p_attempt_id and a.user_id = v_user
  for update;

  if not found then raise exception 'Attempt not found'; end if;

  select * into v_exam
  from public.live_exams e
  where e.exam_id = v_attempt.exam_id;

  select r.symbol_number into v_symbol
  from public.live_exam_registrations r
  where r.exam_id = v_attempt.exam_id and r.user_id = v_user;

  if v_symbol is null then raise exception 'Exam registration not found'; end if;

  select coalesce(
    nullif(trim(u.raw_user_meta_data->>'full_name'),''),
    nullif(trim(u.raw_user_meta_data->>'name'),''),
    ''
  ) into v_student_name
  from auth.users u where u.id = v_user;

  if v_attempt.status = 'in_progress' and v_attempt.deadline_at > now() then
    -- Student may submit early. Grade is performed only on the server.
    update public.live_exam_attempts
      set status = 'submitted', submitted_at = now()
      where attempt_id = p_attempt_id;
    v_status := 'submitted';
  elsif v_attempt.status = 'in_progress' then
    update public.live_exam_attempts
      set status = 'auto_submitted', submitted_at = coalesce(submitted_at, now())
      where attempt_id = p_attempt_id;
    v_status := 'auto_submitted';
  else
    v_status := v_attempt.status;
  end if;

  -- Return the already-created result for a repeated submit call.
  if exists (select 1 from public.live_exam_results r where r.attempt_id = p_attempt_id) then
    return query
    select r.obtained_marks,r.total_marks,r.percentage,r.correct_count,
           r.incorrect_count,r.unanswered_count,r.passed,v_status
    from public.live_exam_results r where r.attempt_id = p_attempt_id;
    return;
  end if;

  select
    coalesce(sum(pq.marks),0)::numeric(8,2),
    coalesce(sum(case
      when a.selected_option = q.correct_option then pq.marks
      when a.selected_option is not null then -v_exam.negative_marks
      else 0
    end),0)::numeric(8,2),
    count(*) filter (where a.selected_option = q.correct_option)::integer,
    count(*) filter (where a.selected_option is not null and a.selected_option <> q.correct_option)::integer,
    count(*) filter (where a.selected_option is null)::integer
  into v_total,v_obtained,v_correct,v_incorrect,v_unanswered
  from public.live_exam_paper_questions pq
  join public.live_exam_question_bank q on q.question_id = pq.question_id
  left join public.live_exam_answers a
    on a.attempt_id = p_attempt_id and a.question_id = pq.question_id
  where pq.exam_id = v_attempt.exam_id;

  v_obtained := greatest(0,coalesce(v_obtained,0));
  v_percentage := case when v_total > 0
    then round(least(100,(v_obtained / v_total) * 100),2)
    else 0 end;
  v_passed := v_obtained >= v_exam.pass_marks;

  select coalesce(jsonb_object_agg(subject, stats), '{}'::jsonb)
  into v_analysis
  from (
    select q.subject,
      jsonb_build_object(
        'total',count(*),
        'correct',count(*) filter (where a.selected_option = q.correct_option),
        'incorrect',count(*) filter (where a.selected_option is not null and a.selected_option <> q.correct_option),
        'unanswered',count(*) filter (where a.selected_option is null)
      ) as stats
    from public.live_exam_paper_questions pq
    join public.live_exam_question_bank q on q.question_id = pq.question_id
    left join public.live_exam_answers a
      on a.attempt_id = p_attempt_id and a.question_id = pq.question_id
    where pq.exam_id = v_attempt.exam_id
    group by q.subject
  ) s;

  insert into public.live_exam_results
    (exam_id,user_id,attempt_id,student_name,symbol_number,
     obtained_marks,total_marks,percentage,correct_count,incorrect_count,
     unanswered_count,subject_analysis,passed,is_published)
  values
    (v_attempt.exam_id,v_user,p_attempt_id,coalesce(v_student_name,''),v_symbol,
     v_obtained,v_total,v_percentage,v_correct,v_incorrect,v_unanswered,
     coalesce(v_analysis,'{}'::jsonb),v_passed,false);

  return query select v_obtained,v_total,v_percentage,v_correct,v_incorrect,
                      v_unanswered,v_passed,v_status;
end;
$$;

revoke all on function public.hlp_submit_live_exam(uuid) from public, anon;
grant execute on function public.hlp_submit_live_exam(uuid) to authenticated;

comment on function public.hlp_save_live_exam_answer(uuid,uuid,char,boolean) is
  'Owner-only server-validated answer autosave during an active exam.';
comment on function public.hlp_submit_live_exam(uuid) is
  'Submits or deadline auto-submits an exam, calculates marks server-side, and stores an unpublished result.';
