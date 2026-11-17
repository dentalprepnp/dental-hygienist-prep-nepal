# HealthPrep

HealthPrep is a public, mobile-first bilingual learning and practice website for health-professional licensing preparation in Nepal.

## Public access
- Students can open learning sections, notes, MCQ practice and mock tests without creating an account.
- Login is optional and is used for cloud progress sync and membership features.
- Local study progress is stored in the browser on the device.

## Learning features
- NHPC subject-wise practice and mock tests
- English questions with Nepali explanations
- Bookmarks, wrong-answer practice and revision tests
- Mock-test history, performance reports and daily study goals
- Additional health-professional exam preparation sections

## Run locally
Use a local web server because service workers require a secure context (HTTPS or localhost):

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Publish
The project is hosted with GitHub Pages from the public repository:
https://github.com/dentalprepnp/dental-hygienist-prep-nepal

## Important
- This is an independent educational resource, not an official NHPC product.
- Questions are practice questions, not verified past examination questions and do not guarantee a pass.
- Always compare study content with the latest official syllabus and examination notices.
- Login is optional. Without login, progress remains on the same browser/device; optional cloud sync requires an account.
- Membership and payment functionality may require account verification and configured backend services.
- Google Fonts and cloud services require an internet connection.
