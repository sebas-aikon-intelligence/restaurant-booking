# Codebase Concerns

**Analysis Date:** 2026-06-09

---

## Schema Divergence (Critical)

**Two incompatible database schemas coexist:**
- Issue: `supabase/schema.sql` defines a `restaurants`/`users` model with `restaurant_id` foreign keys. The actual applied migrations in `supabase/migrations/` define a completely different `organizations`/`profiles` model with `org_id` foreign keys. The application code (`types/index.ts`, `hooks/use-realtime-tables.ts`) references `org_id` and uses the migration schema, but `schema.sql` and `trigger.sql` represent an abandoned parallel design. These two schemas are **incompatible** and cannot both be applied to the same database.
- Files: `supabase/schema.sql`, `supabase/trigger.sql`, `supabase/migrations/20251216000000_init_schema.sql`, `supabase/migrations/20251216000001_zones_tables.sql`
- Impact: New developers running `schema.sql` will have the wrong database structure. The trigger in `trigger.sql` references `public.restaurants` and `public.users` which do not exist in the migration schema. Any attempt to apply `schema.sql` after migrations will fail or corrupt data.
- Fix approach: Delete `supabase/schema.sql` and `supabase/trigger.sql` entirely, or clearly mark them as legacy/archived. The migrations folder is the source of truth.

---

## Tech Debt

**Public Booking Page is a Non-Functional Stub:**
- Issue: `app/[slug]/page.tsx` is a placeholder that displays "Motor de Reservas (Próximamente)" and imports `notFound` but never calls it. No Supabase lookup is performed. The page accepts a `slug` param but does nothing with it beyond rendering it in the heading.
- Files: `app/[slug]/page.tsx`
- Impact: The core customer-facing feature — restaurant public booking — does not exist. The entire product value proposition is blocked.
- Fix approach: Implement slug-to-organization lookup via Supabase, render the canvas read-only, and wire up a booking form that inserts into the `bookings` table (covered by the `"Anyone can insert bookings"` RLS policy already in schema).

**Admin Dashboard Sidebar Links to Non-Existent Routes:**
- Issue: `app/admin/layout.tsx` contains hardcoded links to `/admin/reservas`, `/admin/mesas`, `/admin/menu`, `/admin/eventos`, `/admin/clientes`, `/admin/configuracion`. None of these routes exist as Next.js page files.
- Files: `app/admin/layout.tsx`
- Impact: Every nav item except the root `/admin` leads to a 404. The admin panel is effectively non-navigable.
- Fix approach: Either create the route files under `app/admin/` or replace this with the `components/layout/sidebar.tsx` which links to the `/dashboard/*` routes that also appear to be deleted (per git status showing `D app/(dashboard)/...`).

**Dashboard Routes Deleted but Sidebar Still References Them:**
- Issue: Git status shows all `app/(dashboard)/` routes were deleted (Canvas, Host, Menu, POS, Settings, Staff pages). However `components/layout/sidebar.tsx` still points to `/dashboard/canvas`, `/dashboard/menu`, etc. The Sidebar component references a hardcoded `href: "/book/lumiere-dining"` for the Booking nav item — a demo slug, not dynamic.
- Files: `components/layout/sidebar.tsx`
- Impact: The sidebar is orphaned — it belongs to a deleted route group. The app is in a mid-refactor state with no working dashboard.
- Fix approach: Decide on one routing structure (`/admin/*` or `/dashboard/*`) and rebuild accordingly.

**All UI Pages in `/admin` are Stubs:**
- Issue: `app/admin/page.tsx` renders only a welcome message with no functionality. `app/admin/layout.tsx` has a hardcoded placeholder sidebar.
- Files: `app/admin/page.tsx`, `app/admin/layout.tsx`
- Impact: The entire authenticated experience is a shell with no real features.
- Fix approach: Implement feature pages or restore the deleted `(dashboard)` route group.

**Demo Data Used as Real Data Source:**
- Issue: `lib/demo-data.ts` contains hardcoded fixtures (reservations, staff, menu items, tables). Several components appear to have been wired to this static data instead of Supabase queries. The `MenuItem` and `Reservation` types are defined here rather than in `types/index.ts`.
- Files: `lib/demo-data.ts`, `components/menu/add-menu-item-modal.tsx`
- Impact: `AddMenuItemModal` imports `MenuItem` from `lib/demo-data` instead of a shared types module. No data created in the modal persists anywhere — there is no `onSave` handler that writes to Supabase. Data is lost on page reload.
- Fix approach: Move shared types to `types/index.ts`. Implement Supabase server actions for all write operations. Remove `lib/demo-data.ts` when all features are wired to real data.

