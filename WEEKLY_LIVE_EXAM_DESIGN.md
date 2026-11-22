# Weekly Live Exam — Product & Technical Design

## Purpose
Add a separate Weekly Live Exam area to HL Preparation without changing or deleting existing learning content, accounts, progress, or mock-test history.

## Fixed schedule
- Nepal Time (Asia/Kathmandu), every Saturday at 18:00.
- Duration: 60 minutes.
- Prepare four exams per faculty in one monthly admin workflow (Week 1–4).
- If a calendar month has a fifth Saturday, it is an optional special/practice exam and does not replace the four scheduled exams.
- Admin can edit a schedule before it opens; any change triggers an updated notification.

## Faculty and symbol numbers
- Every exam belongs to exactly one faculty/track.
- Symbol format: FACULTY-W##-NNNN (examples: NHPC-W01-0001, BMLT-W01-0001, HA-W01-0001).
- Use a faculty-specific short code configured centrally; do not infer codes from user-entered text.
- Symbol numbers are unique within an exam and are assigned once at the student's first successful registration for that exam. Reopening the same exam shows the same symbol.
- The database, not the browser, allocates serials atomically to prevent duplicates during simultaneous registrations.

## Student journey
1. Student signs in and opens Weekly Live Exam.
2. App shows the next scheduled exam for the student's selected/registered faculty, exam rules, date/time, duration, and symbol number when assigned.
3. Student joins the exam. The server records the start time and deadline; the browser countdown is only a display.
4. One question at a time, four choices, question palette, Previous/Next, unanswered/answered/review markers.
5. Answers autosave to the server. Refresh/re-login resumes the same attempt and remaining server-calculated time.
6. At the deadline, server submission/auto-grading closes the attempt. A student cannot create a second attempt for the same exam.
7. Result is visible only after admin publishes it.

## Exam paper and question bank
- Admin creates and reviews four weekly papers per faculty in advance.
- Question fields: stem, optional Nepali translation, four options, correct option, English explanation, optional Nepali explanation, faculty, subject, topic, difficulty, source/reference note, review status, and tags.
- Question sources: approved existing app MCQs, manually authored questions, and AI-drafted questions.
- AI-drafted questions remain Draft until an authorized admin reviews accuracy, answer key, language, and syllabus alignment.
- Generator selects only Approved questions, follows admin-set subject/difficulty distribution, and avoids recently used questions where the bank allows.
- Keep answer keys and explanations server-side. Never send correct answers to the student before the exam is closed and results are published.
- Admin can preview and edit the paper before publishing/scheduling it.

## Exam configuration
Each faculty/exam can set its own:
- question count and total marks;
- marks per question;
- pass mark or pass percentage;
- negative marking (default off unless explicitly configured);
- allowed start/end window and duration;
- subject/difficulty distribution.
Do not assume every faculty has the same official licensing-exam blueprint. Label these as HL Preparation practice exams, not official licensing examinations.

## Results
- Auto-calculate obtained marks, percentage, pass/fail, correct/incorrect/unanswered counts, and subject-wise performance.
- PASS screen: “Congratulations!”; FAIL screen: “Try Again!” with encouraging language.
- Show student's name, faculty, exam date, symbol number, marks, percentage, pass mark, and result.
- Ranking is within the same faculty and same weekly exam. Define tie handling consistently (same score = same rank is recommended).
- Result lookup page: faculty + exam + symbol number + registered phone number. No OTP in the first release for ease of use, but the lookup endpoint must be server-side, rate-limited, return generic errors, and disclose only the matching student's own result. Prefer signed-in account lookup as the safer default.
- Admin reviews result totals and can publish/unpublish. Record who published and when.
- Admin result list filters by month, exam, faculty, pass/fail, and search by student name or symbol number.
- Print-friendly A4 report and CSV/PDF export; include serial, symbol, student name, marks, percentage, pass/fail, and rank. Hide controls/navigation when printing.

## Notifications
- Ask students to enable app notifications.
- Send a reminder 24 hours before each exam, containing faculty, exam name, date/time, duration, and that student's symbol number.
- Send only to students registered for that faculty/exam.
- If schedule changes, send an updated reminder.
- Push delivery requires a service-worker push handler, browser permission/subscription, VAPID keys stored only in server secrets, and a scheduled server-side job. Do not put private push keys in frontend code.
- If push is unavailable/denied, show an in-app reminder.

## Admin permissions and data protection
- Admin-only question bank, answer keys, paper editing, schedules, student roster, and full result sheets must be protected by Supabase Row Level Security and server-side authorization, not just hidden UI.
- Students may read their own registration, attempt state, and published result only.
- Students must never read answer keys or other students' personal records/results.
- Use authenticated user IDs as the primary identity; never trust a client-supplied name, faculty, symbol number, score, pass/fail, or deadline.
- Keep all existing tables and rows. Add new exam tables with non-destructive migrations; do not reset or truncate existing data.
- Keep service-role keys and AI API keys in Supabase Edge Function secrets only.

## Suggested implementation phases
1. Build additive database migration with tables, indexes, RLS, atomic symbol allocation, and secure RPC/Edge Function boundaries.
2. Build student exam lobby, exam hall, resume/autosave, and published result view.
3. Build admin question bank, AI draft/review workflow, four-week paper builder, and scheduler.
4. Build result review, publish, ranking, print/PDF and symbol+phone lookup.
5. Add scheduled 24-hour push reminders and in-app fallback.
6. Test with test accounts across multiple faculties, simultaneous symbol allocation, reload/network interruption, deadline enforcement, result privacy, and print layout before public launch.

## Current repository integration notes
- Existing app is a static GitHub Pages PWA with Supabase Auth and existing admin membership checks.
- Existing profiles and user_roles are separate from the legacy admin_users table; new exam authorization must use one clearly defined server-verified admin role and must not weaken either existing access boundary.
- Existing service worker uses versioned cache names. Any new exam scripts/styles require a cache-version bump and script asset registration strategy.
- The current repository setup docs describe a Supabase schema and separate admin setup. Confirm the live project's applied schema and policies before running migrations.
