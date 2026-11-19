-- Student in-app notification: track whether a student has viewed an Admin reply
alter table public.student_feedback
  add column if not exists reply_seen_at timestamptz;

drop policy if exists "students_mark_own_replies_read" on public.student_feedback;
create policy "students_mark_own_replies_read"
on public.student_feedback for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant update (reply_seen_at) on public.student_feedback to authenticated;
