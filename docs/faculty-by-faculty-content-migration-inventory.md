# Faculty-by-Faculty Content Migration Inventory

Date: 2026-11-28
Scope: Repository source inventory only. No production data or Supabase schema has been changed.

## Existing Supabase content import assets

The repository already contains a large set of BMLT SQL content batches under `supabase/bmlt-*-batch-*.sql`, plus `supabase/bmlt-content-loader-setup.sql`. Pharmacy has existing content imports including:
- `supabase/dental-pharmacy-content.sql`
- `supabase/dpharm-*-content.sql` and question-bank expansion files
- `supabase/pharmacy-faculties-phase1.sql`

These files should be reconciled with live database rows before any new import is prepared. Do not rerun blindly.

## Source modules reviewed

| Faculty / area | Source file(s) | Evidence in source | Migration work |
|---|---|---|---|
| BMLT | `bmlt.js` | Secure-content module with large legacy/local bank code and a Supabase loader | Finish removal of local fallback content; verify all content rows and RPC |
| D.Pharm / B.Pharm | `pharmacy-faculties.js` | Supabase-backed module with notes, practice and mock panels | Verify RPC and membership authorization; remove/avoid local bank fallback |
| Dental Pharmacy | `dental-pharmacy.js` | Supabase-backed module | Verify RPC and membership authorization; reconcile SQL imports |
| Dental Hygiene / NHPC | `nhpc.js` | Static `bank` array of bilingual questions; each row includes topic and a `q` tuple with English question, Nepali translation, options, correct index, English explanation and Nepali explanation | Convert bank into normalized MCQ records; extract notes and mock banks if present |
| MLT | `mlt.js` | Static topic list, notes array, and question bank | Convert notes and MCQ/mock sets; preserve topic weighting and bilingual fields |
| OTT | `ott.js` | Static `Q` question tuples; comments document practice/mock bank and detailed notes | Convert notes and both practice/mock question sets, retaining topic metadata |
| Physiotherapy | `physiotherapy.js` | Large static module | Inspect exact arrays and distinguish notes/practice/mock sets before extraction |
| B.Sc. Anaesthesia | `bsc-anesthesia.js` | Large static module | Inspect exact arrays and distinguish notes/practice/mock sets before extraction |
| Ophthalmic Science | `ophthalmic-science.js` | Large static module | Inspect exact arrays and distinguish notes/practice/mock sets before extraction |
| DHA Dental Hygienist | `dha.js` | Static bilingual notes and question content | Convert to protected notes and question records |
| Dental core subjects | `app.js`, `dental-materials.js`, `dental-public-health.js`, `dental-radiology.js`, `oral-anatomy.js`, `oral-pathology.js`, `dental-ethics.js` | Several core study banks and subject modules are shipped as public JavaScript | Inventory all subjects and convert content to protected records |
| Radiography / Radiotherapy | `radiography.js`, `radiotherapy.js` | Static faculty modules | Inspect and convert content |
| HA | `ha-module-v2.js`, `ha-recovery.js` | Separate modules and recovery code | Inspect current active loader and convert content from active module only |
| Loksewa | `index.html` and associated scripts | Selection UI present; content readiness is not established by UI alone | Verify all loaded scripts and only publish verified syllabus-aligned content |

## Recommended database content contract

Use a single normalized table for protected learning content, with stable identifiers and fields for:
- `content_id` (stable unique text key)
- `faculty` and `subject`
- `content_type` (note, mcq, mock, important, trick, diagram as needed)
- `display_order`
- `content_data` JSONB preserving each module's existing bilingual structure
- `is_published`

Do not assume all current modules share one JSON schema. Each importer must map and validate its source structure explicitly, and the loader must render the stored schema safely.

## Safe execution order

1. Inspect live table columns, existing RLS policies, RPC signatures, and row counts using read-only queries.
2. Build and validate one faculty's export/import mapping at a time, starting with Dental Hygiene/NHPC.
3. Compare source counts to inserted row counts and verify representative English/Nepali fields, options and answer indices.
4. Update that faculty's loader to request protected content only after server authorization.
5. Remove the corresponding static content from the public JavaScript and service-worker cache only after the cloud loader is verified.
6. Repeat for remaining faculties.
7. After all consumers are migrated, apply the final RLS/RPC hardening migration and run the complete membership test matrix.

