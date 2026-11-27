# Trial and Membership Expiry Notifications — staged setup

This feature is intentionally staged. Adding files to GitHub does not activate them on the live site or in Supabase.

## Included
- In-site reminder/expired notice in warm, student-supportive Nepali.
- Email queue for Trial/Premium reminders within 24 hours and expiry messages.
- Existing expired memberships are queued on the first scheduled run.
- Unique user + notification type + membership end time prevents duplicate messages.
- Failed email sends are retried by later scheduled runs.
- Email is sent using Resend from a Supabase Edge Function; credentials stay in server secrets.

## Before production
1. Review and merge the PR only after tests.
2. In Supabase SQL Editor, run `supabase/trial-expiry-notifications.sql` once.
3. Deploy Edge Function `membership-notifications`.
4. Set Edge Function secrets: `RESEND_API_KEY`, `EMAIL_FROM`. Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to deployed functions.
5. Verify the sender domain in Resend and use a real monitored sender address.
6. Enable Supabase Cron and pg_net. Store `project_url` and `service_role_key` in Vault secrets (never in GitHub or client JavaScript).
7. Schedule an hourly POST to `/functions/v1/membership-notifications` with the service-role bearer token from Vault.
8. Test with a dedicated test account first. Check the queue status and Resend delivery before enabling for all students.

## Important limitation / separate security rollout
This notification feature does not by itself secure all learning content. Some faculty content currently lives in public frontend JavaScript, and an older BMLT SQL setup allows authenticated reads of free-tier rows. The strict no-reading-after-expiry policy requires migrating protected content behind membership-checked server access and reconciling those old policies before that security promise can be made. Do not run destructive content migration as part of this notification setup.
