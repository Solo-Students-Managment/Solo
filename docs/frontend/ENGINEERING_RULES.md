# Frontend Engineering Rules

Authoritative rules for every Solo frontend task. Prefer this document over older Vite-era docs under `docs/frontend/en|fa`.

## Repository boundaries

- Canonical product frontend: `/frontend`
- Future backend placeholder: `/backend` (no real backend in Phase 0)
- Legacy Vite prototype: `/legacy` (reference only — never import)
- Do **not** introduce Turborepo, Nx, or a package-based monorepo at this stage
- Work only in `/frontend` unless a task explicitly updates root documentation or `/backend`

## Stack

- Next.js App Router
- TypeScript **strict** (`noUncheckedIndexedAccess`)
- pnpm
- Tailwind CSS + CSS variables + semantic tokens
- Radix/shadcn as source base; Solo owns components and visual identity
- TanStack Query for server state
- Zustand **only** for true global UI/client state
- React Hook Form + Zod for forms
- MSW for development network simulation
- Vitest + React Testing Library + Playwright

## Architecture

- Feature-first: `app/` is routing/layout/composition only
- Features own components, hooks, queries, mutations, schemas, types, contracts, mocks, and utils
- Public feature API via `index.ts`; enforce import boundaries (no deep `@/features/x/...` imports)
- Shared UI is genuinely generic under `components/{ui,shared,layouts}`
- Infrastructure lives in `lib/`
- No circular dependencies; no internal cross-feature imports

## Product and UX constraints

- Scope is frozen — do not invent product behavior
- All meaningful UI text through `fa`/`en` i18n
- True RTL/LTR, Light/Dark, Desktop/Tablet/Mobile, WCAG 2.2 AA
- Effective Capabilities for access and disabled reasons — **never** scatter role/plan checks in random components
- Strict persona/context/organization isolation in query keys, caches, routes, realtime, offline, and persistence
- **Never hardcode final production prices** in feature components
- **Never import seed/mock data directly into feature UI** — go through MSW/API contracts

## Security

- Never persist password, OTP, access token, refresh token, or private API secrets in `localStorage`
- Frontend permission gates are UX only; backend remains future authz source of truth
- Never leak PII/private content into URLs, telemetry, or logs

## Mocks and contracts

- MSW simulates typed future contracts
- Feature UI must not implement server business logic
- Frontend must remain replaceable by a real backend later

## Shared primitives

Reuse when available: SoloDataTable, SoloForm, SoloFeedback, SoloCalendar, SoloCharts, SoloUploader, SoloContentEditor, SoloPrint, SoloMap, realtime/PWA clients.

## Quality gates / Definition of Done

- TypeScript strict typecheck, lint, format:check, and production build must pass
- Focused unit/component tests for changed logic
- Playwright smoke/E2E for critical workflows when a user journey is introduced
- Report changed files, commands run, acceptance status, assumptions, and real blockers

## Phases

0 Foundation → 1 Core Solo → 2 Academic Advanced → 3 Organization Operations → 4 Plans & Platform → 5 Marketplace & Commerce → 6 Advanced Platform & Hardening
