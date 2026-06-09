# Codebase Structure

**Analysis Date:** 2026-06-09

## Directory Layout

```
Restaurant Booking/           # Project root
├── app/                      # Next.js App Router pages and layouts
│   ├── [slug]/               # Public-facing restaurant booking page (guest route)
│   │   └── page.tsx
│   ├── admin/                # Authenticated admin panel
│   │   ├── layout.tsx        # Admin shell: sidebar + main content
│   │   └── page.tsx
│   ├── login/                # Auth: sign in
│   │   └── page.tsx
│   ├── register/             # Auth: sign up
│   │   └── page.tsx
│   ├── globals.css           # Global Tailwind base styles
│   ├── layout.tsx            # Root HTML layout (font, metadata)
│   └── page.tsx              # Landing / marketing page
├── components/               # Shared React components
│   ├── canvas/               # Drag-and-drop table canvas components
│   │   ├── edit-table-modal.tsx
│   │   └── table-node.tsx
│   ├── layout/               # App shell components
│   │   └── sidebar.tsx
│   ├── menu/                 # Menu management components
│   │   └── add-menu-item-modal.tsx
│   └── ui/                   # Primitive UI atoms (shadcn-style)
│       ├── button.tsx
│       └── input.tsx
├── hooks/                    # Custom React hooks
│   └── use-realtime-tables.ts
├── lib/                      # Shared utilities and service clients
│   ├── supabase/             # Supabase client factories (context-specific)
│   │   ├── client.ts         # Browser client
│   │   ├── middleware.ts     # Edge/middleware client
│   │   └── server.ts         # Server Component client
│   ├── demo-data.ts          # Static fixture data for unimplemented features
│   └── utils.ts              # `cn()` Tailwind class merge utility
├── public/                   # Static assets served at root
├── supabase/                 # Database schema and migrations
│   ├── migrations/           # Versioned SQL migration files
│   │   ├── 20251216000000_init_schema.sql
│   │   ├── 20251216000001_zones_tables.sql
│   │   └── 20251216180000_public_org_access.sql
│   ├── schema.sql            # Full schema: tables, RLS policies, helper functions
│   └── trigger.sql           # handle_new_user trigger (auto-provision on signup)
├── types/                    # Shared TypeScript interfaces
│   └── index.ts              # Table, Zone interfaces
├── .env.local                # Local environment variables (gitignored)
├── .gitignore
├── eslint.config.mjs         # ESLint config
├── middleware.ts             # Next.js middleware entry (session refresh + auth guard)
├── next.config.mjs           # Next.js config (image remote patterns)
├── package.json
├── postcss.config.mjs
├── PRD.md                    # Product Requirements Document
├── tailwind.config.js
└── tsconfig.json             # TypeScript config (path alias: @/* → ./*)
```

## Directory Purposes

**`app/`:**
- Purpose: All Next.js routes. Each subdirectory is a URL segment.
- Contains: `page.tsx` (route UI), `layout.tsx` (shared shells), `globals.css`
- Key files: `app/layout.tsx` (root), `app/page.tsx` (landing), `app/[slug]/page.tsx` (public booking), `app/admin/layout.tsx` (admin shell)

**`app/[slug]/`:**
- Purpose: Public, unauthenticated booking page scoped to a restaurant by its unique slug
- Contains: Single `page.tsx`; slug available as `params.slug`
- Note: Currently a stub; will query Supabase for restaurant data by slug

**`app/admin/`:**
- Purpose: Protected admin panel for restaurant operators (requires authenticated session)
- Contains: `layout.tsx` (sidebar + header shell) and `page.tsx` (welcome screen)
- Note: Route guard is in `lib/supabase/middleware.ts`; all `/admin/**` routes redirect to `/login` without session

**`components/canvas/`:**
- Purpose: Drag-and-drop visual table editor
- Contains: `TableNode` (draggable table tile using `@dnd-kit/core`), `EditTableModal` (inline edit form)

**`components/layout/`:**
- Purpose: App chrome shared across authenticated pages
- Contains: `Sidebar` — fixed 80px left rail with icon navigation and tooltips

**`components/menu/`:**
- Purpose: Menu management UI
- Contains: `AddMenuItemModal` — form modal for creating menu items

**`components/ui/`:**
- Purpose: Low-level primitive components (shadcn/ui-compatible pattern)
- Contains: `Button`, `Input` — accept `variant`, `size` props; styled with Tailwind

**`hooks/`:**
- Purpose: Client-side React hooks for side effects and subscriptions
- Contains: `useRealtimeTables` — manages a Supabase Realtime subscription for the `tables` table

**`lib/supabase/`:**
- Purpose: Three client factories for the three execution contexts in Next.js
- Rule: Always import from the correct module for the execution context:
  - In Server Components or Server Actions → `lib/supabase/server.ts`
  - In Client Components or hooks → `lib/supabase/client.ts`
  - In `middleware.ts` only → `lib/supabase/middleware.ts`

**`lib/demo-data.ts`:**
- Purpose: Typed static fixture data used by dashboard pages not yet connected to Supabase
- Contains: `DEMO_DATA` constant; also exports interfaces `MenuItem`, `Reservation`, `Staff`, `Metric`

