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
