-- Admin-only read access to membership dates/status.
-- Run once in Supabase Dashboard > SQL Editor.
-- Students retain read access only to their own membership row.
alter table public.memberships enable row level security;
drop policy if exists "Admins read all memberships" on public.memberships;
create policy "Admins read all memberships"
  on public.memberships for select to authenticated
  using (exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  ));
grant select on public.memberships to authenticated;
