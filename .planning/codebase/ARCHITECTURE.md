# Architecture

**Analysis Date:** 2026-06-09

## Pattern Overview

**Overall:** Multi-tenant SaaS with Next.js App Router, Supabase backend, and client-side real-time state

**Key Characteristics:**
- Multi-tenant: every restaurant is isolated by `restaurant_id`; Row Level Security enforced at the database layer via a `get_user_restaurant_id()` helper function
- Two distinct user surfaces: an authenticated admin dashboard (`/admin`, `/dashboard`) and a public-facing booking page (`/[slug]`)
- Authentication handled entirely by Supabase Auth; session refresh delegated to Next.js middleware
- A Postgres trigger (`handle_new_user`) automatically provisions a `restaurants` row and a `users` profile row on signup, keeping onboarding atomic
- Real-time table state updates are pushed to the Canvas view via Supabase Realtime channels (postgres_changes on the `tables` table)

## Layers

**Routing / Page Layer:**
- Purpose: Define URL surfaces, fetch initial data, render page shells
- Location: `app/`
- Contains: `page.tsx`, `layout.tsx` files; no business logic
- Depends on: Supabase server client, shared components
- Used by: Next.js router

**Middleware / Auth Guard:**
- Purpose: Refresh Supabase session on every request; redirect unauthenticated users away from `/admin`
- Location: `middleware.ts` (root), `lib/supabase/middleware.ts`
- Contains: `updateSession()` — reads/writes session cookies, performs route guard
- Depends on: `@supabase/ssr`, Next.js `NextRequest`/`NextResponse`
- Used by: Every HTTP request (matched via `config.matcher`)

**Supabase Client Abstraction:**
- Purpose: Provide correct Supabase client for each execution context
- Location: `lib/supabase/`
- Contains:
  - `client.ts` — browser client via `createBrowserClient` (used in Client Components and hooks)
  - `server.ts` — server client via `createServerClient` with cookie store (used in Server Components and Server Actions)
  - `middleware.ts` — server client wired to `NextRequest` cookies (used only in middleware)
- Depends on: `@supabase/ssr`, env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Used by: All data-fetching code

**UI Component Layer:**
- Purpose: Reusable presentational and interactive components
- Location: `components/`
- Contains: Domain-grouped feature components (`canvas/`, `menu/`, `layout/`) and primitive UI atoms (`ui/`)
- Depends on: `@dnd-kit/core` for drag-and-drop, `lucide-react` for icons, `lib/utils.ts` for `cn()`
- Used by: Page layer

**Custom Hooks Layer:**
- Purpose: Encapsulate client-side side effects, real-time subscriptions
- Location: `hooks/`
- Contains: `use-realtime-tables.ts` — subscribes to Supabase Realtime channel for `tables` table mutations
- Depends on: `lib/supabase/client.ts`, `@/types`
- Used by: Canvas page component

**Type Definitions:**
- Purpose: Shared TypeScript interfaces aligned to database schema
- Location: `types/index.ts`
- Contains: `Table`, `Zone` interfaces
- Used by: Components, hooks, server actions

**Database Layer:**
- Purpose: Persistent multi-tenant storage with built-in access control
- Location: `supabase/schema.sql`, `supabase/trigger.sql`, `supabase/migrations/`
- Contains: 8 tables (`restaurants`, `users`, `zones`, `tables`, `events`, `menu_items`, `bookings`, `messages`), RLS policies, `handle_new_user` trigger
- Used by: Supabase server/client via PostgREST

**Demo / Fixture Data:**
- Purpose: Static data used while real Supabase integration is incomplete
- Location: `lib/demo-data.ts`
- Contains: `DEMO_DATA` constant with typed `MenuItem`, `Reservation`, `Staff`, `Metric` interfaces
- Used by: Dashboard pages that haven't yet wired to live data

## Data Flow

**Authentication (Login):**

1. User submits email/password in `app/login/page.tsx` (Client Component)
2. `createClient()` from `lib/supabase/client.ts` calls `supabase.auth.signInWithPassword()`
3. Supabase sets session cookies
4. `middleware.ts` → `updateSession()` refreshes the session on subsequent requests
5. Route guard in `updateSession()` redirects `/admin/**` to `/login` when no user session exists

