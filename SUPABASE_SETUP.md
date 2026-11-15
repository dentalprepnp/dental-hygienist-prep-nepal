# Supabase setup — Dental Hygienist Prep Nepal

This project uses Supabase for optional student accounts and cross-device learning records. Public Notes, MCQs and Mock Tests remain accessible without signing in.

## 1. Create a Supabase project

1. Open https://supabase.com/ and sign in or create your account.
2. Select **New project**.
3. Choose an organization, enter a project name such as `dental-prep-nepal`, set a strong database password and select a nearby region if available.
4. Wait until the project is ready.

Keep your database password private. Do not send it to anyone or add it to GitHub.

## 2. Create the database tables

1. Open your project dashboard.
2. Select **SQL Editor**.
3. Open this repository file: `supabase/schema.sql`.
4. Copy the complete SQL into a new SQL query and press **Run**.
5. Confirm that the query completes successfully and that the tables appear under **Table Editor**.

The SQL enables Row Level Security (RLS). Each student can access only their own private progress, mock attempts, bookmarks and wrong-answer records.

## 3. Enable email login

1. In Supabase, open **Authentication → Providers**.
2. Ensure **Email** is enabled.
3. For the first setup, keep email confirmation enabled if you can configure email delivery; otherwise use the dashboard's available testing settings while developing.
4. In **Authentication → URL Configuration**, add:
   - Site URL: `https://dentalprepnp.github.io`
   - Redirect URL: `https://dentalprepnp.github.io/dental-hygienist-prep-nepal/**`

## 4. Enable Google login (optional setup)

Google login needs a Google OAuth Client ID and Client Secret from Google Cloud Console. Then enable Google under **Authentication → Providers → Google** in Supabase and add the Supabase callback URL shown on that screen to the Google OAuth client's authorized redirect URIs.

Do not paste OAuth client secrets into this repository.

## 5. Share only the public project settings needed for frontend setup

In **Project Settings → API** (or **Project Settings → Data API**, depending on dashboard layout), copy:

- Project URL
- Publishable key (preferred) or legacy `anon` public key

These are intended for browser use when Row Level Security is correctly configured. Never share the database password, personal access token, or `service_role` / secret key.

The login interface can be connected after the project URL and public key are available.
