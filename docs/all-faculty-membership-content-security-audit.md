# All-Faculty Membership Content Security Audit

Date: 2026-11-28
Status: Discovery audit only — no database migration is approved or ready to run.

## Current architecture discovered

The app has a central client-side membership check in `membership.js` and a faculty navigation check in `index.html`. These checks improve the user experience but do not protect content already shipped in public JavaScript files. A student can download those files or inspect cached/offline assets.

## Faculty/content modules reviewed

| Module/file | Current content delivery observed | Server-side protection status |
|---|---|---|
| BMLT (`bmlt.js`) | Has Supabase content loader plus bundled/local fallback code | Needs full migration and schema validation; fail-closed fallback patch is drafted separately |
| D.Pharm / B.Pharm (`pharmacy-faculties.js`) | Supabase-backed loader | Must verify every RPC/table policy and remove any bundled content |
| Dental Pharmacy (`dental-pharmacy.js`) | Supabase-backed loader | Must verify every RPC/table policy and remove any bundled content |
| Dental Hygienist / NHPC (`nhpc.js`) | Large static JavaScript module | Not protected against source download |
| MLT (`mlt.js`) | Large static JavaScript module | Not protected against source download |
| OTT (`ott.js`) | Large static JavaScript module | Not protected against source download |
| Physiotherapy (`physiotherapy.js`) | Large static JavaScript module | Not protected against source download |
| B.Sc. Anaesthesia (`bsc-anesthesia.js`) | Large static JavaScript module | Not protected against source download |
| Ophthalmic Science (`ophthalmic-science.js`) | Large static JavaScript module | Not protected against source download |
| Radiography / Radiotherapy and smaller modules | Static JavaScript modules | Not protected against source download |
| DHA / Loksewa and other exam modules | Must be audited individually | Not yet verified |

## Required safe migration plan

1. Inventory every script loaded directly or lazily by each faculty, including HA, Loksewa, DHA, notes, MCQ, mock tests, and offline/service-worker caches.
2. Export each module's content into normalized Supabase rows, preserving faculty, subject, content type, ordering, bilingual explanations, options, and answer keys.
3. Add a server-side RPC that checks `auth.uid()`, the current membership row, trial end timestamp, premium expiry, and admin role before returning any protected content. Fail closed on missing membership or errors.
4. Revoke direct browser SELECT access to protected content tables only after all consumers use the protected RPC. Preserve any genuinely public data separately.
5. Update each faculty loader to fetch content only after successful server authorization. Remove protected question banks/notes from public JavaScript bundles and service-worker precache/offline caches.
6. Test active trial, expired trial, active premium, expired premium, logged-out, database/network error, and admin. Confirm expired users receive no content payload.
7. Deploy in stages with a rollback plan. Do not run a blanket revoke or migration against the live database until schema and all faculty loaders are verified.

## Important warning

The previously drafted blanket `get_learning_content` migration was removed from this draft because it was not validated against every faculty's schema and consumer. Do not run it. No live database or production code has been changed by this audit.
