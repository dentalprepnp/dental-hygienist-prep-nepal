# Dental Hygiene faculty membership migration — draft audit

Date: 2026-11-27
Branch: `draft/faculty-aware-content-rpc`

## Faculty scope

The Home page exposes 14 Dental Hygiene study subjects:

1. Basic Periodontology I
2. Basic Periodontology II
3. Human Anatomy and Physiology
4. Basic Medical Procedure and First Aid
5. Health, Environment and Health Education
6. Oral Pathology and Microbiology
7. Dental Materials, Instruments and Assisting
8. Oral Anatomy and Physiology
9. Dental Public Health and Jurisprudence
10. Dental Radiography and Photography
11. Dental Pharmacy
12. Dental Ethics and Practice Management
13. Food and Nutrition
14. Epidemiology and Community Diagnosis

The repository has client-bundled study content in `nhpc.js`, `app.js`, `dha.js`, `dental-materials.js`, `dental-radiology.js`, `dental-public-health.js`, `oral-anatomy.js`, `oral-pathology.js`, `dental-ethics.js`, `food-nutrition.js`, and `epidemiology-community.js`. These public JS assets must be treated as exposed; hiding a tab or adding a client-side membership check does not secure them.

## Existing server content found

- `supabase/dental-pharmacy-content.sql` seeds 51 Dental Pharmacy rows under faculty `Dental Hygiene`: 11 notes, 20 MCQ, and 20 mock rows. The seed assigns Free/Trial/Premium tiers.
- The Dental Pharmacy client previously called the legacy subject-only `get_learning_content` RPC. It now calls `get_learning_content_by_faculty` with faculty `Dental Hygiene` and subject `Dental Pharmacy`.
- The faculty-aware RPC migration is draft-only. The client change cannot be considered live or tested until the migration is applied in a non-production Supabase project and membership scenarios are tested there.

## Important blockers

- The other 13 subjects still have locally bundled content or are mixed into the large `nhpc.js` question bank.
- `nhpc.js` dynamically maps topic names to subject codes and builds a combined Dental Hygiene question bank. It needs an explicit content inventory/export before any local question bank is disabled.
- `app.js` contains a separate local Periodontology practice/mock bank and local progress state. Do not remove its progress persistence while moving content.
- Notes and MCQs are not all represented in the current secure-content SQL seeds. Do not assume the existing database contains complete Dental Hygiene content.
- The exact faculty/subject taxonomy and live database row counts still require read-only verification in the test Supabase project.

## Pilot rollout sequence

1. Apply migrations `202611270001_faculty_aware_secure_content_rpc.sql` and `202611270003_trial_expiry_full_lock.sql` only in a non-production Supabase project.
2. Verify Dental Pharmacy row counts and test active Trial, expired Trial, active Premium, expired Premium, cancelled, no-membership, and anonymous users. Under the agreed policy, only active Trial and active Premium return rows; all other states return zero rows.
3. Verify the Dental Pharmacy client fails closed for missing session, RPC errors, and empty results.
4. Export/inventory the remaining 13 subjects from their existing JS modules; preserve bilingual question arrays, correct answers, explanations, notes, and clinical examples.
5. Migrate one subject at a time into `learning_content`, preserving stable content IDs and assigning access tiers only after review.
6. Convert each subject client to faculty-aware server fetching. Do not leave a local fallback for restricted content.
7. Once all Dental Hygiene routes are server-backed, verify no public JS contains restricted study content, and test navigation/direct routes/cache/offline behavior.
8. Preserve all student progress, bookmarks, wrong answers, and mock attempts.

## Current status

- [x] Dental Hygiene subject inventory recorded.
- [x] Existing Dental Pharmacy seed identified.
- [x] Dental Pharmacy client changed on the draft branch to use faculty-aware RPC.
- [ ] Non-production Supabase migrations applied and tested.
- [ ] Remaining 13 subjects inventoried and migrated.
- [ ] All Dental Hygiene local restricted content removed from public bundles after verified migration.
- [ ] End-to-end access tests passed.
- [ ] Production rollout explicitly approved by owner.

No production database or live app was changed.