**Registration:**

1. User submits form in `app/register/page.tsx` (Client Component) including `restaurant_name` and `slug` as user metadata
2. `supabase.auth.signUp()` creates an `auth.users` record
3. Postgres trigger `handle_new_user` fires, inserts into `public.restaurants` and `public.users` atomically
4. Client redirects to `/admin`

**Canvas / Table Management (Real-time):**

1. `app/admin` (or future `/dashboard/canvas`) Server Component fetches initial tables via `lib/supabase/server.ts`
2. Tables passed as props to a Client Component
3. `useRealtimeTables` hook in `hooks/use-realtime-tables.ts` subscribes to `postgres_changes` on the `tables` channel
4. On `INSERT` or `UPDATE` events, local React state is updated without a full page reload
5. `TableNode` component in `components/canvas/table-node.tsx` renders each table using absolute positioning; drag is handled by `@dnd-kit/core`

**Public Booking Page:**

1. Request hits `app/[slug]/page.tsx` with the restaurant slug as a route param
2. Page (currently a stub) will look up `restaurant_id` from `slug` in `public.restaurants` (publicly readable via RLS)
3. Guest submits a booking; `bookings` table allows anonymous INSERT via RLS policy `"Anyone can insert bookings"`

**State Management:**
- Server-rendered initial state passed as props from Server Components to Client Components
- Client state managed with React `useState`; real-time updates applied via `setTables` dispatcher passed to `useRealtimeTables`
- No global state manager (no Redux, Zustand, or Context)

## Key Abstractions

**`createClient()` (dual context):**
- Purpose: Provide the right Supabase client based on execution context
- Examples: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server), `lib/supabase/middleware.ts` (edge)
- Pattern: Same export name `createClient` from different modules; callers import from the context-appropriate path

**`TableNode`:**
- Purpose: Visual representation of a restaurant table on the drag-and-drop canvas
- Examples: `components/canvas/table-node.tsx`
- Pattern: Client Component wrapping `@dnd-kit/core`'s `useDraggable`; disabled when not in edit mode

**`Sidebar`:**
- Purpose: Primary navigation for the authenticated admin panel
- Examples: `components/layout/sidebar.tsx`
- Pattern: Fixed left rail with icon-only links and tooltip labels; active state derived from `usePathname()`

**Multi-tenant RLS Helper:**
- Purpose: Scope all database queries to the authenticated user's restaurant
- Examples: `supabase/schema.sql` — `get_user_restaurant_id()` SQL function
- Pattern: All RLS policies reference this function rather than hardcoding tenant logic

## Entry Points

**Landing Page:**
- Location: `app/page.tsx`
- Triggers: HTTP GET `/`
- Responsibilities: Marketing page; links to `/login` and `/register`

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: All routes
- Responsibilities: HTML shell, Inter font, global CSS

**Admin Layout:**
- Location: `app/admin/layout.tsx`
- Triggers: Any `/admin/**` route
- Responsibilities: Two-column shell with sidebar nav and main content area

**Public Booking Page:**
- Location: `app/[slug]/page.tsx`
- Triggers: HTTP GET `/{restaurant-slug}`
- Responsibilities: Show restaurant-specific booking UI (stub; slug available via `params.slug`)

**Middleware:**
- Location: `middleware.ts`
- Triggers: Every request except static assets and images
- Responsibilities: Session refresh, auth guard for `/admin`

## Error Handling

**Strategy:** Inline form-level error state; no global error boundary observed

**Patterns:**
- Login/register pages catch Supabase auth errors and render them in a red inline `<div>` below the form
- Server component cookie write errors are silently swallowed in `lib/supabase/server.ts` (`try/catch` with empty catch — intentional per Supabase SSR docs)
- No `error.tsx` boundary files present

## Cross-Cutting Concerns

**Logging:** `console.log` only; one commented-out debug log in `hooks/use-realtime-tables.ts`
**Validation:** Client-side only via HTML `required`, `minLength`, `type` attributes; no Zod or server-side validation layer
**Authentication:** Supabase Auth with session cookies; enforced at middleware layer and at database layer via RLS

---

*Architecture analysis: 2026-06-09*
