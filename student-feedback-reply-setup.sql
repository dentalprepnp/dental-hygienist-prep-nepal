-- Admin reply support for student feedback
alter table public.student_feedback
  add column if not exists admin_reply text,
  add column if not exists replied_at timestamptz;

alter table public.student_feedback enable row level security;

do $$
declare p record;
begin
  for p in select policyname from pg_policies
    where schemaname='public' and tablename='student_feedback'
  loop
    execute format('drop policy if exists %I on public.student_feedback', p.policyname);
  end loop;
end $$;

create policy "students_read_own_feedback"
on public.student_feedback for select to authenticated
using (user_id = auth.uid());

create policy "students_insert_own_feedback"
on public.student_feedback for insert to authenticated
with check (user_id = auth.uid());

create policy "admins_read_all_feedback"
on public.student_feedback for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "admins_update_feedback_replies"
on public.student_feedback for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

grant select, insert on public.student_feedback to authenticated;
grant update (status, admin_reply, replied_at) on public.student_feedback to authenticated;
