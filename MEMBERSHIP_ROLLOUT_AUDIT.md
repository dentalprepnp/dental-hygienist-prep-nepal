# Membership rollout audit (draft)

Date: 2026-11-27

## Goal

Use one account-wide membership for every faculty/programme:
- Free account: published Free content only.
- Active 7-day Trial: Free + Trial content in every faculty.
- Active Premium: Free + Trial + Premium content in every faculty.
- Expired Trial/Premium: Free content only.
- Trial is one-time per account, not one trial per faculty.

## Findings from the current `main` branch

### Shared membership UI exists

- `membership.js` displays membership status, trial consent, and premium plans.
- `index.html` describes one trial across all faculties and has a login-required click gate.
- `membership.js` is not itself a content authorization layer. It does not centrally stop a signed-in Free/Expired user from opening faculty content.
- The login gate in `index.html` checks whether `window.HLPAuthUser` exists; it does not check Free/Trial/Premium tier.

### Existing cloud-content clients

- `dental-pharmacy.js` calls `get_learning_content` for Dental Pharmacy.
- `pharmacy-faculties.js` calls `get_learning_content` for Diploma/Bachelor of Pharmacy.
- `bmlt.js` calls `get_learning_content`, but its current fallback activates local notes/questions when there is no session, no cloud data, or an RPC error. This must be removed only after the BMLT content has been safely migrated and tested; currently it is a membership bypass.
- The current RPC accepts subject but not faculty, so identical subject names can potentially mix content across faculties. The additive faculty-aware RPC is in the companion draft migration.

### Faculty modules with client-side content files found

These files contain locally bundled study content or module logic and need an individual content inventory before access tiers can be enforced securely:

- Dental Hygiene: `nhpc.js`, `app.js`, `dha.js`, `dental-materials.js`, `dental-radiology.js`, `dental-public-health.js`, `oral-anatomy.js`, `oral-pathology.js`, `dental-ethics.js`, `food-nutrition.js`, `epidemiology-community.js`, `dental-pharmacy.js`
- BMLT: `bmlt.js`
- Pharmacy: `pharmacy-faculties.js`
- Physiotherapy: `physiotherapy.js`
- Medical Laboratory Technology: `mlt.js`
- Radiography: `radiography.js`
- Radiotherapy: `radiotherapy.js`
- Operation Theatre Technology: `ott.js`
- Ophthalmic Science: `ophthalmic-science.js`
- Anaesthesia: `bsc-anesthesia.js`
- Health Assistant: `ha-module-v2.js` (and recovery helper `ha-recovery.js`)

This is a source-code inventory, not proof that every item is currently exposed in the live navigation or that all listed content has been fully classified.

## Safe rollout phases

1. Confirm the exact faculty/subject taxonomy and content counts from the live database and repository seed files.
2. Create a content inventory with each item labelled Free, Trial, or Premium. Do not assume all existing local content should become Premium.
3. Migrate content in small faculty batches into `learning_content`, preserving content IDs and validating row counts and JSON shape.
4. Deploy and test the faculty-aware RPC in a non-production Supabase project. Test anonymous, Free, active Trial, active Premium, expired Trial, expired Premium, and cross-faculty same-subject cases.
5. Convert one pilot faculty client to the faculty-aware RPC. Keep local progress, bookmarks, mock history, and student records unchanged.
6. Remove client-bundled restricted content and all fallback paths that display restricted content when the RPC fails. Fail closed: show a friendly retry/login/membership message, never local restricted content.
7. Repeat faculty-by-faculty, then revoke the legacy subject-only RPC after all callers have moved.
8. Verify admin-only content and controls remain server-authorized and unavailable to students.

## Do not do yet

- Do not run this migration in production yet.
- Do not merge the draft PR yet.
- Do not bulk-update content tiers without reviewing the content inventory.
- Do not delete local content, progress, bookmarks, or histories.
- Do not remove fallback code until its replacement content is migrated and tested.
