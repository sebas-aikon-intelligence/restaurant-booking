# Coding Conventions

**Analysis Date:** 2026-06-09

## Naming Patterns

**Files:**
- React page components: `page.tsx` (Next.js App Router convention)
- React layout components: `layout.tsx`
- React feature components: PascalCase filename matching the exported component, e.g. `edit-table-modal.tsx`, `table-node.tsx`, `sidebar.tsx`
- Hooks: `use-kebab-case.ts`, e.g. `use-realtime-tables.ts`
- Utility/lib files: `kebab-case.ts`, e.g. `demo-data.ts`, `utils.ts`
- UI primitives: `kebab-case.tsx` under `components/ui/`, e.g. `button.tsx`, `input.tsx`

**Functions:**
- React components: PascalCase named exports, e.g. `export function EditTableModal`, `export function Sidebar`
- Page components: PascalCase default exports, e.g. `export default function LoginPage`, `export default function AdminDashboardPage`
- Event handlers: `handle` prefix + noun, e.g. `handleLogin`, `handleRegister`, `handleChange`, `handleSubmit`
- Hooks: camelCase with `use` prefix, e.g. `useRealtimeTables`
- Utility functions: camelCase, e.g. `createClient`, `updateSession`, `cn`

**Variables and State:**
- State variables: camelCase descriptive nouns, e.g. `isLoading`, `isEditing`, `formData`, `error`
- Boolean state: `is` prefix for state flags, e.g. `isLoading`, `isActive`, `isEditing`
- Constants: SCREAMING_SNAKE_CASE for module-level constants, e.g. `MENU_ITEMS`, `DEMO_DATA`

**Types and Interfaces:**
- Interface names: PascalCase, e.g. `Table`, `Zone`, `MenuItem`, `Reservation`, `Staff`
- Props interfaces: ComponentName + `Props`, e.g. `EditTableModalProps`, `TableNodeProps`, `ButtonProps`, `InputProps`
- Database field names follow snake_case matching Supabase column names, e.g. `org_id`, `is_active`, `customer_name`, `created_at`

## Code Style

**Formatting:**
- 4-space indentation in most files (component files, hooks, lib)
- 2-space indentation in `app/layout.tsx` and some app-level files (mixed)
- Single quotes for string literals in imports and values
- Semicolons used at end of statements

**TypeScript:**
- `strict: true` enabled in `tsconfig.json`
- Non-null assertions (`!`) used for environment variables, e.g. `process.env.NEXT_PUBLIC_SUPABASE_URL!`
- `as any` used sparingly and only with a comment explaining the reason
- Interface extension via `extends`, e.g. `interface TableNodeProps extends Table`
- `Omit<T, K>` used for derived types, e.g. `Omit<MenuItem, 'id'>`

**Linting:**
- ESLint with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Config: `eslint.config.mjs`
- No Prettier config detected — formatting is not auto-enforced

## Import Organization

**Order (observed pattern):**
1. React and Next.js framework imports (`react`, `next/navigation`, `next/link`)
2. Third-party library imports (`@dnd-kit/core`, `lucide-react`)
3. Internal lib/utils imports using `@/` alias (`@/lib/supabase/client`, `@/lib/utils`)
4. Internal type imports (`@/types`)
5. Internal component imports (`@/components/ui/button`)

**Path Aliases:**
- `@/*` maps to the project root (configured in `tsconfig.json`)
- All internal imports use `@/` prefix, never relative paths like `../../`

## Directive Usage

**Client Components:**
- `'use client'` at top of file (before imports) for interactive components
- Applied to: form pages (`login/page.tsx`, `register/page.tsx`), stateful components (`edit-table-modal.tsx`, `table-node.tsx`, `sidebar.tsx`), hooks (`use-realtime-tables.ts`)
- Server components (no directive): layout files, simple page stubs (`admin/page.tsx`, `[slug]/page.tsx`)

## Error Handling

**Client-side forms:**
- Local `error` state typed as `string | null`
- Errors set from `supabase.auth` response: `setError(error.message)`
- Errors displayed inline in the form with a red-tinted div:
  ```tsx
  {error && (
    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
      {error}
    </div>
  )}
  ```
- Loading state tracked with `isLoading: boolean`, button disabled while loading

**Server-side / Supabase server client:**
- Cookie `setAll` errors silently caught with empty `catch {}` block and a comment explaining the expected behavior
- No centralized error boundary detected

**Async operations:**
- Always use `async/await`
- Destructure `{ error }` directly from Supabase calls
- Check `if (error)` before proceeding to success path

## Logging

**Framework:** `console.log` only (no logging library)

**Patterns:**
- Debug logs are commented out rather than removed, e.g. `// console.log('Realtime Event:', payload)` in `hooks/use-realtime-tables.ts`
- No structured logging or log levels in use

## Comments

**When to Comment:**
- Inline comments explain non-obvious logic, e.g. `// Auto-generate slug`, `// Update local state "optimistically" from remote`
- Spanish-language comments used for business logic notes, e.g. `// refrescar el token de sesión si existe`, `// protección de rutas (ejemplo de redirección simple)`
- TODO-style comments written in Spanish prose rather than `// TODO:` tags
- Inline `// Casting as any to avoid strict shape type issues for now` when using type escape hatches

**JSDoc/TSDoc:**
- Not in use anywhere in the codebase

## Component Design

**Structure:**
- Props interface defined just above the component function
- State declarations at the top of the component body
- Event handlers defined as named `const` or `function` declarations before the return
- Single default export per page file; named exports for shared components

**UI Components (`components/ui/`):**
- Built with `React.forwardRef` for composability
- Accept a `className` prop and merge it last using string template literals
- Use `displayName` for debugging: `Button.displayName = "Button"`
- Do not use the `cn()` utility internally (raw template strings used instead)

**Feature Components:**
- Use the `cn()` utility from `@/lib/utils` for conditional class merging
- Modal components accept `onClose` and `onSave/onSubmit` callback props
- Modals implement click-outside-to-close via `onClick={onClose}` on the backdrop + `e.stopPropagation()` on the inner panel

## Module Design

**Exports:**
- Pages: single `export default`
- UI primitives and shared components: named exports, e.g. `export { Button }`, `export function Sidebar`
- Types: named `export interface` from `types/index.ts`
- Demo data: named `export const DEMO_DATA` and `export interface` co-located in `lib/demo-data.ts`

**Barrel Files:**
- `types/index.ts` acts as a barrel for shared interfaces
- No barrel `index.ts` files in `components/` — import paths go directly to the file

---

*Convention analysis: 2026-06-09*
