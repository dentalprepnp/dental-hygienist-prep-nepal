# Initial repository-wide faculty content inventory

Generated from the repository's `main` Git tree. This is a path/size inventory, not a completed content extraction or security certification.

## Findings

- Repository tree contains 166 tracked files.
- It contains 23 likely faculty/content JavaScript modules plus the service worker listed below.
- The modules are static client-side files; any question/answer/notes embedded in them can be downloaded without membership enforcement.
- `index.html` loads `app.js` directly. `app.js` contains hardcoded bilingual Periodontology Notes and MCQ arrays (confirmed by source inspection).
- The repository also contains 86 SQL files whose names suggest content batches/imports. Their row coverage must be verified against source banks; filenames alone do not prove all content is protected.
- The current setup guide states Notes, MCQs and Mock Tests remain accessible without signing in. Therefore expired-user blocking is not yet complete on live site.

## JavaScript modules requiring content extraction and loader migration

| File | Approx. size |
|---|---:|
| `app.js` | 76 KB |
| `bmlt.js` | 700 KB |
| `bsc-anesthesia.js` | 445 KB |
| `dental-ethics.js` | 43 KB |
| `dental-materials.js` | 39 KB |
| `dental-pharmacy.js` | 18 KB |
| `dental-public-health.js` | 41 KB |
| `dental-radiology.js` | 53 KB |
| `dha.js` | 80 KB |
| `epidemiology-community.js` | 50 KB |
| `food-nutrition.js` | 41 KB |
| `ha-module-v2.js` | 177 KB |
| `ha-recovery.js` | 16 KB |
| `mlt.js` | 794 KB |
| `nhpc.js` | 405 KB |
| `ophthalmic-science.js` | 586 KB |
| `oral-anatomy.js` | 37 KB |
| `oral-pathology.js` | 46 KB |
| `ott.js` | 303 KB |
| `pharmacy-faculties.js` | 20 KB |
| `physiotherapy.js` | 479 KB |
| `radiography.js` | 353 KB |
| `radiotherapy.js` | 156 KB |
| `sw.js` | 3 KB |

The `sw.js` entry is the service worker, not a faculty module; audit its cache rules separately. These names are only a first-pass inventory. Inspect each module for notes, MCQs, mock banks, answer keys, explanations, flashcards, and dynamically generated content. A file may include both public catalog metadata and protected study content.

## SQL content files requiring reconciliation

The repository contains 86 likely content/import SQL files. Compare each import against its source module and record:
- faculty and subject identifiers;
- content type (notes, MCQ, mock, answer/explanation);
- source item count and imported row count;
- stable IDs and duplicates;
- whether each row is published and whether the new membership RPC returns it.

Do not rely on the SQL filename or presence of a seed file as proof that a faculty is fully migrated.

## First confirmed exposure
- `app.js`: hardcoded `NOTES` and `QUESTIONS` arrays for Periodontology.
- `SUPABASE_SETUP.md`: explicitly documents public Notes, MCQs and Mock Tests.
- `membership.js`: displays membership status, but status display by itself is not a content authorization boundary.

## Next audit actions
1. [ ] Fetch and inspect all 24 module files, including dynamically loaded faculty scripts.
2. [ ] Parse all embedded banks and enumerate item counts by faculty/subject/type.
3. [ ] Compare against all 86 SQL content files and database schema.
4. [ ] Build an import manifest with exact source/import counts and a repeatable importer.
5. [ ] Replace every loader with the membership-gated RPC; remove public fallback banks.
6. [ ] Validate expired/missing memberships using direct RPC and all UI navigation routes.
7. [ ] Only after these checks, review and deploy the coordinated database/frontend rollout.

## Status
Initial source inventory added for review. No production database or live website changes were made.


## First source-file spot check (2026-11-27)

