# Dental Hygienist Prep Nepal — Version 1

A free, mobile-first Progressive Web App (PWA) starter for bilingual Dental Hygienist license exam practice.

## Included
- English MCQs with Nepali translation and explanations
- Quick Periodontology revision notes
- Practice mode with immediate feedback
- 10-question timed mock test
- Local progress tracking using browser localStorage
- PWA manifest and service worker for install/offline caching

## Run locally
Because service workers require a secure context, use localhost rather than opening `index.html` directly.

```bash
python -m http.server 8000
```
Then open http://localhost:8000

## Publish free
1. Create a public repository on GitHub and upload the contents of this folder.
2. In repository Settings, enable GitHub Pages from the `main` branch and `/ (root)`.
3. Open the published HTTPS URL on your phone.
4. Use the browser menu → Install app / Add to Home Screen.

Alternatively, deploy the folder to Cloudflare Pages as a static site.

## Important
- This is an independent educational practice resource, not an official NHPC product.
- Questions are original practice questions, not verified past questions and not guaranteed exam questions.
- Check the current official NHPC/CTEVT curriculum and examination notices before using this as a complete syllabus.
- Progress is saved only on the same browser/device. No account, server, analytics, or cross-device sync is included.
- Google Fonts is used when online; system fonts are used as fallback.

## Next version ideas
Add verified subject-wise syllabus mapping, more question sets, bookmarks, wrong-answer revision, admin content editing, and optional cloud sync.
