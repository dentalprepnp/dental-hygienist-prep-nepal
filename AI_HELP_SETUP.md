# AI Student Help setup (all faculties)

The app includes the floating AI Help chat UI and a Supabase Edge Function at `supabase/functions/student-help/index.ts`. The AI reply will work only after the function is deployed and its provider secret is set.

## Before enabling
- Create/confirm an OpenAI API account and API billing. ChatGPT subscription is separate from API billing.
- Keep the API key private. Never paste it into `index.html`, `student-help.js`, or any browser code.
- This endpoint is public so students can ask for login help before signing in. It has input limits and best-effort in-memory throttling; before wide public release, add persistent rate limiting/abuse monitoring at Supabase or an API gateway.

## Deploy with Supabase CLI
Run from the repository root after installing and logging in to Supabase CLI, and linking the correct Supabase project:

```sh
supabase login
supabase link --project-ref jrivojhpdupxnpefevzm
supabase secrets set OPENAI_API_KEY=YOUR_PRIVATE_OPENAI_API_KEY
supabase functions deploy student-help --no-verify-jwt
```

Use your real key locally in the terminal; do not commit it or send it in chat. The project config sets `verify_jwt = false` because the help widget must be available to students who cannot log in. The function only returns AI text and does not access student account data.

After deploy, open the app, tap AI Help, and test a simple question such as “Login मा समस्या भयो”. Check function logs in Supabase if the AI service is unavailable. Add persistent rate limits and usage/billing alerts before promoting it widely.