- `app.js` contains hardcoded Periodontology `NOTES` and `QUESTIONS` arrays (approximately 10 note entries and 20 question entries in the current branch; exact item validation is required before import).
- `SUPABASE_SETUP.md` explicitly documents that Notes, MCQs and Mock Tests are currently public without signing in. This must be corrected as part of the release, after all content loaders have moved to the protected membership RPC.
- `supabase/secure-content.sql` currently defines a legacy `get_learning_content` RPC that can classify a missing membership row as `free`; it must not be used for the strict paid/trial-only rollout. The strict membership RPC from the rollout branch is the intended replacement.
- `supabase/bmlt-content-loader-setup.sql` contains a legacy authenticated SELECT policy for `access_tier='free'` and a legacy RPC returning free content without checking membership. These legacy grants/policies/functions must be removed during the coordinated migration.

**Safety note:** Do not execute the strict SQL in production yet. First migrate all source content, switch every faculty loader to the membership-checked RPC, remove public/local fallback content, and test missing/expired membership denial plus active trial/premium access.


## Candidate content JavaScript files from branch tree

These files are candidates for protected-content migration; filenames alone do not prove that every file contains study content. Each must be checked for its exports, questions/notes/mock data, and loader usage before migration.

| File | Size (bytes) |
|---|---:|
| `bmlt.js` | 715898 |
| `bsc-anesthesia.js` | 455545 |
| `dental-ethics.js` | 43929 |
| `dental-materials.js` | 39270 |
| `dental-pharmacy.js` | 18055 |
| `dental-public-health.js` | 41269 |
| `dental-radiology.js` | 53681 |
| `dha.js` | 81409 |
| `epidemiology-community.js` | 50327 |
| `food-nutrition.js` | 41845 |
| `ha-module-v2.js` | 180243 |
| `mlt.js` | 812905 |
| `nhpc.js` | 414642 |
| `ophthalmic-science.js` | 599296 |
| `oral-anatomy.js` | 37255 |
| `oral-pathology.js` | 46234 |
| `ott.js` | 310187 |
| `pharmacy-faculties.js` | 20446 |
| `physiotherapy.js` | 490266 |
| `progress-sync.js` | 5030 |
| `radiography.js` | 360668 |
| `radiotherapy.js` | 159293 |
| `student-help.js` | 4898 |
| `study-guide.js` | 3713 |
| `sw.js` | 2713 |
| `weekly-live-exam.js` | 6590 |


### Candidate list classification correction

The filename/size listing above is intentionally broad and includes utility files that are **not** faculty content: `progress-sync.js`, `student-help.js`, `study-guide.js`, `sw.js`, and `weekly-live-exam.js` (these require separate review for whether they contain protected exam data). Therefore, the 26-file list is a source-candidate inventory, not a verified count of 26 faculty content modules. The confirmed faculty candidates include the faculty-named modules such as BMLT, BSc Anesthesia, Dental Pharmacy, DHA, MLT, NHPC, Ophthalmic Science, OTT, Physiotherapy, Radiography, Radiotherapy, and dental subject modules. Next audit should inspect each candidate's exports and any question/note arrays, then report exact item counts by faculty and content type.


## Sample content-array counts (source audit)

A static source scan of five smaller dental/health modules found these top-level source arrays. These are source-array counts only, not final imported/published counts; derived arrays, duplicate rows, and loader transformations still need reconciliation.

| Source file | Notes array | Base questions / qs array | Practice additions | Mock additions |
|---|---:|---:|---:|---:|
| `dental-ethics.js` | 21 | 39 | — | — |
| `dental-materials.js` | 21 | 39 | 9 | 9 |
| `dental-public-health.js` | 21 | 39 | 9 | 9 |
| `dental-radiology.js` | 21 | 39 | — | — |
| `dha.js` | 25 | 39 (`qs`) | topic-based arrays also present | expanded topic arrays also present |

**Interpretation:** these files include both English and Nepali text in the same source entries. Do not count translations as separate MCQs. For DHA, the `qs`, topic question sets, expanded topic questions, and competency data need careful deduplication before reporting a final count.

## Next migration-safe action

Continue source auditing and create a per-faculty manifest with the exact exported arrays and loader entry points. Do not bulk-import from these preliminary counts, and do not delete or disable the existing source files until database row counts and app behavior are verified.