## Membership test matrix required before release

- Logged out: no protected content.
- Active 7-day trial: content allowed until exact expiry.
- Expired trial: no protected content.
- Active Premium: content allowed until paid expiry.
- Expired Premium: no protected content.
- Admin: admin content access as explicitly intended.
- RPC/network failure: fail closed.
- Faculty switch and app resume after expiry: content disappears and gate returns.
- Offline/PWA cache: protected content must not remain accessible after expiry; do not precache protected banks.

## Safety status

This is an inventory and implementation plan, not an executable migration. It contains no guessed live database column names or blanket permission changes. No SQL from this document should be run.


## First-faculty deep audit: Dental Hygiene / NHPC

Reviewed `nhpc.js` and its lazy-loading path in `index.html` on the draft branch.

### Confirmed source structure

- `nhpc.js` is approximately 328 KB / 455 lines and is loaded lazily for the Dental Hygiene faculty.
- The source contains 529 static question records identified by the `"q":[` record pattern. This is the source-record count before runtime deduplication, topic remapping, and MCQ/mock pool splitting; it is **not** a verified final student-visible question count.
- Question records have a `topic` and a `q` tuple: English stem, Nepali translation, four options, correct-answer index, English explanation, Nepali explanation, and in some cases an optional clinical example.
- The runtime transforms the original and expanded banks, removes duplicate stems, maps topics to the current NHPC syllabus blueprint, and divides the resulting bank into separate MCQ and mock pools. These transformations must be preserved by the exporter or reproduced deterministically.
- The module also contains 14 static bilingual notes topic groups. Notes use four fields per note: heading, English explanation, Nepali explanation, and exam-focus point.
- Mock tests include subject blueprint selection, 100-question sets, answer review, progress reporting, and a resume feature.
- The resume feature currently stores the selected question objects (including answers and explanations) in browser `localStorage`. That must be redesigned or removed during migration; otherwise previously opened protected content can remain on the device after membership expiry.
- The faculty module is lazy-loaded as `nhpc.js?v=225` from `index.html`; this public JavaScript currently contains the question bank and notes.

### Security and migration blockers

1. The client-side membership gate in `membership.js` / `index.html` checks whether a student may open a faculty, but does not prevent downloading the static content file itself.
2. A protected-content endpoint must check the authenticated user's current trial/premium expiry on the server for every content request. A client-side `HLPCheckMembershipAccess` result must not be treated as authorization for a content query.
3. The existing `learning_content` setup SQL currently allows authenticated users to select published rows with `access_tier = 'free'` directly, and its `get_learning_content` RPC filters only for free-tier content. This is not sufficient for a rule that requires an active trial or premium membership for all faculty content.
4. Do not migrate or change policies until the live Supabase table definition, grants, RLS policies, membership function signatures, and existing NHPC-related rows have been inspected read-only.
5. The export must preserve exact option ordering and correct-answer indices, English/Nepali explanations, topic mapping, optional clinical examples, notes ordering, and the MCQ/mock blueprint split.
6. After server delivery is verified, remove the source bank and notes from the public JavaScript bundle, remove question payloads from local resume storage, and ensure service-worker/browser caches do not retain protected content.

### Safe next implementation sequence

1. Inspect live Supabase schema, policies, grants, membership RPCs, and any existing NHPC content rows using read-only queries.
2. Build a deterministic NHPC export/validation script from the **final runtime bank after transformations**, not from a rough regex extraction. Record per-topic, total, MCQ, mock, and notes counts.
3. Compare the export against the current browser module using representative questions from every topic and validate all answer indices and bilingual fields.
4. Prepare an NHPC-only protected RPC and importer only after the actual live schema and authorization logic are confirmed.
5. Switch only the NHPC loader to server-delivered content, test all membership states, then remove the static payload from `nhpc.js`.
6. Keep all changes in the draft PR until the complete test matrix passes and the user explicitly approves release.

No SQL was run, no Supabase data was changed, and no live app code was deployed during this audit.
