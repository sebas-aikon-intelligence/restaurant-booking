# External Integrations

**Analysis Date:** 2026-06-09

## APIs & External Services

**Backend-as-a-Service:**
- Supabase - Primary backend providing database, auth, storage, and realtime
  - SDK/Client (server): `@supabase/ssr` via `lib/supabase/server.ts` (`createServerClient`)
  - SDK/Client (browser): `@supabase/ssr` via `lib/supabase/client.ts` (`createBrowserClient`)
  - SDK/Client (middleware): `@supabase/ssr` via `lib/supabase/middleware.ts` (`createServerClient`)
  - Auth: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Project URL: `https://gkiqmbvzhbauwvacszsj.supabase.co`

**CDN / Media:**
- Unsplash (`images.unsplash.com`) - Whitelisted as remote image host in `next.config.mjs`

**Fonts:**
- Google Fonts - Inter font loaded via `next/font/google` in `app/layout.tsx`

## Data Storage

**Databases:**
- Supabase (PostgreSQL)
  - Connection: `NEXT_PUBLIC_SUPABASE_URL`
  - Client: `@supabase/supabase-js` / `@supabase/ssr`
  - Schema file: `supabase/schema.sql`
  - Tables: `restaurants`, `users`, `zones`, `tables`, `events`, `menu_items`, `bookings`, `messages`
  - RLS enabled on all tables
  - Custom enums: `user_role` (`admin`, `staff`), `booking_status` (`pending`, `confirmed`, `cancelled`, `completed`, `no_show`), `message_status` (`new`, `in_progress`, `resolved`)

**File Storage:**
- Not explicitly configured; `image_url` columns exist in schema (restaurants, tables, events, menu_items) suggesting external URLs or Supabase Storage (not yet wired in code)

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (email/password)
  - Sign-up: `supabase.auth.signUp()` with user metadata (`first_name`, `restaurant_name`, `slug`) — `app/register/page.tsx`
  - Sign-in: `supabase.auth.signInWithPassword()` — `app/login/page.tsx`
  - Session management: cookie-based via `@supabase/ssr`, refreshed in Next.js middleware (`lib/supabase/middleware.ts`)
  - Route protection: `/admin/*` routes redirect unauthenticated users to `/login` in `middleware.ts`
  - Post-registration trigger: `supabase/trigger.sql` — `on_auth_user_created` trigger auto-creates `restaurants` and `users` rows from auth metadata

## Realtime

**Supabase Realtime:**
- Used in `hooks/use-realtime-tables.ts`
- Subscribes to `postgres_changes` on the `tables` table (INSERT, UPDATE, DELETE events)
- Channel: `realtime_tables`
- Used for live canvas/floor plan updates in the admin UI

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- `console.log` only (no structured logging library)

## CI/CD & Deployment

**Hosting:**
- Not explicitly configured; app is structured for Vercel (Next.js App Router conventions)

**CI Pipeline:**
- None detected

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project REST/API URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (public, JWT)

**Secrets location:**
- `.env.local` (in project root, not committed to git per `.gitignore`)

## Webhooks & Callbacks

**Incoming:**
- None detected (no webhook route handlers present)

**Outgoing:**
- None detected

## Database Automation

**PostgreSQL Triggers:**
- `on_auth_user_created` (`supabase/trigger.sql`) — fires after INSERT on `auth.users`, calls `public.handle_new_user()` to provision a new `restaurants` row and a `public.users` profile row automatically on signup
- Helper function: `get_user_restaurant_id()` — SECURITY DEFINER function used in RLS policies to scope data by `restaurant_id`

---

*Integration audit: 2026-06-09*
