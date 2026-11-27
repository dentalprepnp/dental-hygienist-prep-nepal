# Membership policy decision — 2026-11-27

## Confirmed product rule

The owner has confirmed this account-wide rule for every faculty:

- During the active 7-day Trial: allow the Trial content experience.
- Once Trial expires: block ALL study content until Premium is active.
- Active Premium: allow the purchased Premium membership experience.
- Cancelled, expired Premium, Free/no-membership, or expired Trial: block ALL study content.
- Membership is account-wide, not faculty-specific.

## User-facing notice requirement

All membership/trial-expiry notices must begin with a respectful greeting, for example:

“आदरणीय विद्यार्थीहरू, नमस्कार! 🙏”

Then explain the trial expiry and Premium requirement politely. Apply this greeting style consistently across faculties.

## Draft implementation status

- `202611270001_faculty_aware_secure_content_rpc.sql`: adds faculty-aware content retrieval but its original tier logic still permits Free rows for non-active memberships.
- `202611270003_trial_expiry_full_lock.sql`: replaces the faculty-aware RPC policy so only an active Trial or active Premium membership can receive content rows. Expired/no-membership users receive zero rows.
- Both migrations are draft-only and have NOT been applied to production.
- Existing faculty modules still contain bundled/local study content. Therefore the RPC change alone does NOT block all access. Each faculty must be migrated to server-fetched content and local restricted fallbacks removed only after validation.
- Do not merge or apply production changes until the complete rollout is tested in a non-production Supabase project.
- Preserve student progress, bookmarks, mock attempts, payment requests, and admin access/data.

## Required validation

Test at least: anonymous, active Trial, expired Trial, active Premium, expired Premium, cancelled, and no-membership accounts. Test every faculty, RPC errors, offline state, and direct table access. Confirm the expired Trial account cannot open content through any navigation route, direct URL, cached page, or bundled JavaScript path.
