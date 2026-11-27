# Strict membership content-access rollout

This is a staged security migration. Do not run it on production until all public faculty content has been migrated into `public.learning_content` and the browser loaders have been changed to call `get_membership_learning_content`.

## Expected behavior after complete rollout

- Existing students are not grandfathered into free access.
- A verified, active 7-day trial or active paid Premium membership may study.
- Trial expiry, Premium expiry, missing membership, cancelled membership, and expired status deny all study content.
- Every faculty uses the same membership row and gate.
- Existing accounts, membership/payment history, progress, mock attempts, bookmarks, and wrong-answer records are preserved.

## Migration SQL

Run `supabase/strict-membership-content-access.sql` only after reviewing the complete migration. It:
- removes legacy SELECT policies on `learning_content` (including the older BMLT free-content policy);
- revokes direct browser table access and execution of the older `get_learning_content(text,text)` RPC;
- adds a new RPC that returns content only when the authenticated user's trial or Premium membership is active and unexpired;
- does not delete any content or student records.

## Important: this SQL alone is NOT enough

Several faculty files currently contain study content directly in public JavaScript. Public GitHub Pages scripts can be downloaded without logging in. Those files must be converted into protected database content and their client loaders updated before expired users can be fully blocked.

## Required validation before production

1. Inventory every faculty file and classify all notes, MCQs, mock questions, answer keys, and explanations.
2. Import the content into `learning_content` without deleting source files or student history.
3. Update every faculty loader to call the new RPC and handle access-denied results gracefully.
4. Verify no public JavaScript or old RPC exposes protected questions/answers.
5. Test accounts: active trial, expired trial, active Premium, expired Premium, no membership, and cancelled membership.
6. Test all faculties and ensure expired users cannot open content by direct URL, reload, browser back, or cached pages.
7. Only then apply the reviewed SQL and deploy the updated frontend.

## Existing users

Existing users do not receive free access automatically. Their current valid membership continues until its stored expiry. Users whose membership is expired or missing are denied once the complete protected-content rollout is active. No user's progress or account should be deleted.