**`supabase/`:**
- Purpose: Database schema management
- `schema.sql`: Source of truth for full schema, RLS policies, and `get_user_restaurant_id()` helper
- `trigger.sql`: `handle_new_user` Postgres trigger that auto-provisions restaurant + user on auth signup
- `migrations/`: Versioned incremental SQL files applied via Supabase CLI

**`types/`:**
- Purpose: Shared TypeScript interfaces used across the app
- Contains: `Table` and `Zone` interfaces matching the Supabase schema structure

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Landing/marketing page (public)
- `app/layout.tsx`: Root HTML shell applied to all routes
- `app/[slug]/page.tsx`: Public booking page (per-restaurant)
- `app/login/page.tsx`: Authentication sign-in (Client Component)
- `app/register/page.tsx`: Authentication sign-up (Client Component)
- `app/admin/layout.tsx`: Authenticated admin shell
- `app/admin/page.tsx`: Admin dashboard home

**Configuration:**
- `tsconfig.json`: TypeScript config; path alias `@/*` maps to project root
- `tailwind.config.js`: Tailwind configuration
- `next.config.mjs`: Next.js image remote pattern allowlist
- `middleware.ts`: Session refresh and route auth guard
- `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Core Logic:**
- `lib/supabase/middleware.ts`: Session refresh + `/admin` guard logic
- `supabase/schema.sql`: Full database schema with RLS
- `supabase/trigger.sql`: Auto-provisioning trigger
- `hooks/use-realtime-tables.ts`: Real-time Supabase subscription

**Components:**
- `components/canvas/table-node.tsx`: Draggable table element
- `components/canvas/edit-table-modal.tsx`: Table edit form modal
- `components/layout/sidebar.tsx`: Admin navigation sidebar
- `components/menu/add-menu-item-modal.tsx`: Menu item creation form
- `components/ui/button.tsx`: Primitive Button component
- `components/ui/input.tsx`: Primitive Input component

**Testing:**
- Not present

## Naming Conventions

**Files:**
- Pages and layouts: lowercase `page.tsx`, `layout.tsx` — Next.js convention
- Components: kebab-case, e.g., `table-node.tsx`, `edit-table-modal.tsx`, `use-realtime-tables.ts`
- Utility/lib files: kebab-case, e.g., `demo-data.ts`, `utils.ts`

**Directories:**
- Feature grouping in kebab-case: `canvas/`, `layout/`, `menu/`, `ui/`
- Next.js dynamic segments: bracket notation `[slug]/`

**Exports:**
- React components: PascalCase named exports, e.g., `export function TableNode`, `export function Sidebar`
- Pages: default exports, e.g., `export default function LoginPage()`
- Hooks: camelCase named exports with `use` prefix, e.g., `export function useRealtimeTables`
- Types/interfaces: PascalCase, e.g., `Table`, `Zone`, `MenuItem`

**TypeScript:**
- Interface names: PascalCase
- Props interfaces: `ComponentNameProps` pattern, e.g., `TableNodeProps`, `EditTableModalProps`

## Where to Add New Code

**New Admin Dashboard Page:**
- Create: `app/admin/{feature}/page.tsx`
- If it needs a nested layout: `app/admin/{feature}/layout.tsx`
- Add navigation link to: `components/layout/sidebar.tsx` → `MENU_ITEMS` array

**New Public-Facing Page:**
- Create: `app/{route}/page.tsx`
- If it needs server data: use `lib/supabase/server.ts` in the Server Component

**New Feature Component:**
- Grouped by domain: `components/{domain}/{component-name}.tsx`
- Named export, PascalCase function name
- If it uses browser APIs or event handlers: add `'use client'` directive at the top

**New UI Primitive:**
- Location: `components/ui/{component-name}.tsx`
- Follow the `Button`/`Input` pattern (accept `variant`, `size` props; use `cn()` for class merging)

**New Custom Hook:**
- Location: `hooks/use-{feature}.ts`
- Must include `'use client'` directive
- Use `lib/supabase/client.ts` for Supabase access

**New Shared Type:**
- Location: `types/index.ts` — append to existing file

**New Utility Function:**
- Location: `lib/utils.ts` for generic helpers
- Domain-specific utilities can go in `lib/{domain}.ts`

**New Database Migration:**
- Location: `supabase/migrations/{timestamp}_{description}.sql`
- Timestamp format: `YYYYMMDDHHMMSS`
- Also update `supabase/schema.sql` to reflect the full current state

**New Server Action:**
- Co-locate with the page that uses it: `app/{route}/actions.ts`
- Add `'use server'` directive at the top
- Use `lib/supabase/server.ts` for Supabase access

## Special Directories

**`.planning/`:**
- Purpose: Architecture documents and planning artifacts
- Generated: No
- Committed: Yes (gitignore does not exclude it)

**`.next/`:**
- Purpose: Next.js build output and dev cache
- Generated: Yes
- Committed: No (in `.gitignore`)

**`node_modules/`:**
- Purpose: npm package dependencies
- Generated: Yes
- Committed: No

**`Demo-zipa/` and `gourmet-os/`:**
- Purpose: Legacy or reference directories (appear empty based on file listing)
- Generated: No
- Committed: Yes (currently tracked)

---

*Structure analysis: 2026-06-09*
