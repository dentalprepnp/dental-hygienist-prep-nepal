-- Batch-create and schedule four Saturday exams for every active faculty.
-- Faculty-specific exam settings are stored on live_exam_faculties.
alter table public.live_exam_faculties
  add column if not exists exam_duration_minutes integer not null default 60 check (exam_duration_minutes between 1 and 180),
  add column if not exists exam_question_count integer not null default 50 check (exam_question_count between 1 and 300),
  add column if not exists exam_marks_per_question numeric(6,2) not null default 1 check (exam_marks_per_question > 0),
  add column if not exists exam_negative_marks numeric(6,2) not null default 0 check (exam_negative_marks >= 0),
  add column if not exists exam_pass_marks numeric(8,2) not null default 25 check (exam_pass_marks >= 0);

create or replace function public.hlp_admin_schedule_all_faculties(p_exam_year integer, p_exam_month integer)
returns table(faculty_code text, week_number integer, result text, details text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  f record;
  w integer;
  v_month_start date;
  v_first_saturday date;
  v_exam_date date;
  v_start timestamptz;
  v_exam_id uuid;
  v_added integer;
begin
  if not public.hlp_is_live_exam_admin() then
    raise exception 'Admin permission required';
  end if;
  if p_exam_month not between 1 and 12 or p_exam_year < 2026 or p_exam_year > 2100 then
    raise exception 'Invalid exam year/month';
  end if;
  v_month_start := make_date(p_exam_year,p_exam_month,1);
  v_first_saturday := v_month_start + ((6 - extract(dow from v_month_start)::integer + 7) % 7);

  for f in select * from public.live_exam_faculties where is_active order by faculty_code loop
    for w in 1..4 loop
      v_exam_date := v_first_saturday + ((w-1)*7);
      v_start := (v_exam_date + time '18:00') at time zone 'Asia/Kathmandu';
      if v_start <= now() then
        faculty_code := f.faculty_code; week_number := w; result := 'skipped'; details := 'यो शनिबारको exam समय बितिसकेको छ'; return next; continue;
      end if;
      if exists(select 1 from public.live_exams e where e.faculty_code=f.faculty_code and e.exam_year=p_exam_year and e.exam_month=p_exam_month and e.week_number=w) then
        faculty_code := f.faculty_code; week_number := w; result := 'exists'; details := 'यस faculty/week को exam पहिल्यै छ'; return next; continue;
      end if;
      begin
        v_exam_id := null;
        insert into public.live_exams(faculty_code,exam_year,exam_month,week_number,title,starts_at,duration_minutes,question_count,marks_per_question,negative_marks,pass_marks,status,created_by)
        values(f.faculty_code,p_exam_year,p_exam_month,w,f.faculty_name||' - Monthly Practice Exam Week '||w,v_start,
          f.exam_duration_minutes,f.exam_question_count,f.exam_marks_per_question,f.exam_negative_marks,f.exam_pass_marks,'draft',auth.uid())
        returning exam_id into v_exam_id;
        with picked as (
          select q.question_id,row_number() over(order by random())::integer as rn
          from public.live_exam_question_bank q
          where q.faculty_code=f.faculty_code and q.status='approved'
          order by random() limit f.exam_question_count
        )
        insert into public.live_exam_paper_questions(exam_id,question_id,question_order,marks)
        select v_exam_id,question_id,rn,f.exam_marks_per_question from picked;
        get diagnostics v_added = row_count;
        if v_added <> f.exam_question_count then
          raise exception 'Approved प्रश्न % छन्; % चाहिन्छ',v_added,f.exam_question_count;
        end if;
        update public.live_exams set status='scheduled',published_by=auth.uid(),published_at=now(),updated_at=now()
          where exam_id=v_exam_id;
        faculty_code := f.faculty_code; week_number := w; result := 'scheduled'; details := v_added||' प्रश्नको paper schedule भयो'; return next;
      exception when others then
        if v_exam_id is not null then delete from public.live_exams where exam_id=v_exam_id; end if;
        faculty_code := f.faculty_code; week_number := w; result := 'failed'; details := sqlerrm; return next;
      end;
    end loop;
  end loop;
end;
$$;
revoke all on function public.hlp_admin_schedule_all_faculties(integer,integer) from public, anon, authenticated;
grant execute on function public.hlp_admin_schedule_all_faculties(integer,integer) to authenticated;
comment on function public.hlp_admin_schedule_all_faculties(integer,integer) is
'Admin-only: creates and schedules four Saturday 6 PM Nepal-time exams per active faculty using faculty-specific settings and approved question bank. Existing exams are not overwritten.';
