-- Admin-only visibility for manual QR payment requests.
-- Run once AFTER supabase/manual-qr-payments.sql.
alter table public.manual_payment_requests enable row level security;
drop policy if exists "Admins read all manual payment requests" on public.manual_payment_requests;
create policy "Admins read all manual payment requests"
  on public.manual_payment_requests for select to authenticated
  using (exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  ));
grant select on public.manual_payment_requests to authenticated;
