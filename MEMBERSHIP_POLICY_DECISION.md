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


## Faculty-click and payment gate — owner-confirmed

- A student whose 7-day Trial has expired must not be able to enter any faculty or subject study screen.
- Clicking a faculty/subject while membership is blocked must keep the student on the library/membership screen and show the Premium purchase notice; do not render notes, MCQs, mock questions, or bundled content behind the notice.
- Premium access begins only after the payment is verified and the membership is activated by the trusted payment/admin workflow. A submitted payment request or screenshot alone must not unlock content.
- After Premium activation, the student may open all entitled faculties and continue from the saved position. Do not reset or delete learning progress, bookmarks, mock results, or wrong-answer history.
- Enforce this at the content/navigation layer and in the server RPC; hiding cards or showing a client-only banner is not sufficient.
- Fail closed if membership status cannot be loaded. No local fallback to restricted content on RPC/network errors.
- This behavior must be tested on the installed PWA/device and a fresh browser session after deployment; cached service-worker assets must not retain an unrestricted route.