**Realtime Hook Missing DELETE Event Handler:**
- Issue: `hooks/use-realtime-tables.ts` handles `INSERT` and `UPDATE` postgres_changes events but has no handler for `DELETE`. The subscription listens for `event: '*'` which includes DELETE, but deletes are silently ignored.
- Files: `hooks/use-realtime-tables.ts`
- Impact: When a table is deleted from Supabase (e.g., by another admin), it remains visible in the UI until a full page reload.
- Fix approach: Add a `DELETE` branch that filters the deleted record's `id` out of state: `setTables(current => current.filter(t => t.id !== payload.old.id))`.

**`isEditing` Prop Passed to Hook but Never Used:**
- Issue: `useRealtimeTables` accepts `isEditing: boolean` as a parameter. A comment inside the hook says "But if I'm editing, I might ignore this to avoid jitter?" but the parameter is never used in logic.
- Files: `hooks/use-realtime-tables.ts:12`
- Impact: Remote updates overwrite in-progress drag operations, causing visual jitter when two admins are editing simultaneously.
- Fix approach: When `isEditing` is `true`, suppress incoming `UPDATE` events for the table currently being dragged.

---

## Security Considerations

**`.env.local` Not in `.gitignore`:**
- Risk: The `.gitignore` file contains only `node_modules`. `.env.local` (which contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` and potentially service role keys) is untracked but not explicitly excluded. Any future `git add .` could accidentally commit credentials.
- Files: `.gitignore`, `.env.local`
- Current mitigation: `.env.local` is currently untracked (shown as `??` in git status).
- Recommendations: Add `.env.local`, `.env*.local`, `.env` to `.gitignore` immediately. Standard Next.js `.gitignore` entries are missing.

**No Auth Protection on `/admin` Sub-Routes:**
- Risk: `lib/supabase/middleware.ts` only checks `request.nextUrl.pathname.startsWith('/admin')`. This correctly redirects unauthenticated users, but there is no role check — any authenticated user (even if their profile has no `org_id` or is a `waiter` role) can access the admin panel.
- Files: `lib/supabase/middleware.ts:36`
- Current mitigation: None beyond authentication check.
- Recommendations: After fetching `user`, also fetch the profile to validate the user has an `org_id` and an appropriate role (`owner` or `manager`) before granting access.

**Slug Uniqueness Not Enforced at Registration Time:**
- Risk: `app/register/page.tsx` auto-generates a slug from the restaurant name and submits it via Supabase Auth metadata. The `handle_new_user` trigger inserts into `organizations` without a `UNIQUE` constraint on `slug` (the migration schema has `slug text` with no UNIQUE keyword, unlike `schema.sql`).
- Files: `app/register/page.tsx`, `supabase/migrations/20251216000000_init_schema.sql:7`
- Current mitigation: None — duplicate slugs are possible.
- Recommendations: Add a `UNIQUE` constraint to `organizations.slug`. Add a real-time availability check in the registration form before submission.

**Silent Error in Trigger Validation Block:**
- Risk: `trigger.sql` has a `BEGIN IF ... END IF` validation block with no body — the comment says "la mejor evitar" (better to avoid) but the function proceeds anyway with `COALESCE` fallbacks. If metadata is malformed, a restaurant is silently created with `'Restaurante Sin Nombre'` and a random UUID slug.
- Files: `supabase/trigger.sql:12-16`
- Current mitigation: `COALESCE` prevents hard crashes.
- Recommendations: This trigger is moot since the active schema uses a different trigger in the migrations. Resolve schema divergence first.

**Password Minimum Length is Only 6 Characters:**
- Risk: `app/register/page.tsx` enforces `minLength={6}` via HTML attribute only — Supabase's default minimum is also 6. This is well below modern security standards.
- Files: `app/register/page.tsx:174`
- Current mitigation: None beyond the 6-char floor.
- Recommendations: Increase to minimum 8 characters and add a strength indicator.

**"Forgot Password" Link is Dead:**
- Risk: `app/login/page.tsx:77` has `<a href="#">¿Olvidaste tu contraseña?</a>` — a non-functional anchor. Users who lose their password have no recovery path.
- Files: `app/login/page.tsx:77`
- Recommendations: Implement a `/forgot-password` route using `supabase.auth.resetPasswordForEmail()`.

---

## Performance Bottlenecks

**Supabase Client Created on Every Render in Hook:**
- Problem: `hooks/use-realtime-tables.ts:13` calls `createClient()` at the top level of the hook body (outside `useEffect`). This creates a new Supabase browser client on every render cycle.
- Files: `hooks/use-realtime-tables.ts:13`
- Cause: `createClient()` is not memoized.
- Improvement path: Move `createClient()` call into `useMemo` or use a module-level singleton pattern.

**No Image Optimization for External URLs:**
- Problem: `lib/demo-data.ts` and components reference Unsplash image URLs directly without using Next.js `<Image>` component. No width/height hints, no lazy loading, no format optimization.
- Files: `lib/demo-data.ts:53-58`
- Cause: Plain `<img>` tags or CSS backgrounds used instead of `next/image`.
- Improvement path: Use `next/image` for all restaurant images. Add `images.remotePatterns` for `images.unsplash.com` in `next.config.mjs`.

---

## Fragile Areas

**Registration Flow Has Race Condition Risk:**
- Files: `app/register/page.tsx:56-63`
- Why fragile: After successful `signUp`, the code sets `success: true` then uses `setTimeout(() => router.push('/admin'), 2000)`. If the database trigger (`handle_new_user`) hasn't completed by the time the redirect happens, the `/admin` page will fetch a profile that doesn't exist yet, causing a blank or broken state.
- Safe modification: Replace `setTimeout` with a polling check or use Supabase's `auth.onAuthStateChange` to confirm the session is established before redirecting.

**Table Shape Field is Inconsistent Across Codebase:**
- Files: `types/index.ts`, `lib/demo-data.ts:71-77`, `supabase/migrations/20251216000001_zones_tables.sql:16`
- Why fragile: The `Table` type in `types/index.ts` defines `position.shape` as `'rect' | 'circle'`. The migration stores `position` as a `JSONB` column with a default including `"shape": "rect"`. The demo data adds `shape` as a top-level key alongside `position` (not nested inside it). `lib/demo-data.ts:77` casts the entire tables array `as any[]` with a comment acknowledging the mismatch. This means table rendering may silently fail for shapes.
- Safe modification: Standardize shape as `position.shape` everywhere. Add a Zod or runtime validator when reading tables from Supabase.

**`app/[slug]/page.tsx` Imports `notFound` but Never Calls It:**
- Files: `app/[slug]/page.tsx:1`
- Why fragile: The import is dead code. When the booking page is implemented, the developer must remember to call `notFound()` for invalid slugs, or the page will render an empty UI for non-existent restaurants.
- Safe modification: Implement the slug lookup and call `notFound()` when the query returns null.

---

## Missing Critical Features

**No Email Confirmation Flow:**
- Problem: `app/register/page.tsx:57` has a comment "En un flujo real, quizás enviemos un correo de confirmación" but redirects immediately. Supabase's `signUp` by default requires email confirmation, so users may be redirected to `/admin` before verifying their email, resulting in an unverified session.
- Blocks: Reliable user onboarding.

**No Sign-Out Route:**
- Problem: `components/layout/sidebar.tsx:60` has a form posting to `/auth/signout` but that route (`app/auth/signout/route.ts`) is deleted per git status (`D app/auth/signout/route.ts`). Clicking the logout button in the sidebar will result in a 404.
- Files: `components/layout/sidebar.tsx:60`
- Blocks: Users cannot log out.

**No Auth Callback Route:**
- Problem: `app/auth/callback/route.ts` is also deleted per git status. This route handles email verification redirects from Supabase. Without it, email confirmation links will return a 404.
- Blocks: Email verification, password reset flows.

---

## Test Coverage Gaps

**No Test Files Exist:**
- What's not tested: The entire codebase has zero test files. No unit tests, no integration tests, no E2E tests.
- Files: All source files under `app/`, `components/`, `hooks/`, `lib/`
- Risk: Any change can silently break auth flows, schema triggers, or UI components.
- Priority: High — especially for the auth trigger logic and realtime hook.

---

## Dependencies at Risk

**`next` is on v14 (14.2.18), not v15:**
- Risk: Next.js 15 introduced async `cookies()` and `headers()` APIs. `lib/supabase/server.ts:5` calls `cookies()` synchronously — this works on v14 but will require updates before upgrading.
- Files: `lib/supabase/server.ts:5`, `package.json`
- Impact: Upgrade to Next.js 15 will break the server Supabase client without code changes.
- Migration plan: Update `createClient()` to `await cookies()` pattern before upgrading Next.js.

**`@supabase/ssr` is v0.5.0 (pre-1.0):**
- Risk: The package is not at a stable 1.0 release. Breaking changes between minor versions are possible.
- Files: `package.json`
- Impact: Supabase SSR auth helpers may change cookie handling APIs.
- Migration plan: Pin to exact version in package.json and test upgrades explicitly.

---

*Concerns audit: 2026-06-09*
