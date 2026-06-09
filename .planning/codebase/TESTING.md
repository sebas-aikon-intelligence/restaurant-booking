# Testing Patterns

**Analysis Date:** 2026-06-09

## Test Framework

**Runner:**
- Not configured. No test runner (Jest, Vitest, Playwright, Cypress) is installed.
- No `jest.config.*`, `vitest.config.*`, or `playwright.config.*` files exist.
- No test-related scripts in `package.json` (`scripts` only contains `dev`, `build`, `start`, `lint`).

**Assertion Library:**
- None installed.

**Run Commands:**
```bash
# No test commands are currently configured.
# To run lint (only quality check available):
npm run lint
```

## Test File Organization

**Location:**
- No test files exist in the codebase. No `*.test.*` or `*.spec.*` files found anywhere outside `node_modules`.

**Naming:**
- No convention established.

**Structure:**
- No test directory exists (`__tests__/`, `tests/`, `test/` — none present).

## Test Structure

**Suite Organization:**
- Not applicable. No tests written yet.

## Mocking

**Framework:** None installed.

**What to Mock (recommended when tests are added):**
- `@/lib/supabase/client` — used in all client components for auth and data; mock `createClient()` to return a spy
- `@/lib/supabase/server` — used in server actions and server components; mock `createClient()` separately
- `next/navigation` — `useRouter`, `usePathname` are called in `components/layout/sidebar.tsx` and auth pages
- `next/headers` — `cookies()` is called in `lib/supabase/server.ts`

**What NOT to Mock:**
- `@/lib/utils` (`cn` function) — pure function, test directly
- `@/types` — pure type definitions, no runtime behavior

## Fixtures and Factories

**Test Data:**
- `lib/demo-data.ts` exports `DEMO_DATA` with realistic seed objects for `tables`, `menu`, `reservations`, `staff`, and `metrics`. This can serve as a fixture source for unit tests.
  ```typescript
  import { DEMO_DATA } from '@/lib/demo-data'
  // Use DEMO_DATA.tables, DEMO_DATA.reservations, etc. as test fixtures
  ```

**Location:**
- `lib/demo-data.ts` — currently used for UI display, repurposable as test fixtures
- No dedicated `fixtures/` or `factories/` directory exists

## Coverage

**Requirements:** None enforced. No coverage configuration present.

**View Coverage:**
```bash
# Not configured. After adding a test runner, use:
# npx vitest run --coverage   (for Vitest)
# npx jest --coverage         (for Jest)
```

## Test Types

**Unit Tests:**
- Not present. Candidates for unit testing:
  - `lib/utils.ts` — `cn()` function is a pure utility
  - `lib/demo-data.ts` — type shape validation
  - Slug generation logic in `app/register/page.tsx` (inline regex)

**Integration Tests:**
- Not present. Candidates:
  - Auth flows: `app/login/page.tsx`, `app/register/page.tsx`
  - Realtime subscription logic: `hooks/use-realtime-tables.ts`
  - Middleware route protection: `lib/supabase/middleware.ts`

**E2E Tests:**
- Not configured. No Playwright or Cypress detected.

## Recommended Setup (when tests are added)

**Suggested framework:** Vitest (compatible with Next.js 14 / Vite-adjacent tooling)

**Suggested install:**
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event
```

**Suggested config (`vitest.config.ts`):**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

**Suggested test file location:** Co-located with source files using `.test.tsx` suffix, e.g.:
- `lib/utils.test.ts`
- `components/ui/button.test.tsx`
- `hooks/use-realtime-tables.test.ts`

## Common Patterns (recommended when tests are added)

**Component Testing:**
```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

it('renders primary button', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
})
```

**Async/Supabase Testing:**
```typescript
import { vi } from 'vitest'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}))
```

**Error State Testing:**
```typescript
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({
        error: { message: 'Invalid credentials' },
      }),
    },
  }),
}))

// Then assert error appears in the rendered form
expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
```

---

*Testing analysis: 2026-06-09*
