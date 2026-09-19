# Evidence Index

Audit snapshot: 2026-09-19, branch `main`, commit `cd7d7c3`. Status applies to prior audit claims after checking the current source.

| ID | Claim | Classification | Evidence | Consequence |
| --- | --- | --- | --- | --- |
| E-001 | The product has five personas | CONFIRMED | `frontend/src/services/auth/client.ts:33-50` | Student, guardian, teacher, organization, and `admin_solo` are authentication personas. |
| E-002 | Organizations have six built-in roles plus custom roles | CONFIRMED | `frontend/src/services/auth/client.ts:41-50`; `frontend/src/services/roles/client.ts:91-109` | Org role is separate from persona; seller must not be added as a persona. |
| E-003 | Seller is a capability/surface, not an auth persona | CONFIRMED | `frontend/src/services/auth/client.ts:33-50`; `frontend/src/app/personal/seller/**/page.tsx` | Seller authorization needs an explicit capability/ownership model. |
| E-004 | There are 137 App Router pages | CONFIRMED | `frontend/src/app/**/page.tsx` (137 files) | Route existence is inventory only, not completeness. |
| E-005 | Five Next.js API routes exist | INCORRECT | `frontend/src/app/**/route.ts` (0 files); `backend/README.md:3-9` | HTTP URL strings are contracts/MSW handlers, not deployed APIs. |
| E-006 | The backend is a placeholder | CONFIRMED | `backend/README.md:3-22` | No server auth, DB, payment, storage, or WebSocket implementation exists. |
| E-007 | There is no database schema or migration | CONFIRMED | No `schema.prisma`, migration directory, or SQL file; `backend/README.md:3-9` | All durable workflows and constraints are missing. |
| E-008 | The database design document matches identity | INCORRECT | `docs/new/database-design.md:5-11`; `frontend/src/services/auth/client.ts:33-50` | The sketch uses one `User.role` and `parent`, while code uses multi-persona, `guardian`, and org roles. |
| E-009 | Services use mocks | PARTIALLY_CONFIRMED | `frontend/src/app/providers.tsx:369-507`; module-level `createMock*Client` defaults | Local mode routes HTTP through MSW; production currently skips swapping and retains in-memory defaults. |
| E-010 | Production cannot enable MSW | CONFIRMED | `frontend/src/config/env.ts:82-87` | Combined with E-009, production silently retaining mocks is a P0 bootstrap fault. |
| E-011 | Mock business state is only ephemeral memory | PARTIALLY_CONFIRMED | `frontend/src/mocks/handlers.ts:895-975` and hydration immediately after | Many MSW maps persist in `sessionStorage`; none are authoritative or restart-safe. |
| E-012 | Persona switching is securely constrained | INCORRECT | `frontend/src/services/auth/client.ts:629-633` | Mock accepts any valid persona enum without a server grant check. |
| E-013 | Login is production authentication | INCORRECT | `frontend/src/services/auth/client.ts:388-416` | Hardcoded mock credentials and default teacher persona are used. |
| E-014 | One permission vocabulary governs the app | INCORRECT | `frontend/src/lib/capabilities/engine.ts:18-105`; `frontend/src/services/roles/client.ts:57-67` | Role templates emit keys the effective engine cannot evaluate. |
| E-015 | Admin routes require admin authority | INCORRECT | `frontend/src/features/admin-dashboard/components/AdminDashboardView.tsx:22-48`; `frontend/src/features/admin-users/components/AdminUsersView.tsx:34-50` | `students.manage` is held by non-admin personas and is only checked in the browser. |
| E-016 | Marketplace moderation is admin-only | INCORRECT | `frontend/src/features/marketplace-moderation/components/MarketplaceModerationView.tsx:26-55` | Any session passes the UI check; approve/reject has no server enforcement. |
| E-017 | Organization navigation is role-aware | INCORRECT | `frontend/src/features/organization/components/OrgShell.tsx:81-444` | One large list renders without permission filtering; Settings is not a link. |
| E-018 | Personal shell exposes working utilities | INCORRECT | `frontend/src/components/layouts/AppShell.tsx:18-29`; search/bell controls around `72-83` | Nav is hardcoded, mobile search/login and alerts/not-found are wrong, and utilities have no action. |
| E-019 | Admin has a responsive shell | PARTIALLY_CONFIRMED | `frontend/src/features/admin/components/AdminShell.tsx:30-118` | Desktop navigation exists; mobile equivalent and moderation link do not. |
| E-020 | Declared state routes all render | INCORRECT | `frontend/src/lib/routes.ts:212-217`; only `frontend/src/app/state/not-found/page.tsx` exists | Forbidden, deleted, and archived routes are dead declarations. |
| E-021 | Academic permissions are granular | INCORRECT | assignments `OrganizationAssignmentsView.tsx:328-335`; exams `OrganizationExamsView.tsx:211-218`; gradebook `OrganizationGradebookView.tsx:81-88`; attendance `OrganizationAttendanceView.tsx:92-99` | Unrelated actions reuse `students.manage`; `exams.publish` is unused. |
| E-022 | Role dashboards support daily work | PARTIALLY_CONFIRMED | teacher `TeacherDashboardView.tsx:19-109`; student `StudentDashboardView.tsx:19-129`; guardian `GuardianDashboardView.tsx:19-123` | They show mock counts/relationships but lack operational routes and real data. |
| E-023 | Organization dashboard enforces tenant access | INCORRECT | `frontend/src/features/organization-dashboard/components/OrganizationDashboardView.tsx:14-24` | It fetches by URL `orgId` without a session/capability/membership check. |
| E-024 | Route-level resilience exists | INCORRECT | one root `layout.tsx`; zero `loading.tsx` and `error.tsx`; zero middleware | Loading, error, auth, and focus behavior is repeated or absent. |
| E-025 | Unit checks pass | CONFIRMED | `pnpm test`: 175 files, 287 tests passed; `pnpm typecheck`: passed | Tests validate mock slices, not production integrations. |
| E-026 | Lint is clean | PARTIALLY_CONFIRMED | `pnpm lint`: 0 errors, 4 `react-hooks/exhaustive-deps` warnings | Build lint phase reports the same warnings. |
| E-027 | Production build is verified | CONFIRMED | Isolated `pnpm frontend:build` passed; the concurrent run's `/_document` failure was interference from Playwright/`.next` activity | Build has 4 hook warnings and reveals route-budget overruns, but produces all 137 routes. |
| E-028 | E2E suite is green | INCORRECT | `pnpm --dir frontend test:e2e`: 61 passed, 68 failed in 32.7m | Failures mix assertions with widespread timeout/`ERR_ABORTED`/detached-frame symptoms; reproduce individually before fixing. |

## Evidence discipline

- `CONFIRMED` means static source or a completed verification command proves the claim.
- `PARTIALLY_CONFIRMED` means the broad claim is true but important detail differs.
- `INCORRECT` means the prior audit assertion conflicts with current source.
- `NEEDS_RUNTIME_VERIFICATION` is not converted into a product fix until reproduced in isolation.
