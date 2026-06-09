# Technology Stack

**Analysis Date:** 2026-06-09

## Languages

**Primary:**
- TypeScript 5.5.4 - All application code (`app/`, `components/`, `lib/`, `hooks/`, `types/`)

**Secondary:**
- SQL (PostgreSQL) - Database schema and triggers (`supabase/schema.sql`, `supabase/trigger.sql`)
- CSS - Global styles via Tailwind (`app/globals.css`)

## Runtime

**Environment:**
- Node.js 24.13.0 (local dev)

**Package Manager:**
- npm 11.6.2
- Lockfile: `package-lock.json` present (lockfileVersion 3)

## Frameworks

**Core:**
- Next.js 14.2.18 - Full-stack React framework, App Router, Server Components, Server Actions
- React 18.3.1 - UI rendering

**Build/Dev:**
- TypeScript compiler via Next.js (`tsconfig.json`, `noEmit: true`)
- PostCSS 8.4.41 - CSS processing (`postcss.config.mjs`)
- Autoprefixer 10.4.20 - CSS vendor prefixes

**Testing:**
- Not configured

## Key Dependencies

**Critical:**
- `@supabase/ssr` 0.5.0 - Supabase client for SSR/Next.js (server + browser clients)
- `@supabase/supabase-js` 2.45.0 - Core Supabase JS client

**UI & Styling:**
- `tailwindcss` 3.4.10 - Utility-first CSS (`tailwind.config.js`)
- `lucide-react` 0.435.0 - Icon library
- `clsx` 2.1.1 - Conditional class names
- `tailwind-merge` 2.5.2 - Tailwind class conflict resolution

**Drag & Drop:**
- `@dnd-kit/core` 6.1.0 - Core drag-and-drop primitives (used in canvas/table layout)
- `@dnd-kit/sortable` 10.0.0 - Sortable lists
- `@dnd-kit/modifiers` 9.0.0 - Drag constraints
- `@dnd-kit/utilities` 3.2.2 - DnD utilities

**Data & Utilities:**
- `date-fns` 3.6.0 - Date manipulation
- `recharts` 2.12.7 - Chart/graph components (dashboard analytics)

## Configuration

**Environment:**
- Configured via `.env.local` (not committed, listed in `.gitignore`)
- Two required env vars:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key

**TypeScript:**
- Strict mode enabled (`tsconfig.json`)
- Path alias `@/*` maps to project root
- Target: ES2017, module resolution: bundler

**Build:**
- `next.config.mjs` - Minimal config, only configures remote image patterns (Unsplash)
- `tailwind.config.js` - Custom CSS variables for theming (background, foreground, primary, surface, border)

**Linting:**
- `eslint.config.mjs` - Uses `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`

## Platform Requirements

**Development:**
- Node.js (v24 used locally)
- npm
- Supabase project with URL and anon key in `.env.local`

**Production:**
- Designed for Vercel deployment (Next.js App Router, uses `next/font/google` for Inter font)
- Supabase hosted project at `https://gkiqmbvzhbauwvacszsj.supabase.co`

---

*Stack analysis: 2026-06-09*
