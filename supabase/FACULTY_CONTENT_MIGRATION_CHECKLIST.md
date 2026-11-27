# Faculty content migration checklist

This is a working checklist for the strict membership-only content rollout.
Do not deploy or run production SQL until every section is verified.

## Security target
- [ ] All study content is delivered only by the authenticated membership-gated RPC.
- [ ] No Notes, MCQs, mock questions, answer keys, explanations, or question banks remain in public client JavaScript, HTML, JSON, source maps, or static assets.
- [ ] Direct table access and legacy content RPCs cannot bypass the membership check.
- [ ] Missing membership is denied; there is no implicit free tier.
- [ ] Trial access is one-time and ends at its stored expiry.
- [ ] Premium access requires active status and a non-null future paid_until.
- [ ] Login and renewal remain available after study access expires.

## Content inventory — scan the complete repository
For every faculty and every content source, record the exact file/path and count before migration:
- [ ] Faculty landing/catalog metadata (only non-protected labels may remain public)
- [ ] Notes and lesson text
- [ ] MCQ questions and all options
- [ ] Correct answers and explanations
- [ ] Mock tests, mock answers, and scoring keys
- [ ] Case studies, flashcards, and revision content
- [ ] Content loaded from localStorage, embedded arrays, JSON, or remote public URLs
- [ ] Service worker/offline cache and generated bundles/source maps

Known large content-bearing files from prior review include `bmlt.js`, `ha-module-v2.js`, and `physiotherapy.js`. These are examples, not a complete faculty inventory. Search every tracked file and every deployed asset.

## Migration steps
1. [ ] Create a full file inventory across all faculties; note protected content, loader, content type, and approximate item count.
2. [ ] Preserve original files and create a reproducible import/export script. Do not manually truncate or rewrite question banks.
3. [ ] Import protected content into `public.learning_content` with stable IDs, faculty, subject, type, display order, and JSON data.
4. [ ] Compare source and imported counts, IDs, options, answer keys, and explanations; report any duplicates or missing records.
5. [ ] Update each faculty loader to request content through `get_membership_learning_content`.
6. [ ] Handle access denied by showing a polite expiry message and a membership renewal action; do not show content from fallback/local data.
7. [ ] Remove protected content from public bundles and assets only after database import and validation are confirmed.
8. [ ] Ensure service-worker caches are versioned/cleared and expired users cannot read previously cached protected content. Do not cache protected responses for offline access unless membership is revalidated securely.
9. [ ] Confirm RLS, function grants, and legacy RPC/table permissions with a least-privilege review.
10. [ ] Deploy frontend and database changes as one coordinated release, with a rollback plan that does not restore public content exposure.

## Required test matrix
Run each test for every faculty, subject, content type, and direct route:

| Account state | Expected study content |
|---|---|
| Active, unexpired trial | Allow |
| Expired trial | Deny |
| Active Premium, paid_until in future | Allow |
| Expired Premium | Deny |
| No membership row | Deny |
| Cancelled / inactive membership | Deny |
| Trial or Premium expiry reached while page is open | Re-check and deny |
| Expired user with cached page / browser Back / reload | Deny |

Also test anonymous access, direct RPC calls, direct REST table requests, old RPC names, app navigation, MCQ submit, notes, mock test, bookmarks/progress preservation, and renewal/login links.

## Release gate
- [ ] All faculty and content types accounted for; no unknown/untested faculty remains.
- [ ] Source/import count comparison passes.
- [ ] No protected content found in public repository/deployed assets.
- [ ] Regression tests pass, including expired and missing-membership cases.
- [ ] SQL reviewed and applied only after the frontend loaders are ready.
- [ ] Existing accounts, memberships, payment history, progress, mock attempts, bookmarks, and wrong-answer records remain intact.
- [ ] Confirm live behavior after deployment using test accounts; do not claim access is blocked before this verification.

## Rollout status
This checklist is planning/review material. It does not change the live website or Supabase database.