### Additional source-array scan

| Source file | Notes array | Base questions | Practice additions | Mock additions |
|---|---:|---:|---:|---:|
| `food-nutrition.js` | 21 | 39 | 9 | 9 |
| `epidemiology-community.js` | 21 | 39 | 9 | 9 |
| `oral-anatomy.js` | 21 | 39 | 9 | 9 |
| `oral-pathology.js` | 21 | 39 | 9 | 9 |

The recurring structure appears to be 20 note records plus a trailing/source-format artifact and 38 question records plus a source-format artifact in these files; validate by evaluating the module's actual exported/loader arrays before finalizing counts. The safe import should use the same data structures the app currently displays, not simply count comma-separated source tokens.


## Large-faculty loader spot check (2026-11-27)

Reviewed the opening source sections of the following modules:

| Module | Initial finding | Migration implication |
|---|---|---|
| `bmlt.js` | Already labels itself a secure Supabase content module and begins with an RPC-based loading flow. | Inspect its exact RPC name, expected content shape, and current access policy; preserve its UI and migrate its backend call to the strict membership RPC. |
| `mlt.js` | Notes and topic/question data are embedded in the JavaScript module. | Move source arrays into protected content rows; replace local data fallback with membership-gated loading. |
| `nhpc.js` | Contains a local `bank` array of bilingual questions. | Treat the bank as public source content until moved behind authorization; map each row to faculty/subject/content type. |
| `physiotherapy.js` | Contains local topics and notes; module builds its content from embedded data. | Protected DB migration and loader conversion required. |
| `bsc-anesthesia.js` | Contains local syllabus/coverage data and bilingual content. | Audit notes, questions and any mock data separately; migrate all study-bearing arrays. |
| `ophthalmic-science.js` | Current opening section is a syllabus map and states detailed notes/MCQ/mock are to be added later. | No large question bank is confirmed from this opening; review complete file before marking it content-free. |

### Secure loader example: BMLT

BMLT is a useful migration template because it already has a status/loading UI and a `loadSecureContent` function. Before reuse, confirm the exact RPC and ensure it rejects both missing membership rows and expired trial/premium rows. Its existing “secure” label alone is not proof of strict authorization.

**Important:** The large faculty files have not yet been fully parsed or item-counted. This is a loader/source audit, not a completed content migration. Keep all existing content in place until protected database import and access tests pass.


### Loader risk details from line-level spot check

- `bmlt.js` normalizes DB question/note records, but also defines `builtInNotes` locally. This fallback must not render study material when the secure RPC denies access or returns no rows. The UI should instead show an access/renewal message.
- `mlt.js` begins with a large local `topics` and `notes` data structure. Local embedded study data remains readable from the public JavaScript file even if a membership panel is shown.
- `nhpc.js` begins with a local `bank` of bilingual question records. This question bank must move to protected storage, not merely be hidden by UI.
- `physiotherapy.js` and `bsc-anesthesia.js` similarly embed topics/notes/coverage. Content-bearing arrays should be removed from public delivery after successful import.
- `ophthalmic-science.js` currently starts as a syllabus map with no confirmed detailed question bank in the inspected section. The syllabus itself may be intentionally public, but any future notes/MCQ/mock must use the protected loader from the start.

### Proposed migration template (not yet implemented)

1. Keep faculty shell/navigation HTML and harmless syllabus overview public only if the product owner wants it public.
2. Load all study-bearing notes, practice MCQs, mock questions, answers and explanations through one strict RPC requiring `auth.uid()`, a membership row, and an unexpired active trial or paid premium.
3. Use content types `note`, `mcq`, and `mock`; include stable IDs, faculty, subject, ordering and JSON payload.
4. Remove embedded question/notes arrays and local fallback content from shipped JS after import row counts match the source.
5. On no membership / expired membership / RPC failure, render a supportive renewal notice and do not render cached or bundled study content.
6. Verify service worker and browser cache behavior so old JS or content payloads cannot remain available after expiry; client-side cache must not be treated as secure storage.

This template is planning only. No faculty data has been imported or removed in this commit.
