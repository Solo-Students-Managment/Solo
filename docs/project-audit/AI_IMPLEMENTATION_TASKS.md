# AI Implementation Tasks

## Audit Metadata

- Audit date: 2026-09-19
- Commit / branch: `cd7d7c3` / `main`
- Applications inspected: root orchestration, active Next.js app in `/frontend`, placeholder `/backend`, frozen `/legacy`, documentation and tests
- Verification commands run: `pnpm frontend:typecheck`, `pnpm frontend:test`, `pnpm frontend:lint`, `pnpm --dir frontend knip`, `pnpm frontend:build`, `pnpm --dir frontend test:e2e`
- Important limitations: no server/database exists; static API strings are contracts/MSW handlers, not deployed endpoints. The first build run overlapped the Playwright dev server and was rerun in isolation. E2E completed 61 passed / 68 failed; detailed triage remains TASK-023.

## Status Legend

- `[ ]` Not started
- `[-]` In progress
- `[x]` Verified complete
- `[!]` Blocked

## Priority Definition

### P0 — Critical

Security, authorization, tenant/data isolation, broken core workflows, destructive data risks.

### P1 — Core Product

Missing functionality required for primary role workflows.

### P2 — Completeness

Missing supporting features, incomplete dashboards, navigation gaps, incomplete states.

### P3 — Polish / Technical Debt

UX consistency, accessibility improvement, cleanup and low-risk debt.

## Execution Rules

Tasks must be executed in dependency order. An implementing agent must read the task and evidence, inspect current code, preserve sound architecture, avoid unrelated refactors, implement all required layers, add tests, run relevant verification, update documentation, and change a task to `[x]` only when every acceptance criterion passes. Runtime-unverified findings must be reproduced before repair.

## Dependency Summary

`TASK-001 → TASK-002 → TASK-003 → TASK-004 → TASK-005 → domain tasks → navigation/panels → resilience/verification/polish`.

## TASK-001 — Make production data-client bootstrap fail closed

**Priority:** P0

**Status:** [ ]

**Role(s):** All

**Section:** Runtime configuration / API bootstrap

**Depends on:** None

**Blocks:** TASK-003 through TASK-024

### Problem

Production disables MSW but does not replace module-level mock clients, so production can silently render and mutate in-memory demo data.

### Current Behavior

`MswBootstrap` installs HTTP clients only inside the successful MSW branch. When mocks are disabled it returns ready immediately; the pre-registered mock clients remain active. MSW boot failures also silently fall back to mocks.

### Expected Behavior

Production always installs HTTP clients before rendering, never imports/uses MSW, and fails visibly when API configuration is missing or unreachable. Mock fallback is explicit and limited to approved non-production environments.

### Evidence

- frontend/src/app/providers.tsx:369-507 (`MswBootstrap`)
- frontend/src/config/env.ts:82-87 (`canEnableMocks`)
- frontend/src/services/api/client.ts:53-65 (`apiRequest`)
- backend/README.md:3-9

### Scope

#### Frontend

- Separate client registration from MSW startup; install HTTP clients in every non-mock environment.
- Render a typed configuration/bootstrap error rather than demo data when production setup fails.
- Add a visible non-production demo indicator when mocks are enabled.

#### Backend

- No production endpoint implementation in this task; define the health/config response only if required by the bootstrap contract.

#### Database

- No DB change expected.

#### Permissions

- Bootstrap must not synthesize a user/session or downgrade authorization on error.

#### Navigation

- Do not render authenticated navigation until bootstrap/session resolution succeeds.

#### Tests

- Unit-test production, local MSW success, and MSW failure branches.
- Assert production bundles do not activate the mock worker or retain mock clients.

### Files Likely Affected

- frontend/src/app/providers.tsx
- frontend/src/config/env.ts
- frontend/src/services/api/client.ts
- frontend/src/app/providers.test.tsx

### Acceptance Criteria

- [ ] Production environment installs HTTP clients before children render.
- [ ] Production cannot fall back to any `createMock*Client`.
- [ ] Mock mode is explicit, non-production, and visibly labeled.
- [ ] Bootstrap errors have an accessible retry/support state.
- [ ] Relevant unit tests, lint, typecheck, and build pass.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
```

### AI Implementation Prompt

```text
Implement TASK-001 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
Production always installs HTTP clients before rendering, never imports/uses MSW, and fails visibly when API configuration is missing or unreachable. Mock fallback is explicit and limited to approved non-production environments.

Current problem:
Production disables MSW but does not replace module-level mock clients, so production can silently render and mutate in-memory demo data. `MswBootstrap` installs HTTP clients only inside the successful MSW branch. When mocks are disabled it returns ready immediately; the pre-registered mock clients remain active. MSW boot failures also silently fall back to mocks.

Relevant roles:
- All

Relevant files:
- frontend/src/app/providers.tsx
- frontend/src/config/env.ts
- frontend/src/services/api/client.ts
- frontend/src/app/providers.test.tsx

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Bootstrap must not synthesize a user/session or downgrade authorization on error.

Frontend requirements:
- Separate client registration from MSW startup; install HTTP clients in every non-mock environment.
- Render a typed configuration/bootstrap error rather than demo data when production setup fails.
- Add a visible non-production demo indicator when mocks are enabled.

Backend requirements:
- No production endpoint implementation in this task; define the health/config response only if required by the bootstrap contract.

Database requirements:
- No DB change expected.

Testing:
- Unit-test production, local MSW success, and MSW failure branches.
- Assert production bundles do not activate the mock worker or retain mock clients.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Production environment installs HTTP clients before children render.
- Production cannot fall back to any `createMock*Client`.
- Mock mode is explicit, non-production, and visibly labeled.
- Bootstrap errors have an accessible retry/support state.
- Relevant unit tests, lint, typecheck, and build pass.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-001 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```

## TASK-002 — Create the backend and database foundation

**Priority:** P0

**Status:** [ ]

**Role(s):** All

**Section:** Backend / database

**Depends on:** TASK-001 contract decision

**Blocks:** TASK-003 through TASK-015

### Problem

The repository has no running backend, database schema, migrations, repositories, or integration-test harness.

### Current Behavior

`backend/README.md` is a placeholder. No Prisma/SQL schema or server route exists; frontend HTTP clients target contract paths only.

### Expected Behavior

An approved NestJS/PostgreSQL/Prisma foundation exposes health/versioned API plumbing, validated configuration, migrations, transactions, structured errors, request IDs, and an integration-test database without yet implementing unrelated feature modules.

### Evidence

- backend/README.md:1-22
- package.json:5-20
- docs/project-audit/DATA_MODEL_AUDIT.md

### Scope

#### Frontend

- Keep existing typed API error handling compatible with the backend envelope; do not migrate feature clients in this task.

#### Backend

- Scaffold the intended NestJS service, configuration validation, `/api` versioning, health/readiness, error envelope, request ID, logging, transaction helper, and test harness.
- Add root scripts for backend lint/typecheck/test/build after the package exists.

#### Database

- Add Prisma/PostgreSQL configuration, initial migration infrastructure, and migration/integration test setup; schema in this task should be limited to foundation/audit primitives agreed in DATA_MODEL_AUDIT.

#### Permissions

- Deny access by default; health/readiness exposure must be explicitly classified; no trust in browser actor/tenant headers.

#### Navigation

- No navigation change expected.

#### Tests

- Boot/config tests, migration up/down-from-empty test, health/readiness test, error-envelope contract test.

### Files Likely Affected

- backend/
- package.json
- pnpm-lock.yaml
- frontend/src/services/api/client.ts

### Acceptance Criteria

- [ ] Backend starts with validated environment and fails fast on invalid configuration.
- [ ] A clean test database migrates deterministically.
- [ ] Health/readiness and standardized error/request-ID behavior are tested.
- [ ] No feature endpoint returns mock data.
- [ ] Root quality scripts include the new backend and pass.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
```

### AI Implementation Prompt

```text
Implement TASK-002 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
An approved NestJS/PostgreSQL/Prisma foundation exposes health/versioned API plumbing, validated configuration, migrations, transactions, structured errors, request IDs, and an integration-test database without yet implementing unrelated feature modules.

Current problem:
The repository has no running backend, database schema, migrations, repositories, or integration-test harness. `backend/README.md` is a placeholder. No Prisma/SQL schema or server route exists; frontend HTTP clients target contract paths only.

Relevant roles:
- All

Relevant files:
- backend/
- package.json
- pnpm-lock.yaml
- frontend/src/services/api/client.ts

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Deny access by default; health/readiness exposure must be explicitly classified; no trust in browser actor/tenant headers.

Frontend requirements:
- Keep existing typed API error handling compatible with the backend envelope; do not migrate feature clients in this task.

Backend requirements:
- Scaffold the intended NestJS service, configuration validation, `/api` versioning, health/readiness, error envelope, request ID, logging, transaction helper, and test harness.
- Add root scripts for backend lint/typecheck/test/build after the package exists.

Database requirements:
- Add Prisma/PostgreSQL configuration, initial migration infrastructure, and migration/integration test setup; schema in this task should be limited to foundation/audit primitives agreed in DATA_MODEL_AUDIT.

Testing:
- Boot/config tests, migration up/down-from-empty test, health/readiness test, error-envelope contract test.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Backend starts with validated environment and fails fast on invalid configuration.
- A clean test database migrates deterministically.
- Health/readiness and standardized error/request-ID behavior are tested.
- No feature endpoint returns mock data.
- Root quality scripts include the new backend and pass.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-002 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```

## TASK-003 — Implement secure identity, session, persona, and context switching

**Priority:** P0

**Status:** [ ]

**Role(s):** All personas

**Section:** Auth / identity

**Depends on:** TASK-002

**Blocks:** TASK-004 through TASK-021

### Problem

Authentication and persona/context switching are mock-only and allow any valid persona enum without server grants.

### Current Behavior

Login uses hardcoded mock credentials; session state is in memory; `switchPersona` accepts an enum; no HttpOnly cookie, refresh rotation, revocation, or membership validation exists.

### Expected Behavior

One user may have granted personas and organization memberships. The server authenticates, issues secure rotatable sessions, validates every persona/context switch against grants, and audits security-sensitive changes.

### Evidence

- frontend/src/services/auth/client.ts:33-61
- frontend/src/services/auth/client.ts:388-416
- frontend/src/services/auth/client.ts:629-633
- backend/README.md:7-9

### Scope

#### Frontend

- Connect auth forms/session provider/context switcher to real endpoints.
- Show only server-returned grants and handle expired/revoked sessions and re-auth states.

#### Backend

- Implement challenge/login/logout/refresh/session/context-switch endpoints, secure cookie configuration, rotation/reuse detection, rate limits, and audit events.

#### Database

- Create User, PersonaGrant, DeviceSession, Organization/Membership references, security event/audit models with required uniqueness and revocation fields.

#### Permissions

- Switches require an active grant/membership; activation status is not inferred from a client enum; CSRF/session fixation protections apply.

#### Navigation

- Redirect unauthenticated users safely and rebuild navigation only from the verified active context.

#### Tests

- Auth integration tests; denied ungranted persona/tenant switch; refresh replay/revocation/fixation; cookie attribute assertions; frontend expiry/error tests.

### Files Likely Affected

- frontend/src/services/auth/client.ts
- frontend/src/app/providers.tsx
- frontend/src/features/auth/
- backend/src/modules/auth/
- backend/prisma/schema.prisma

### Acceptance Criteria

- [ ] Hardcoded production credentials/OTP paths are unreachable.
- [ ] Secure HttpOnly session rotation and logout/revocation are verified.
- [ ] Ungrantable persona or tenant context returns 403 without changing session.
- [ ] Context switch creates an audit event and updates verified session state.
- [ ] Auth unit/integration/E2E and current frontend checks pass.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
```

### AI Implementation Prompt

```text
Implement TASK-003 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
One user may have granted personas and organization memberships. The server authenticates, issues secure rotatable sessions, validates every persona/context switch against grants, and audits security-sensitive changes.

Current problem:
Authentication and persona/context switching are mock-only and allow any valid persona enum without server grants. Login uses hardcoded mock credentials; session state is in memory; `switchPersona` accepts an enum; no HttpOnly cookie, refresh rotation, revocation, or membership validation exists.

Relevant roles:
- All personas

Relevant files:
- frontend/src/services/auth/client.ts
- frontend/src/app/providers.tsx
- frontend/src/features/auth/
- backend/src/modules/auth/
- backend/prisma/schema.prisma

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Switches require an active grant/membership; activation status is not inferred from a client enum; CSRF/session fixation protections apply.

Frontend requirements:
- Connect auth forms/session provider/context switcher to real endpoints.
- Show only server-returned grants and handle expired/revoked sessions and re-auth states.

Backend requirements:
- Implement challenge/login/logout/refresh/session/context-switch endpoints, secure cookie configuration, rotation/reuse detection, rate limits, and audit events.

Database requirements:
- Create User, PersonaGrant, DeviceSession, Organization/Membership references, security event/audit models with required uniqueness and revocation fields.

Testing:
- Auth integration tests; denied ungranted persona/tenant switch; refresh replay/revocation/fixation; cookie attribute assertions; frontend expiry/error tests.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Hardcoded production credentials/OTP paths are unreachable.
- Secure HttpOnly session rotation and logout/revocation are verified.
- Ungrantable persona or tenant context returns 403 without changing session.
- Context switch creates an audit event and updates verified session state.
- Auth unit/integration/E2E and current frontend checks pass.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-003 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```

## TASK-004 — Unify the permission registry and policy evaluator

**Priority:** P0

**Status:** [ ]

**Role(s):** All; all organization roles; seller capability

**Section:** Authorization

**Depends on:** TASK-003

**Blocks:** TASK-005 through TASK-021

### Problem

The capability engine and role-template client use incompatible permission keys, producing incorrect routes, actions, and custom-role behavior.

### Current Behavior

The effective engine knows a small set such as `students.manage`; templates emit unrelated keys such as `courses.manage`, `exams.manage`, and `tasks.manage`. Unknown keys have no safe migration contract.

### Expected Behavior

One versioned registry defines every route/action permission, built-in role template, custom grant, UI label, and backend policy key. Unknown/retired keys deny and are migration-audited.

### Evidence

- frontend/src/lib/capabilities/engine.ts:18-105
- frontend/src/services/roles/client.ts:57-109
- docs/project-audit/ACTION_MATRIX.md

### Scope

#### Frontend

- Replace ad-hoc capability strings with generated/shared typed keys and expose policy decisions through hooks/components without embedding business scope in presentation code.

#### Backend

- Implement the same registry/policy evaluator server-side and a session capability projection; validate custom-role writes.

#### Database

- Persist registry version, roles, grants/denies, and migration history; preserve built-in role invariants.

#### Permissions

- Deny unknown keys; separate read/manage/publish/approve/admin/seller permissions; persona alone must not confer object scope.

#### Navigation

- Make future manifests consume the registry but leave shell replacement to TASK-016.

#### Tests

- Exhaustive role × permission table; unknown/retired key denial; frontend/server parity; custom-role validation/migration.

### Files Likely Affected

- frontend/src/lib/capabilities/engine.ts
- frontend/src/services/roles/client.ts
- backend/src/modules/authorization/
- backend/prisma/schema.prisma

### Acceptance Criteria

- [ ] Only one canonical permission-key source remains.
- [ ] Every existing gate maps to a documented canonical key or is removed.
- [ ] Unknown keys are rejected at API and evaluate false in UI.
- [ ] Built-in and custom-role matrix tests pass.
- [ ] Registry version/migration behavior is documented.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
```

### AI Implementation Prompt

```text
Implement TASK-004 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
One versioned registry defines every route/action permission, built-in role template, custom grant, UI label, and backend policy key. Unknown/retired keys deny and are migration-audited.

Current problem:
The capability engine and role-template client use incompatible permission keys, producing incorrect routes, actions, and custom-role behavior. The effective engine knows a small set such as `students.manage`; templates emit unrelated keys such as `courses.manage`, `exams.manage`, and `tasks.manage`. Unknown keys have no safe migration contract.

Relevant roles:
- All; all organization roles; seller capability

Relevant files:
- frontend/src/lib/capabilities/engine.ts
- frontend/src/services/roles/client.ts
- backend/src/modules/authorization/
- backend/prisma/schema.prisma

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Deny unknown keys; separate read/manage/publish/approve/admin/seller permissions; persona alone must not confer object scope.

Frontend requirements:
- Replace ad-hoc capability strings with generated/shared typed keys and expose policy decisions through hooks/components without embedding business scope in presentation code.

Backend requirements:
- Implement the same registry/policy evaluator server-side and a session capability projection; validate custom-role writes.

Database requirements:
- Persist registry version, roles, grants/denies, and migration history; preserve built-in role invariants.

Testing:
- Exhaustive role × permission table; unknown/retired key denial; frontend/server parity; custom-role validation/migration.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Only one canonical permission-key source remains.
- Every existing gate maps to a documented canonical key or is removed.
- Unknown keys are rejected at API and evaluate false in UI.
- Built-in and custom-role matrix tests pass.
- Registry version/migration behavior is documented.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-004 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```

## TASK-005 — Enforce tenant, self, child, assigned, and ownership scopes

**Priority:** P0

**Status:** [ ]

**Role(s):** All authenticated roles

**Section:** Authorization / repositories

**Depends on:** TASK-002, TASK-003, TASK-004

**Blocks:** TASK-006 through TASK-021

### Problem

Current data access is at best keyed by a browser-provided organization ID; no server repositories enforce tenant, self, linked-child, assigned-class, seller-owner, or admin scope.

### Current Behavior

The organization dashboard fetches `orgId` from the URL; mocks use shared maps; there is no backend query layer or membership predicate.

### Expected Behavior

Every query/command derives actor and active context from the server session and applies a reusable, testable object scope. Unauthorized object existence is not leaked.

### Evidence

- frontend/src/features/organization-dashboard/components/OrganizationDashboardView.tsx:14-24
- frontend/src/lib/capabilities/engine.ts:111-151
- backend/README.md:7-9

### Scope

#### Frontend

- Stop treating URL/query IDs as authority; distinguish forbidden/not-found without leaking sensitive object existence; pass only resource identifiers and expected versions.

#### Backend

- Add policy-aware repository/query helpers for tenant, self, linked guardian, teacher assignment, enrollment, seller ownership, and platform-admin scope.
- Require command authorization inside transactions, not only controllers.

#### Database

- Add tenant/membership/relationship/assignment/enrollment/ownership FKs, indexes, uniqueness, lifecycle fields, and safe cascade/soft-delete rules.

#### Permissions

- Negative scope is deny-by-default; object authorization applies to reads, mutations, exports, files, and realtime channels.

#### Navigation

- Direct URLs must produce the same decision as menu visibility.

#### Tests

- Cross-tenant, other-student, unrelated-child, unassigned-teacher, other-seller, IDOR and bulk/export negative integration tests.

### Files Likely Affected

- backend/src/common/authorization/
- backend/src/modules/*/repositories
- backend/prisma/schema.prisma
- frontend/src/features/organization-dashboard/

### Acceptance Criteria

- [ ] No protected repository method accepts actor/tenant authority solely from request payload.
- [ ] Negative scope tests return 403/404 with no sensitive data.
- [ ] Bulk, export, file, and realtime access share the same scope rules.
- [ ] Authorization is rechecked inside destructive/transition transactions.
- [ ] Scope tests cover every role family in ACTION_MATRIX.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
```

### AI Implementation Prompt

```text
Implement TASK-005 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
Every query/command derives actor and active context from the server session and applies a reusable, testable object scope. Unauthorized object existence is not leaked.

Current problem:
Current data access is at best keyed by a browser-provided organization ID; no server repositories enforce tenant, self, linked-child, assigned-class, seller-owner, or admin scope. The organization dashboard fetches `orgId` from the URL; mocks use shared maps; there is no backend query layer or membership predicate.

Relevant roles:
- All authenticated roles

Relevant files:
- backend/src/common/authorization/
- backend/src/modules/*/repositories
- backend/prisma/schema.prisma
- frontend/src/features/organization-dashboard/

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Negative scope is deny-by-default; object authorization applies to reads, mutations, exports, files, and realtime channels.

Frontend requirements:
- Stop treating URL/query IDs as authority; distinguish forbidden/not-found without leaking sensitive object existence; pass only resource identifiers and expected versions.

Backend requirements:
- Add policy-aware repository/query helpers for tenant, self, linked guardian, teacher assignment, enrollment, seller ownership, and platform-admin scope.
- Require command authorization inside transactions, not only controllers.

Database requirements:
- Add tenant/membership/relationship/assignment/enrollment/ownership FKs, indexes, uniqueness, lifecycle fields, and safe cascade/soft-delete rules.

Testing:
- Cross-tenant, other-student, unrelated-child, unassigned-teacher, other-seller, IDOR and bulk/export negative integration tests.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- No protected repository method accepts actor/tenant authority solely from request payload.
- Negative scope tests return 403/404 with no sensitive data.
- Bulk, export, file, and realtime access share the same scope rules.
- Authorization is rechecked inside destructive/transition transactions.
- Scope tests cover every role family in ACTION_MATRIX.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-005 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```

## TASK-006 — Secure the admin namespace and moderation actions

**Priority:** P0

**Status:** [ ]

**Role(s):** Admin Solo; prohibited for all others

**Section:** Admin platform

**Depends on:** TASK-003, TASK-004, TASK-005

**Blocks:** TASK-015, TASK-020

### Problem

Admin pages reuse `students.manage`, which teacher/organization personas can hold; moderation accepts any session and is absent from admin navigation.

### Current Behavior

Admin dashboard/users use client-only broad gates. Marketplace approve/reject only checks `Boolean(session)`. No command persists or emits an audit event.

### Expected Behavior

Every `/admin` page and API requires a specific verified `admin.*` grant. Mutations are validated, scoped, rate-limited where appropriate, and immutably audited.

### Evidence

- frontend/src/features/admin-dashboard/components/AdminDashboardView.tsx:22-48
- frontend/src/features/admin-users/components/AdminUsersView.tsx:34-50
- frontend/src/features/marketplace-moderation/components/MarketplaceModerationView.tsx:26-55
- frontend/src/features/admin/components/AdminShell.tsx:30-83

### Scope

#### Frontend

- Replace broad checks, add moderation to policy-derived admin navigation, handle 403/404/loading/error and optimistic-action rollback safely.

#### Backend

- Implement guarded admin controllers/services for the current admin screens and moderation; require reason/version for sensitive actions; emit audit events.

#### Database

- Add admin grants, moderation/action state, optimistic versioning, and immutable audit records needed by existing screens.

#### Permissions

- Only Admin Solo with the exact key may act; support/read grants must not imply mutate; no persona escalation through context switch.

#### Navigation

- Add responsive admin navigation and active state; unauthorized items never render.

#### Tests

- Non-admin direct URL/API matrix; per-action allow/deny; audit-event assertions; concurrent/repeated moderation command tests.

### Files Likely Affected

- frontend/src/features/admin/
- frontend/src/features/admin-dashboard/
- frontend/src/features/admin-users/
- frontend/src/features/marketplace-moderation/
- backend/src/modules/admin/

### Acceptance Criteria

- [ ] Every admin route and endpoint declares a canonical `admin.*` key.
- [ ] Teacher, organization, student, guardian, and seller requests are denied server-side.
- [ ] Moderation is reachable only for authorized admins.
- [ ] Every privileged mutation records actor, target, reason, result, and correlation ID.
- [ ] Admin permission and action tests pass.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
```

### AI Implementation Prompt

```text
Implement TASK-006 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
Every `/admin` page and API requires a specific verified `admin.*` grant. Mutations are validated, scoped, rate-limited where appropriate, and immutably audited.

Current problem:
Admin pages reuse `students.manage`, which teacher/organization personas can hold; moderation accepts any session and is absent from admin navigation. Admin dashboard/users use client-only broad gates. Marketplace approve/reject only checks `Boolean(session)`. No command persists or emits an audit event.

Relevant roles:
- Admin Solo; prohibited for all others

Relevant files:
- frontend/src/features/admin/
- frontend/src/features/admin-dashboard/
- frontend/src/features/admin-users/
- frontend/src/features/marketplace-moderation/
- backend/src/modules/admin/

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Only Admin Solo with the exact key may act; support/read grants must not imply mutate; no persona escalation through context switch.

Frontend requirements:
- Replace broad checks, add moderation to policy-derived admin navigation, handle 403/404/loading/error and optimistic-action rollback safely.

Backend requirements:
- Implement guarded admin controllers/services for the current admin screens and moderation; require reason/version for sensitive actions; emit audit events.

Database requirements:
- Add admin grants, moderation/action state, optimistic versioning, and immutable audit records needed by existing screens.

Testing:
- Non-admin direct URL/API matrix; per-action allow/deny; audit-event assertions; concurrent/repeated moderation command tests.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Every admin route and endpoint declares a canonical `admin.*` key.
- Teacher, organization, student, guardian, and seller requests are denied server-side.
- Moderation is reachable only for authorized admins.
- Every privileged mutation records actor, target, reason, result, and correlation ID.
- Admin permission and action tests pass.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-006 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```

## TASK-007 — Implement organization membership, invitations, roles, and settings lifecycle

**Priority:** P1

**Status:** [ ]

**Role(s):** Organization Owner, Manager, Support (limited)

**Section:** Organization membership / settings

**Depends on:** TASK-003, TASK-004, TASK-005

**Blocks:** TASK-008 through TASK-020

### Problem

Membership, invitations, role changes, custom roles, organization settings, ownership, and offboarding are mock-only; the Settings item is plain text.

### Current Behavior

Mock clients seed an owner and mutate invitations/members/roles in memory. Role keys do not match the effective engine. There is no settings route or last-owner protection.

### Expected Behavior

Invite → accept → membership → role/grant change → suspend/offboard is durable, audited, tenant-scoped, and preserves ownership invariants. Authorized settings are editable through a real route.

### Evidence

- frontend/src/services/roles/client.ts:57-109
- frontend/src/features/organization/components/OrgShell.tsx:381-444
- frontend/src/services/organization/members.ts

### Scope

#### Frontend

- Connect existing member/role views; add settings route; provide confirmation, conflict, expired invite, empty/loading/error, and accessible feedback states.

#### Backend

- Implement invitation, acceptance, membership status, role assignment/custom role, settings, ownership transfer and offboard commands with transactions.

#### Database

- Add Invitation, Membership, Role/Grant, OrganizationSettings and audit constraints; unique active membership/invite; last-owner invariant.

#### Permissions

- Owner-only versus delegated manager/support actions are explicit; a user cannot grant permissions they do not possess.

#### Navigation

- Settings becomes a real policy-gated link; people/settings groups reflect active grants.

#### Tests

- Lifecycle integration and E2E; expired/reused invite; last-owner removal denial; privilege-grant ceiling; cross-tenant negative cases.

### Files Likely Affected

- frontend/src/features/organization/
- frontend/src/services/organization/
- frontend/src/services/roles/
- frontend/src/app/org/[orgId]/settings/
- backend/src/modules/organizations/

### Acceptance Criteria

- [ ] Membership changes persist across restart and are audited.
- [ ] Last active owner cannot be removed without a valid transfer.
- [ ] Custom roles accept only registry keys and respect grant ceilings.
- [ ] Settings route exists and is hidden/denied consistently.
- [ ] Invite/member/role/settings tests pass.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
```

### AI Implementation Prompt

```text
Implement TASK-007 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
Invite → accept → membership → role/grant change → suspend/offboard is durable, audited, tenant-scoped, and preserves ownership invariants. Authorized settings are editable through a real route.

Current problem:
Membership, invitations, role changes, custom roles, organization settings, ownership, and offboarding are mock-only; the Settings item is plain text. Mock clients seed an owner and mutate invitations/members/roles in memory. Role keys do not match the effective engine. There is no settings route or last-owner protection.

Relevant roles:
- Organization Owner, Manager, Support (limited)

Relevant files:
- frontend/src/features/organization/
- frontend/src/services/organization/
- frontend/src/services/roles/
- frontend/src/app/org/[orgId]/settings/
- backend/src/modules/organizations/

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Owner-only versus delegated manager/support actions are explicit; a user cannot grant permissions they do not possess.

Frontend requirements:
- Connect existing member/role views; add settings route; provide confirmation, conflict, expired invite, empty/loading/error, and accessible feedback states.

Backend requirements:
- Implement invitation, acceptance, membership status, role assignment/custom role, settings, ownership transfer and offboard commands with transactions.

Database requirements:
- Add Invitation, Membership, Role/Grant, OrganizationSettings and audit constraints; unique active membership/invite; last-owner invariant.

Testing:
- Lifecycle integration and E2E; expired/reused invite; last-owner removal denial; privilege-grant ceiling; cross-tenant negative cases.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Membership changes persist across restart and are audited.
- Last active owner cannot be removed without a valid transfer.
- Custom roles accept only registry keys and respect grant ceilings.
- Settings route exists and is hidden/denied consistently.
- Invite/member/role/settings tests pass.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-007 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```

## TASK-008 — Implement student identity and guardian relationship lifecycle

**Priority:** P1

**Status:** [ ]

**Role(s):** Owner, Manager, Academic Manager, assigned Teacher, Student, Guardian

**Section:** Students / guardians

**Depends on:** TASK-005, TASK-007

**Blocks:** TASK-009 through TASK-019

### Problem

Staff can manipulate mock student records and link a guardian, but there is no durable identity activation, consent/status lifecycle, or linked-child projection.

### Current Behavior

Organization list/create/detail and guardian-link UI use mock clients. Guardian dashboard shows mock relationships; no server uniqueness or relationship authorization exists.

### Expected Behavior

Authorized staff creates/imports a student, links/invites guardian(s), activates accounts, manages relationship status, and exposes only self/linked/assigned projections.

### Evidence

- frontend/src/services/students/client.ts:87-195
- frontend/src/features/guardian/components/GuardianDashboardView.tsx:19-123
- docs/project-audit/sections/students-guardians.md

### Scope

#### Frontend

- Connect staff flows; add child-context routing and activation/error/conflict states; mask fields by role.

#### Backend

- Implement student profile, identity association, guardian invite/link/unlink/status and projections with transactional validation.

#### Database

- Create StudentProfile and GuardianRelationship with tenant keys, unique active pairs, consent/effective dates and audit trail.

#### Permissions

- Staff write scope, teacher assigned read, student self, guardian linked child, and sensitive-field masks are distinct.

#### Navigation

- Expose children/context switcher to guardians and assigned students to teachers only when authorized.

#### Tests

- Duplicate identity/link, unrelated guardian, unassigned teacher, activation, unlink/history and cross-tenant tests.

### Files Likely Affected

- frontend/src/services/students/
- frontend/src/services/guardian/
- frontend/src/features/students/
- frontend/src/features/guardian/
- backend/src/modules/students/
- backend/src/modules/guardians/

### Acceptance Criteria

- [ ] Student and guardian relationships persist and have explicit lifecycle states.
- [ ] Guardian sees only active linked children; student sees only self.
- [ ] Assigned teacher projection omits prohibited sensitive fields.
- [ ] Duplicate/cross-tenant relationships are rejected transactionally.
- [ ] Staff-to-student-to-guardian E2E passes.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
```

### AI Implementation Prompt

```text
Implement TASK-008 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
Authorized staff creates/imports a student, links/invites guardian(s), activates accounts, manages relationship status, and exposes only self/linked/assigned projections.

Current problem:
Staff can manipulate mock student records and link a guardian, but there is no durable identity activation, consent/status lifecycle, or linked-child projection. Organization list/create/detail and guardian-link UI use mock clients. Guardian dashboard shows mock relationships; no server uniqueness or relationship authorization exists.

Relevant roles:
- Owner, Manager, Academic Manager, assigned Teacher, Student, Guardian

Relevant files:
- frontend/src/services/students/
- frontend/src/services/guardian/
- frontend/src/features/students/
- frontend/src/features/guardian/
- backend/src/modules/students/
- backend/src/modules/guardians/

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Staff write scope, teacher assigned read, student self, guardian linked child, and sensitive-field masks are distinct.

Frontend requirements:
- Connect staff flows; add child-context routing and activation/error/conflict states; mask fields by role.

Backend requirements:
- Implement student profile, identity association, guardian invite/link/unlink/status and projections with transactional validation.

Database requirements:
- Create StudentProfile and GuardianRelationship with tenant keys, unique active pairs, consent/effective dates and audit trail.

Testing:
- Duplicate identity/link, unrelated guardian, unassigned teacher, activation, unlink/history and cross-tenant tests.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Student and guardian relationships persist and have explicit lifecycle states.
- Guardian sees only active linked children; student sees only self.
- Assigned teacher projection omits prohibited sensitive fields.
- Duplicate/cross-tenant relationships are rejected transactionally.
- Staff-to-student-to-guardian E2E passes.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-008 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```

## TASK-009 — Implement academic catalog, teacher assignment, and enrollment

**Priority:** P1

**Status:** [ ]

**Role(s):** Owner, Manager, Academic Manager, Org Teacher, Student, Guardian

**Section:** Subjects / courses / classes / enrollment

**Depends on:** TASK-005, TASK-007, TASK-008

**Blocks:** TASK-010 through TASK-012, TASK-017 through TASK-019

### Problem

Course/class/enrollment consoles are mock-only and lack authoritative teacher assignments, enrollment constraints, and consumer projections.

### Current Behavior

Typed clients and rich staff pages exist, but update/archive completeness varies and most gates use `students.manage`. No DB transaction validates transfer/state changes.

### Expected Behavior

Tenant-scoped subjects/courses/classes can be created and archived, teachers assigned with effective dates, and students enrolled/transferred through valid states; consumers receive scoped read models.

### Evidence

- frontend/src/services/courses/client.ts
- frontend/src/services/enrollments/client.ts
- docs/project-audit/sections/academic-catalog.md
- docs/project-audit/sections/enrollment.md

### Scope

#### Frontend

- Connect existing staff views and create teacher/student/guardian projections needed by panels; preserve filters and show conflict/empty/error states.

#### Backend

- Implement catalog, class, teacher-assignment, enrollment and transfer services with pagination/filtering and state machines.

#### Database

- Add Subject, Course, Class, Term, TeacherAssignment and Enrollment constraints/indexes; unique active enrollment and transactional transfer.

#### Permissions

- Academic author/manage/publish differ; teacher sees assigned; student enrolled self; guardian linked enrolled child.

#### Navigation

- Place catalog/enrollment items only in authorized academic menus and consumer class lists.

#### Tests

- CRUD/lifecycle, assignment dates, duplicate enrollment, transfer rollback, archive-with-dependencies, negative scope, projection tests.

### Files Likely Affected

- frontend/src/services/courses/
- frontend/src/services/enrollments/
- frontend/src/features/organization-courses/
- frontend/src/features/organization-enrollments/
- backend/src/modules/academics/

### Acceptance Criteria

- [ ] Catalog and enrollment data persist with validated lifecycle transitions.
- [ ] Teacher assignment drives access; browser IDs cannot expand scope.
- [ ] Transfer is atomic and duplicate active enrollment is impossible.
- [ ] Student/guardian projections expose only enrolled/linked data.
- [ ] Integration and cross-role E2E pass.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
```

### AI Implementation Prompt

```text
Implement TASK-009 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
Tenant-scoped subjects/courses/classes can be created and archived, teachers assigned with effective dates, and students enrolled/transferred through valid states; consumers receive scoped read models.

Current problem:
Course/class/enrollment consoles are mock-only and lack authoritative teacher assignments, enrollment constraints, and consumer projections. Typed clients and rich staff pages exist, but update/archive completeness varies and most gates use `students.manage`. No DB transaction validates transfer/state changes.

Relevant roles:
- Owner, Manager, Academic Manager, Org Teacher, Student, Guardian

Relevant files:
- frontend/src/services/courses/
- frontend/src/services/enrollments/
- frontend/src/features/organization-courses/
- frontend/src/features/organization-enrollments/
- backend/src/modules/academics/

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Academic author/manage/publish differ; teacher sees assigned; student enrolled self; guardian linked enrolled child.

Frontend requirements:
- Connect existing staff views and create teacher/student/guardian projections needed by panels; preserve filters and show conflict/empty/error states.

Backend requirements:
- Implement catalog, class, teacher-assignment, enrollment and transfer services with pagination/filtering and state machines.

Database requirements:
- Add Subject, Course, Class, Term, TeacherAssignment and Enrollment constraints/indexes; unique active enrollment and transactional transfer.

Testing:
- CRUD/lifecycle, assignment dates, duplicate enrollment, transfer rollback, archive-with-dependencies, negative scope, projection tests.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Catalog and enrollment data persist with validated lifecycle transitions.
- Teacher assignment drives access; browser IDs cannot expand scope.
- Transfer is atomic and duplicate active enrollment is impossible.
- Student/guardian projections expose only enrolled/linked data.
- Integration and cross-role E2E pass.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-009 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```

## TASK-010 — Implement sessions, scheduling, and roster-based attendance

**Priority:** P1

**Status:** [ ]

**Role(s):** Academic Manager, assigned Teacher, Student, Guardian

**Section:** Sessions / attendance

**Depends on:** TASK-008, TASK-009

**Blocks:** TASK-013, TASK-017 through TASK-019

### Problem

Sessions and attendance are staff-side mocks; attendance uses free-text names and lacks roster, edit/cancel, correction audit, concurrency, and consumer views.

### Current Behavior

Mock client supports list/create/detail/marking. UI gates on `students.manage`; no authoritative session roster or notification event exists.

### Expected Behavior

Authorized staff schedule/edit/cancel sessions, assigned teachers record attendance against the enrollment roster, corrections are versioned/audited, and enrolled/linked consumers see allowed status.

### Evidence

- frontend/src/services/sessions/client.ts:119-301
- frontend/src/features/organization-attendance/components/OrganizationAttendanceView.tsx:92-99
- docs/project-audit/sections/sessions-attendance.md

### Scope

#### Frontend

- Replace free-text identity with roster selection; add schedule/edit/cancel/detail, conflict, loading/empty/error, accessible status and consumer views.

#### Backend

- Implement session state/time validation, roster snapshot/query, batch attendance command, optimistic concurrency, correction audit and domain events.

#### Database

- Add Session and AttendanceRecord with unique session/student, version/correction author, cancellation fields and indexes.

#### Permissions

- Only assigned staff manage; enrolled self and linked guardian read; no arbitrary student IDs.

#### Navigation

- Add teacher/student/guardian session links through TASK-016 manifests.

#### Tests

- Time conflict, cancel/edit, roster membership, duplicate/batch idempotency, concurrent correction, negative scope and cross-role visibility.

### Files Likely Affected

- frontend/src/services/sessions/
- frontend/src/features/organization-sessions/
- frontend/src/features/organization-attendance/
- backend/src/modules/sessions/

### Acceptance Criteria

- [ ] Attendance can only target the authoritative session roster.
- [ ] Repeated batch submission does not duplicate records.
- [ ] Corrections preserve audit/version history.
- [ ] Student and guardian see only allowed attendance/session data.
- [ ] Session-attendance integration/E2E passes.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
```

### AI Implementation Prompt

```text
Implement TASK-010 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
Authorized staff schedule/edit/cancel sessions, assigned teachers record attendance against the enrollment roster, corrections are versioned/audited, and enrolled/linked consumers see allowed status.

Current problem:
Sessions and attendance are staff-side mocks; attendance uses free-text names and lacks roster, edit/cancel, correction audit, concurrency, and consumer views. Mock client supports list/create/detail/marking. UI gates on `students.manage`; no authoritative session roster or notification event exists.

Relevant roles:
- Academic Manager, assigned Teacher, Student, Guardian

Relevant files:
- frontend/src/services/sessions/
- frontend/src/features/organization-sessions/
- frontend/src/features/organization-attendance/
- backend/src/modules/sessions/

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Only assigned staff manage; enrolled self and linked guardian read; no arbitrary student IDs.

Frontend requirements:
- Replace free-text identity with roster selection; add schedule/edit/cancel/detail, conflict, loading/empty/error, accessible status and consumer views.

Backend requirements:
- Implement session state/time validation, roster snapshot/query, batch attendance command, optimistic concurrency, correction audit and domain events.

Database requirements:
- Add Session and AttendanceRecord with unique session/student, version/correction author, cancellation fields and indexes.

Testing:
- Time conflict, cancel/edit, roster membership, duplicate/batch idempotency, concurrent correction, negative scope and cross-role visibility.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Attendance can only target the authoritative session roster.
- Repeated batch submission does not duplicate records.
- Corrections preserve audit/version history.
- Student and guardian see only allowed attendance/session data.
- Session-attendance integration/E2E passes.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-010 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```

## TASK-011 — Implement assignment, submission, review, grade, and release workflow

**Priority:** P1

**Status:** [ ]

**Role(s):** Academic Manager, assigned Teacher, Student, Guardian

**Section:** Assignments / gradebook

**Depends on:** TASK-008, TASK-009

**Blocks:** TASK-013, TASK-017 through TASK-019

### Problem

Staff mock authoring and grade upsert are disconnected from student submission and guardian visibility; release and ownership rules are absent.

### Current Behavior

Assignment/submission/gradebook client methods mutate mock state. Organization pages use broad `students.manage`; student/guardian routes do not exist.

### Expected Behavior

Assigned staff author/publish assignments; enrolled students submit/resubmit according to policy; assigned staff review/version grades; release atomically controls student/guardian visibility and emits events.

### Evidence

- frontend/src/services/assignments/client.ts:128-341
- frontend/src/services/gradebook/client.ts:27-95
- frontend/src/features/organization-assignments/components/OrganizationAssignmentsView.tsx:328-335
- frontend/src/features/organization-gradebook/components/OrganizationGradebookView.tsx:81-88

### Scope

#### Frontend

- Connect staff pages; add teacher assigned workspace, student list/detail/submission, released results, guardian read/approval only where existing workflow requires it; include upload/state/error UX.

#### Backend

- Implement assignment lifecycle, submission ownership/versioning, review/grade, release transaction, idempotency and outbox events.

#### Database

- Add Assignment, audience, Submission/version, Grade/version/release and attachment metadata constraints.

#### Permissions

- Separate author/publish/grade/release; teacher assigned, student self/enrolled, guardian linked/released; draft data never leaks.

#### Navigation

- Add role-specific destinations and deep links.

#### Tests

- Draft visibility, due/late/resubmit policy, double submit, cross-student denial, concurrent grade, release visibility and three-role E2E.

### Files Likely Affected

- frontend/src/services/assignments/
- frontend/src/services/gradebook/
- frontend/src/features/organization-assignments/
- frontend/src/features/organization-gradebook/
- backend/src/modules/assignments/

### Acceptance Criteria

- [ ] A real publish→submit→review→grade→release flow persists end-to-end.
- [ ] Draft grades/submissions are never exposed outside allowed actors.
- [ ] Duplicate/concurrent commands are safe and version conflicts are usable.
- [ ] Notification-ready domain events are emitted transactionally.
- [ ] Teacher/student/guardian E2E passes.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
```

### AI Implementation Prompt

```text
Implement TASK-011 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
Assigned staff author/publish assignments; enrolled students submit/resubmit according to policy; assigned staff review/version grades; release atomically controls student/guardian visibility and emits events.

Current problem:
Staff mock authoring and grade upsert are disconnected from student submission and guardian visibility; release and ownership rules are absent. Assignment/submission/gradebook client methods mutate mock state. Organization pages use broad `students.manage`; student/guardian routes do not exist.

Relevant roles:
- Academic Manager, assigned Teacher, Student, Guardian

Relevant files:
- frontend/src/services/assignments/
- frontend/src/services/gradebook/
- frontend/src/features/organization-assignments/
- frontend/src/features/organization-gradebook/
- backend/src/modules/assignments/

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Separate author/publish/grade/release; teacher assigned, student self/enrolled, guardian linked/released; draft data never leaks.

Frontend requirements:
- Connect staff pages; add teacher assigned workspace, student list/detail/submission, released results, guardian read/approval only where existing workflow requires it; include upload/state/error UX.

Backend requirements:
- Implement assignment lifecycle, submission ownership/versioning, review/grade, release transaction, idempotency and outbox events.

Database requirements:
- Add Assignment, audience, Submission/version, Grade/version/release and attachment metadata constraints.

Testing:
- Draft visibility, due/late/resubmit policy, double submit, cross-student denial, concurrent grade, release visibility and three-role E2E.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- A real publish→submit→review→grade→release flow persists end-to-end.
- Draft grades/submissions are never exposed outside allowed actors.
- Duplicate/concurrent commands are safe and version conflicts are usable.
- Notification-ready domain events are emitted transactionally.
- Teacher/student/guardian E2E passes.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-011 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```

## TASK-012 — Implement exam publishing, attempts, grading, and result release

**Priority:** P1

**Status:** [ ]

**Role(s):** Academic Manager, assigned Teacher, Student, Guardian

**Section:** Exams / question bank / evaluations

**Depends on:** TASK-008, TASK-009

**Blocks:** TASK-013, TASK-017 through TASK-019

### Problem

Exam authoring/publish/grade exists only as a staff mock; `exams.publish` is defined but ignored, and no student attempt/result workflow exists.

### Current Behavior

Organization exam view checks `students.manage`. Mock client owns authoring/publish/grade state. There is no durable timed/resumable attempt or release projection.

### Expected Behavior

Authorized authors manage question snapshots; separate publishers release an exam; enrolled students securely start/save/submit attempts; assigned graders grade; released results reach only self/linked guardians.

### Evidence

- frontend/src/services/exams/client.ts:134-400
- frontend/src/features/organization-exams/components/OrganizationExamsView.tsx:211-218
- frontend/src/lib/capabilities/engine.ts:18-105

### Scope

#### Frontend

- Connect authoring; add teacher/student attempt/result views with timer/reconnect/submission confirmation and accessible question navigation.

#### Backend

- Implement exam lifecycle, immutable publish snapshot, attempt token/timing, autosave/idempotent final submit, grading/release and outbox events.

#### Database

- Add Exam, Question revision/snapshot, Attempt, Answer, Grade/release constraints; one active/final state rules.

#### Permissions

- Author, publish, grade are distinct; attempts require active enrollment/window; self/linked results require release.

#### Navigation

- Expose exams only to eligible authors/students/guardians with valid deep links.

#### Tests

- Publish separation, draft leak, timing/resume, duplicate final submit, other-student denial, grading/release and cross-role E2E.

### Files Likely Affected

- frontend/src/services/exams/
- frontend/src/features/organization-exams/
- frontend/src/features/question-bank/
- backend/src/modules/exams/

### Acceptance Criteria

- [ ] Published exam content is immutable for active attempts.
- [ ] Student attempt timing and final submission are server-authoritative/idempotent.
- [ ] Draft questions/results do not leak.
- [ ] Canonical `exams.publish` is enforced server and UI.
- [ ] Exam cross-role E2E passes.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
```

### AI Implementation Prompt

```text
Implement TASK-012 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
Authorized authors manage question snapshots; separate publishers release an exam; enrolled students securely start/save/submit attempts; assigned graders grade; released results reach only self/linked guardians.

Current problem:
Exam authoring/publish/grade exists only as a staff mock; `exams.publish` is defined but ignored, and no student attempt/result workflow exists. Organization exam view checks `students.manage`. Mock client owns authoring/publish/grade state. There is no durable timed/resumable attempt or release projection.

Relevant roles:
- Academic Manager, assigned Teacher, Student, Guardian

Relevant files:
- frontend/src/services/exams/
- frontend/src/features/organization-exams/
- frontend/src/features/question-bank/
- backend/src/modules/exams/

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Author, publish, grade are distinct; attempts require active enrollment/window; self/linked results require release.

Frontend requirements:
- Connect authoring; add teacher/student attempt/result views with timer/reconnect/submission confirmation and accessible question navigation.

Backend requirements:
- Implement exam lifecycle, immutable publish snapshot, attempt token/timing, autosave/idempotent final submit, grading/release and outbox events.

Database requirements:
- Add Exam, Question revision/snapshot, Attempt, Answer, Grade/release constraints; one active/final state rules.

Testing:
- Publish separation, draft leak, timing/resume, duplicate final submit, other-student denial, grading/release and cross-role E2E.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Published exam content is immutable for active attempts.
- Student attempt timing and final submission are server-authoritative/idempotent.
- Draft questions/results do not leak.
- Canonical `exams.publish` is enforced server and UI.
- Exam cross-role E2E passes.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-012 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```
## TASK-013 — Implement notifications, messaging, chat, and authorized deep links

**Priority:** P1

**Status:** [ ]

**Role(s):** All

**Section:** Messaging / notifications

**Depends on:** TASK-003, TASK-005 and domain event producers

**Blocks:** TASK-017 through TASK-021

### Problem

Notifications are seeded static rows, the header bell is inert, messaging/chat are off-nav mocks, and no relationship authorization, event delivery, unread count, retry, or safe deep link exists.

### Current Behavior

Typed clients and UI pages exist. No outbox/worker/socket server exists; realtime is a contract only. Current mock notification data is disconnected from assignments, grades, attendance, schedules, payments, and orders.

### Expected Behavior

Committed domain changes atomically enqueue deduplicated events; authorized recipients receive durable notifications/messages, unread counts, preferences, retry state, and deep links that reauthorize the target.

### Evidence

- frontend/src/services/notifications/client.ts:58-115
- frontend/src/components/layouts/AppShell.tsx:18-83
- backend/README.md:7-9
- docs/project-audit/TRACEABILITY_MATRIX.md

### Scope

#### Frontend

- Wire bell/badge/center/preferences; add role navigation and loading/empty/error/offline states.
- Implement authorized deep-link handling and thread/message UI with focus, keyboard, and unread semantics.

#### Backend

- Implement transactional outbox, dispatcher/retry/dead-letter visibility, notification APIs and authorized conversation/message/channel membership.
- Publish only from committed domain transactions and deduplicate by event/recipient/channel.

#### Database

- Add DomainEvent/Outbox, Notification, Delivery, Preference, Conversation, Participant and Message constraints/indexes.

#### Permissions

- Recipient, thread participant and deep-link resource are rechecked server-side; admin/support access is explicit and audited.

#### Navigation

- Add notification/message destinations to each role manifest; bell opens center and no dead route.

#### Tests

- Outbox atomicity/dedupe/retry; wrong recipient/thread denial; unread consistency; preference; deep-link authorization; role E2E.

### Files Likely Affected

- frontend/src/services/notifications/
- frontend/src/services/messaging/
- frontend/src/services/chat/
- frontend/src/components/layouts/AppShell.tsx
- backend/src/modules/notifications/
- backend/src/modules/messaging/

### Acceptance Criteria

- [ ] Assignment, grade, absence, schedule, payment and order events can produce exactly-once visible notifications per configured recipient.
- [ ] Unread badge and center reconcile after read/update.
- [ ] Unrelated actors cannot enumerate threads or follow protected deep links.
- [ ] Delivery retries are observable and idempotent.
- [ ] Messaging/notification integration and E2E pass.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
pnpm --dir frontend test:e2e
```

### AI Implementation Prompt

```text
Implement TASK-013 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
Committed domain changes atomically enqueue deduplicated events; authorized recipients receive durable notifications/messages, unread counts, preferences, retry state, and deep links that reauthorize the target.

Current problem:
Notifications are seeded static rows, the header bell is inert, messaging/chat are off-nav mocks, and no relationship authorization, event delivery, unread count, retry, or safe deep link exists. Typed clients and UI pages exist. No outbox/worker/socket server exists; realtime is a contract only. Current mock notification data is disconnected from assignments, grades, attendance, schedules, payments, and orders.

Relevant roles:
- All

Relevant files:
- frontend/src/services/notifications/
- frontend/src/services/messaging/
- frontend/src/services/chat/
- frontend/src/components/layouts/AppShell.tsx
- backend/src/modules/notifications/
- backend/src/modules/messaging/

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Recipient, thread participant and deep-link resource are rechecked server-side; admin/support access is explicit and audited.

Frontend requirements:
- Wire bell/badge/center/preferences; add role navigation and loading/empty/error/offline states.
- Implement authorized deep-link handling and thread/message UI with focus, keyboard, and unread semantics.

Backend requirements:
- Implement transactional outbox, dispatcher/retry/dead-letter visibility, notification APIs and authorized conversation/message/channel membership.
- Publish only from committed domain transactions and deduplicate by event/recipient/channel.

Database requirements:
- Add DomainEvent/Outbox, Notification, Delivery, Preference, Conversation, Participant and Message constraints/indexes.

Testing:
- Outbox atomicity/dedupe/retry; wrong recipient/thread denial; unread consistency; preference; deep-link authorization; role E2E.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Assignment, grade, absence, schedule, payment and order events can produce exactly-once visible notifications per configured recipient.
- Unread badge and center reconcile after read/update.
- Unrelated actors cannot enumerate threads or follow protected deep links.
- Delivery retries are observable and idempotent.
- Messaging/notification integration and E2E pass.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-013 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```


## TASK-014 — Implement tuition, billing, payment, and ledger integrity

**Priority:** P1

**Status:** [ ]

**Role(s):** Owner, Finance, Guardian/payer, Admin support

**Section:** Tuition / billing

**Depends on:** TASK-002, TASK-004, TASK-005, TASK-008

**Blocks:** TASK-019, TASK-020

### Problem

Tuition, checkout, invoice, subscription, balance, and finance-like actions mutate mock state and can look transactional without a ledger, provider, idempotency, or reconciliation.

### Current Behavior

Numerous typed clients/views exist, but no payment processor, webhook, DB, durable totals, refund/dunning flow, or payer scope exists.

### Expected Behavior

Money flows use integer minor units and currency, an immutable balanced ledger, idempotent commands/webhooks, explicit payment states, reconciliation, audited adjustments, and least-privilege finance/payer projections.

### Evidence

- frontend/src/features/checkout/components/OrganizationCheckoutView.tsx:131-185
- docs/project-audit/sections/tuition-billing.md
- backend/README.md:7-9

### Scope

#### Frontend

- Connect existing finance views to real read models/actions; clearly label source/freshness; add pending/failed/retry/refund/empty states and guardian payer view.

#### Backend

- Implement charges, invoices, payments/webhooks, ledger posting, reconciliation, refund/dunning and idempotency with provider adapter boundaries.

#### Database

- Add immutable LedgerEntry, Account, Charge, Invoice, Payment, WebhookReceipt and reconciliation records with currency/minor-unit constraints.

#### Permissions

- Finance write/reconcile, owner read/delegate, payer linked/self, and admin support/audit are distinct; mask sensitive fields.

#### Navigation

- Provide finance dashboard and payer routes; remove finance data from unrelated roles.

#### Tests

- Duplicate command/webhook, out-of-order webhook, rollback, reconciliation, refund, currency, field masking and role negative tests.

### Files Likely Affected

- frontend/src/services/tuition/
- frontend/src/services/billing/
- frontend/src/features/checkout/
- backend/src/modules/billing/
- backend/prisma/schema.prisma

### Acceptance Criteria

- [ ] Duplicate requests/webhooks cannot duplicate money or state transitions.
- [ ] Ledger totals reconcile to provider and source records.
- [ ] Only authorized finance/payer views return financial data.
- [ ] Every adjustment/refund is auditable and reversible by compensating entry, not mutation.
- [ ] Billing integration and E2E pass with provider test adapter.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
pnpm --dir frontend test:e2e
```

### AI Implementation Prompt

```text
Implement TASK-014 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
Money flows use integer minor units and currency, an immutable balanced ledger, idempotent commands/webhooks, explicit payment states, reconciliation, audited adjustments, and least-privilege finance/payer projections.

Current problem:
Tuition, checkout, invoice, subscription, balance, and finance-like actions mutate mock state and can look transactional without a ledger, provider, idempotency, or reconciliation. Numerous typed clients/views exist, but no payment processor, webhook, DB, durable totals, refund/dunning flow, or payer scope exists.

Relevant roles:
- Owner, Finance, Guardian/payer, Admin support

Relevant files:
- frontend/src/services/tuition/
- frontend/src/services/billing/
- frontend/src/features/checkout/
- backend/src/modules/billing/
- backend/prisma/schema.prisma

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Finance write/reconcile, owner read/delegate, payer linked/self, and admin support/audit are distinct; mask sensitive fields.

Frontend requirements:
- Connect existing finance views to real read models/actions; clearly label source/freshness; add pending/failed/retry/refund/empty states and guardian payer view.

Backend requirements:
- Implement charges, invoices, payments/webhooks, ledger posting, reconciliation, refund/dunning and idempotency with provider adapter boundaries.

Database requirements:
- Add immutable LedgerEntry, Account, Charge, Invoice, Payment, WebhookReceipt and reconciliation records with currency/minor-unit constraints.

Testing:
- Duplicate command/webhook, out-of-order webhook, rollback, reconciliation, refund, currency, field masking and role negative tests.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Duplicate requests/webhooks cannot duplicate money or state transitions.
- Ledger totals reconcile to provider and source records.
- Only authorized finance/payer views return financial data.
- Every adjustment/refund is auditable and reversible by compensating entry, not mutation.
- Billing integration and E2E pass with provider test adapter.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-014 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```


## TASK-015 — Implement marketplace seller, moderation, order, fulfillment, and payout lifecycle

**Priority:** P1

**Status:** [ ]

**Role(s):** Seller capability, buyer, Admin Solo

**Section:** Marketplace / commerce

**Depends on:** TASK-005, TASK-006, TASK-014

**Blocks:** TASK-021

### Problem

Seller, moderation, buyer cart/order, shipping/returns, balance, and analytics screens are disconnected mocks with no seller capability registry key, ownership checks, inventory transaction, or payout ledger.

### Current Behavior

Routes and clients exist but are mostly off-nav. Moderation only checks for a session. Orders/balances mutate memory and do not form an end-to-end lifecycle.

### Expected Behavior

A granted seller owns products/variants, submits immutable revisions for admin moderation, buyers transact against price/inventory snapshots, sellers fulfill/return, and payout balances derive from the ledger.

### Evidence

- frontend/src/app/personal/seller/**/page.tsx
- frontend/src/features/marketplace-moderation/components/MarketplaceModerationView.tsx:26-55
- docs/project-audit/sections/marketplace-commerce.md

### Scope

#### Frontend

- Connect seller/buyer/admin views; add ownership-aware actions, moderation reasons/version conflicts, checkout/fulfillment/return states and trustworthy totals.

#### Backend

- Implement seller grant/onboarding, catalog revisions/moderation, inventory reservation, idempotent order transitions, fulfillment/returns and ledger-derived payout APIs.

#### Database

- Add SellerProfile, Product/Revision, Variant/SKU, Inventory/Reservation, Cart, Order/Line, Shipment/Return and payout references with uniqueness/version constraints.

#### Permissions

- Seller can mutate only owned resources; buyer only own cart/orders; moderation only exact admin grant; public reads only published snapshots.

#### Navigation

- Add seller group for granted users and moderation for admins; buyers receive order links.

#### Tests

- Cross-seller/buyer denial, revision moderation, oversell concurrency, repeated checkout, transition validity, return/payout reconciliation and multi-account E2E.

### Files Likely Affected

- frontend/src/services/marketplace-*/
- frontend/src/features/marketplace-*/
- frontend/src/features/seller-*/
- backend/src/modules/marketplace/

### Acceptance Criteria

- [ ] Author→moderate→publish→buy→fulfill/return→payout persists end-to-end.
- [ ] Draft/rejected products are not publicly visible.
- [ ] Inventory and checkout are concurrency-safe/idempotent.
- [ ] Seller/buyer/admin scopes are enforced server-side.
- [ ] Marketplace integration and E2E pass.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
pnpm --dir frontend test:e2e
```

### AI Implementation Prompt

```text
Implement TASK-015 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
A granted seller owns products/variants, submits immutable revisions for admin moderation, buyers transact against price/inventory snapshots, sellers fulfill/return, and payout balances derive from the ledger.

Current problem:
Seller, moderation, buyer cart/order, shipping/returns, balance, and analytics screens are disconnected mocks with no seller capability registry key, ownership checks, inventory transaction, or payout ledger. Routes and clients exist but are mostly off-nav. Moderation only checks for a session. Orders/balances mutate memory and do not form an end-to-end lifecycle.

Relevant roles:
- Seller capability, buyer, Admin Solo

Relevant files:
- frontend/src/services/marketplace-*/
- frontend/src/features/marketplace-*/
- frontend/src/features/seller-*/
- backend/src/modules/marketplace/

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Seller can mutate only owned resources; buyer only own cart/orders; moderation only exact admin grant; public reads only published snapshots.

Frontend requirements:
- Connect seller/buyer/admin views; add ownership-aware actions, moderation reasons/version conflicts, checkout/fulfillment/return states and trustworthy totals.

Backend requirements:
- Implement seller grant/onboarding, catalog revisions/moderation, inventory reservation, idempotent order transitions, fulfillment/returns and ledger-derived payout APIs.

Database requirements:
- Add SellerProfile, Product/Revision, Variant/SKU, Inventory/Reservation, Cart, Order/Line, Shipment/Return and payout references with uniqueness/version constraints.

Testing:
- Cross-seller/buyer denial, revision moderation, oversell concurrency, repeated checkout, transition validity, return/payout reconciliation and multi-account E2E.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Author→moderate→publish→buy→fulfill/return→payout persists end-to-end.
- Draft/rejected products are not publicly visible.
- Inventory and checkout are concurrency-safe/idempotent.
- Seller/buyer/admin scopes are enforced server-side.
- Marketplace integration and E2E pass.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-015 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```


## TASK-016 — Build policy-derived responsive navigation and route-state infrastructure

**Priority:** P2

**Status:** [ ]

**Role(s):** All

**Section:** Shells / navigation / routing

**Depends on:** TASK-003, TASK-004, TASK-005, TASK-007

**Blocks:** TASK-017 through TASK-022

### Problem

AppShell is hardcoded, Organization shell exposes ~60 unfiltered items in a horizontal mobile scroller, Admin lacks mobile navigation, many routes are orphaned, and declared state routes are missing.

### Current Behavior

Personal desktop/mobile arrays differ and include wrong destinations; search/bell are inert; org Settings is text; shells lack consistent active state, breadcrumbs, skip link, and policy parity.

### Expected Behavior

A canonical route manifest maps label, route builder, permission, context, group, mobile priority and state behavior. All shells render it responsively and direct URLs use the same server policy.

### Evidence

- frontend/src/components/layouts/AppShell.tsx:18-83
- frontend/src/features/organization/components/OrgShell.tsx:81-444
- frontend/src/features/admin/components/AdminShell.tsx:30-118
- frontend/src/lib/routes.ts:212-217

### Scope

#### Frontend

- Create typed route/nav manifest; group/active-state desktop sidebars; ≤5 mobile primaries plus accessible overflow; working search/bell/user/context controls; breadcrumbs/skip link/main focus.
- Implement forbidden/deleted/archived pages and dead-link checks.

#### Backend

- Expose verified context/capabilities and route authorization decision; do not put business authorization only in middleware/navigation.

#### Database

- No new domain tables beyond grants from prior tasks.

#### Permissions

- Menu visibility, direct route, action buttons and API policy reference the same canonical key; hidden is not authorization.

#### Navigation

- This task owns navigation migration and reachability for all existing routes.

#### Tests

- Role/context nav snapshots, link existence, active state, direct URL denial, keyboard/focus, 375/768/1024/1440 responsive behavior.

### Files Likely Affected

- frontend/src/components/layouts/AppShell.tsx
- frontend/src/features/organization/components/OrgShell.tsx
- frontend/src/features/admin/components/AdminShell.tsx
- frontend/src/lib/routes.ts
- frontend/src/app/state/

### Acceptance Criteria

- [ ] Every menu item resolves and every intended page is reachable by an authorized role.
- [ ] No unauthorized item renders and direct access is denied consistently.
- [ ] Mobile has at most five primary destinations and accessible overflow.
- [ ] Search, bell, context and user controls perform real actions.
- [ ] Role/navigation/responsive tests pass.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
pnpm --dir frontend test:e2e
```

### AI Implementation Prompt

```text
Implement TASK-016 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
A canonical route manifest maps label, route builder, permission, context, group, mobile priority and state behavior. All shells render it responsively and direct URLs use the same server policy.

Current problem:
AppShell is hardcoded, Organization shell exposes ~60 unfiltered items in a horizontal mobile scroller, Admin lacks mobile navigation, many routes are orphaned, and declared state routes are missing. Personal desktop/mobile arrays differ and include wrong destinations; search/bell are inert; org Settings is text; shells lack consistent active state, breadcrumbs, skip link, and policy parity.

Relevant roles:
- All

Relevant files:
- frontend/src/components/layouts/AppShell.tsx
- frontend/src/features/organization/components/OrgShell.tsx
- frontend/src/features/admin/components/AdminShell.tsx
- frontend/src/lib/routes.ts
- frontend/src/app/state/

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Menu visibility, direct route, action buttons and API policy reference the same canonical key; hidden is not authorization.

Frontend requirements:
- Create typed route/nav manifest; group/active-state desktop sidebars; ≤5 mobile primaries plus accessible overflow; working search/bell/user/context controls; breadcrumbs/skip link/main focus.
- Implement forbidden/deleted/archived pages and dead-link checks.

Backend requirements:
- Expose verified context/capabilities and route authorization decision; do not put business authorization only in middleware/navigation.

Database requirements:
- No new domain tables beyond grants from prior tasks.

Testing:
- Role/context nav snapshots, link existence, active state, direct URL denial, keyboard/focus, 375/768/1024/1440 responsive behavior.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Every menu item resolves and every intended page is reachable by an authorized role.
- No unauthorized item renders and direct access is denied consistently.
- Mobile has at most five primary destinations and accessible overflow.
- Search, bell, context and user controls perform real actions.
- Role/navigation/responsive tests pass.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-016 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```


## TASK-017 — Deliver the assigned-scope teacher workspace and dashboard

**Priority:** P2

**Status:** [ ]

**Role(s):** Teacher persona, Organization Teacher

**Section:** Teacher panel

**Depends on:** TASK-009, TASK-010, TASK-011, TASK-012, TASK-013, TASK-016

**Blocks:** None

### Problem

Teacher has four routes and three mock counters; daily academic work is hidden in organization consoles and organization-teacher grants cannot access it coherently.

### Current Behavior

`/teacher` checks client `nav.teacher`; activation/plans/profile exist; classes, sessions, attendance, assignments, grading, exams, resources, calendar and communication are absent from the panel.

### Expected Behavior

A teacher dashboard prioritizes next assigned sessions, attendance work, submissions/exams to grade, deadlines/alerts and quick actions, with routes reusing real assigned-scope vertical slices.

### Evidence

- frontend/src/features/teacher/components/TeacherDashboardView.tsx:19-109
- frontend/src/app/teacher/**/page.tsx
- docs/project-audit/roles/teacher.md

### Scope

#### Frontend

- Implement teacher shell/dashboard and assigned list/detail/action routes; reuse domain components through role-specific projections; include responsive/accessibility states.

#### Backend

- Provide dashboard aggregate and assigned-scope queries only; avoid duplicate domain business logic.

#### Database

- No additional core entities expected; add indexes/read models only if justified and migrated.

#### Permissions

- Both teacher contexts use assignment-derived object scope; public profile/account permissions remain separate.

#### Navigation

- Use TASK-016 manifest with dashboard, classes/students, sessions/attendance, assignments/gradebook, exams, resources/calendar/messages.

#### Tests

- Unassigned class denial; dashboard aggregate accuracy; quick-action deep links; full assigned teacher journey on mobile/desktop.

### Files Likely Affected

- frontend/src/features/teacher/
- frontend/src/app/teacher/
- backend/src/modules/teacher-dashboard/

### Acceptance Criteria

- [ ] Teacher completes assigned session/attendance/assignment/grade/exam work without entering owner-only consoles.
- [ ] Unassigned data/actions are absent and denied server-side.
- [ ] Dashboard values reconcile with source queries and link to filtered work queues.
- [ ] Loading/empty/error/mobile/keyboard states pass.
- [ ] Teacher E2E passes.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
pnpm --dir frontend test:e2e
```

### AI Implementation Prompt

```text
Implement TASK-017 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
A teacher dashboard prioritizes next assigned sessions, attendance work, submissions/exams to grade, deadlines/alerts and quick actions, with routes reusing real assigned-scope vertical slices.

Current problem:
Teacher has four routes and three mock counters; daily academic work is hidden in organization consoles and organization-teacher grants cannot access it coherently. `/teacher` checks client `nav.teacher`; activation/plans/profile exist; classes, sessions, attendance, assignments, grading, exams, resources, calendar and communication are absent from the panel.

Relevant roles:
- Teacher persona, Organization Teacher

Relevant files:
- frontend/src/features/teacher/
- frontend/src/app/teacher/
- backend/src/modules/teacher-dashboard/

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Both teacher contexts use assignment-derived object scope; public profile/account permissions remain separate.

Frontend requirements:
- Implement teacher shell/dashboard and assigned list/detail/action routes; reuse domain components through role-specific projections; include responsive/accessibility states.

Backend requirements:
- Provide dashboard aggregate and assigned-scope queries only; avoid duplicate domain business logic.

Database requirements:
- No additional core entities expected; add indexes/read models only if justified and migrated.

Testing:
- Unassigned class denial; dashboard aggregate accuracy; quick-action deep links; full assigned teacher journey on mobile/desktop.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Teacher completes assigned session/attendance/assignment/grade/exam work without entering owner-only consoles.
- Unassigned data/actions are absent and denied server-side.
- Dashboard values reconcile with source queries and link to filtered work queues.
- Loading/empty/error/mobile/keyboard states pass.
- Teacher E2E passes.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-017 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```


## TASK-018 — Deliver the self-scoped student learning workspace and dashboard

**Priority:** P2

**Status:** [ ]

**Role(s):** Student

**Section:** Student panel

**Depends on:** TASK-009, TASK-010, TASK-011, TASK-012, TASK-013, TASK-016

**Blocks:** None

### Problem

Student has only dashboard counters, activation, and portfolio; no schedule, join, assignment submission, exam attempt, results, resources, or coherent communication routes.

### Current Behavior

`StudentDashboardView` uses mock counts/relationships and client-only navigation capability. Staff mocks contain academic records with no student consumer UI.

### Expected Behavior

A mobile-first student workspace exposes enrolled schedule/classes, actionable due assignments, active exams, released grades/progress, resources, messages/notifications, and own profile/settings.

### Evidence

- frontend/src/features/student/components/StudentDashboardView.tsx:19-129
- frontend/src/app/student/**/page.tsx
- docs/project-audit/roles/student.md

### Scope

#### Frontend

- Build student shell/dashboard and self-scoped routes over real domain APIs; prioritize next class/due work; accessible deadline/status semantics and offline/error behavior.

#### Backend

- Provide student projection/dashboard queries and join/deep-link authorization; reuse domain commands for submission/attempt.

#### Database

- No new core entities expected; indexes/read models only when measured.

#### Permissions

- Student may access only own active enrollments/submissions/attempts and released results.

#### Navigation

- Use ≤5 mobile primaries with overflow to results/resources/messages/settings.

#### Tests

- Other-student denial, enrollment removal, unreleased result, due/attempt state, deep links, responsive keyboard and full student journey.

### Files Likely Affected

- frontend/src/features/student/
- frontend/src/app/student/
- backend/src/modules/student-dashboard/

### Acceptance Criteria

- [ ] Student can schedule→join/view→submit/attempt→view released result end-to-end.
- [ ] No other-student or draft/restricted data is returned.
- [ ] Dashboard actions link to correctly filtered real queues.
- [ ] Mobile primary navigation and accessible states pass.
- [ ] Student E2E passes.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
pnpm --dir frontend test:e2e
```

### AI Implementation Prompt

```text
Implement TASK-018 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
A mobile-first student workspace exposes enrolled schedule/classes, actionable due assignments, active exams, released grades/progress, resources, messages/notifications, and own profile/settings.

Current problem:
Student has only dashboard counters, activation, and portfolio; no schedule, join, assignment submission, exam attempt, results, resources, or coherent communication routes. `StudentDashboardView` uses mock counts/relationships and client-only navigation capability. Staff mocks contain academic records with no student consumer UI.

Relevant roles:
- Student

Relevant files:
- frontend/src/features/student/
- frontend/src/app/student/
- backend/src/modules/student-dashboard/

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Student may access only own active enrollments/submissions/attempts and released results.

Frontend requirements:
- Build student shell/dashboard and self-scoped routes over real domain APIs; prioritize next class/due work; accessible deadline/status semantics and offline/error behavior.

Backend requirements:
- Provide student projection/dashboard queries and join/deep-link authorization; reuse domain commands for submission/attempt.

Database requirements:
- No new core entities expected; indexes/read models only when measured.

Testing:
- Other-student denial, enrollment removal, unreleased result, due/attempt state, deep links, responsive keyboard and full student journey.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Student can schedule→join/view→submit/attempt→view released result end-to-end.
- No other-student or draft/restricted data is returned.
- Dashboard actions link to correctly filtered real queues.
- Mobile primary navigation and accessible states pass.
- Student E2E passes.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-018 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```


## TASK-019 — Deliver the linked-child guardian workspace and dashboard

**Priority:** P2

**Status:** [ ]

**Role(s):** Guardian

**Section:** Guardian panel

**Depends on:** TASK-008, TASK-010, TASK-011, TASK-012, TASK-013, TASK-014, TASK-016

**Blocks:** None

### Problem

Guardian dashboard only shows mock relationships/counters; no explicit child context, attendance/progress/results, approvals, payments, messages, or deep-linked notifications exist.

### Current Behavior

`/guardian` uses client `nav.guardian`. Relationships are not server-enforced, and consumer pages are absent.

### Expected Behavior

Guardian selects an active linked child and sees permitted schedule, attendance, released academic results, supported approvals/payments, messages and notifications without leaking unrelated children.

### Evidence

- frontend/src/features/guardian/components/GuardianDashboardView.tsx:19-123
- frontend/src/app/guardian/**/page.tsx
- docs/project-audit/roles/guardian.md

### Scope

#### Frontend

- Build child-context shell/dashboard and routes; keep selected child explicit in URL/state; handle unlink/expired relation and multi-child switching accessibly.

#### Backend

- Provide linked-child projections, dashboard aggregates, supported approval and payer commands; reauthorize every deep link.

#### Database

- Use GuardianRelationship and domain records; add indexes/read model only if required.

#### Permissions

- Active relationship required for every child read/action; field/action visibility follows consent and domain release state.

#### Navigation

- Child switcher plus attendance/progress/results/approvals/payments/messages/notifications/settings.

#### Tests

- Unrelated/unlinked child denial, link expiry, multi-child switch, unreleased result, payment/approval scope, deep-link and responsive E2E.

### Files Likely Affected

- frontend/src/features/guardian/
- frontend/src/app/guardian/
- backend/src/modules/guardian-dashboard/

### Acceptance Criteria

- [ ] Guardian can switch only among active linked children.
- [ ] Every page/API revalidates the relationship and release/consent state.
- [ ] Dashboard alerts and totals reconcile with child records.
- [ ] Unlink immediately removes access without losing audit history.
- [ ] Guardian E2E passes.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
pnpm --dir frontend test:e2e
```

### AI Implementation Prompt

```text
Implement TASK-019 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
Guardian selects an active linked child and sees permitted schedule, attendance, released academic results, supported approvals/payments, messages and notifications without leaking unrelated children.

Current problem:
Guardian dashboard only shows mock relationships/counters; no explicit child context, attendance/progress/results, approvals, payments, messages, or deep-linked notifications exist. `/guardian` uses client `nav.guardian`. Relationships are not server-enforced, and consumer pages are absent.

Relevant roles:
- Guardian

Relevant files:
- frontend/src/features/guardian/
- frontend/src/app/guardian/
- backend/src/modules/guardian-dashboard/

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Active relationship required for every child read/action; field/action visibility follows consent and domain release state.

Frontend requirements:
- Build child-context shell/dashboard and routes; keep selected child explicit in URL/state; handle unlink/expired relation and multi-child switching accessibly.

Backend requirements:
- Provide linked-child projections, dashboard aggregates, supported approval and payer commands; reauthorize every deep link.

Database requirements:
- Use GuardianRelationship and domain records; add indexes/read model only if required.

Testing:
- Unrelated/unlinked child denial, link expiry, multi-child switch, unreleased result, payment/approval scope, deep-link and responsive E2E.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Guardian can switch only among active linked children.
- Every page/API revalidates the relationship and release/consent state.
- Dashboard alerts and totals reconcile with child records.
- Unlink immediately removes access without losing audit history.
- Guardian E2E passes.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-019 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```


## TASK-020 — Deliver organization-role dashboards and authoritative reports

**Priority:** P2

**Status:** [ ]

**Role(s):** Owner, Manager, Academic Manager, Finance, Support Staff, Admin Solo

**Section:** Dashboards / reporting

**Depends on:** TASK-006 through TASK-016

**Blocks:** None

### Problem

Every organization role receives the same generic three-stat dashboard; admin/org reports and exports use seeded values with no source/freshness or authoritative scope.

### Current Behavior

Organization dashboard fetches by URL ID and shows trial/branches/members. Finance/support/academic manager have no role dashboard. Reports/exports are mocks.

### Expected Behavior

Each real role receives only workflow-backed KPIs, alerts, pending queues, recent activity and quick actions listed in DASHBOARD_MATRIX. Aggregates and exports are scoped, reconcilable, labeled, and accessible.

### Evidence

- frontend/src/features/organization-dashboard/components/OrganizationDashboardView.tsx:14-96
- frontend/src/features/admin-dashboard/components/AdminDashboardView.tsx:22-48
- docs/project-audit/DASHBOARD_MATRIX.md
- docs/project-audit/sections/reports-analytics.md

### Scope

#### Frontend

- Implement role compositions and report/export states; chart data has table/text alternative, source/freshness and filter parity.

#### Backend

- Implement scoped aggregate/read models and background export with authorization at creation and download.

#### Database

- Add only justified aggregate indexes/jobs/export records; source data remains authoritative.

#### Permissions

- Each widget/export uses canonical permission and repository scope; sensitive finance/admin fields are not merely hidden.

#### Navigation

- Dashboard/report links follow role manifest; quick actions never target forbidden routes.

#### Tests

- Aggregate reconciliation, stale/source labels, role snapshot, export filter/scope/download authorization, chart accessibility and responsive tests.

### Files Likely Affected

- frontend/src/features/organization-dashboard/
- frontend/src/features/admin-dashboard/
- frontend/src/features/reports/
- backend/src/modules/reporting/

### Acceptance Criteria

- [ ] Owner, manager, academic manager, finance and support dashboards differ by authorized daily work.
- [ ] All totals reconcile to source fixtures/transactions.
- [ ] Exports preserve filters and are reauthorized at download.
- [ ] Charts have accessible non-color/tabular alternatives.
- [ ] Dashboard/report integration and E2E pass.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
pnpm --dir frontend test:e2e
```

### AI Implementation Prompt

```text
Implement TASK-020 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
Each real role receives only workflow-backed KPIs, alerts, pending queues, recent activity and quick actions listed in DASHBOARD_MATRIX. Aggregates and exports are scoped, reconcilable, labeled, and accessible.

Current problem:
Every organization role receives the same generic three-stat dashboard; admin/org reports and exports use seeded values with no source/freshness or authoritative scope. Organization dashboard fetches by URL ID and shows trial/branches/members. Finance/support/academic manager have no role dashboard. Reports/exports are mocks.

Relevant roles:
- Owner, Manager, Academic Manager, Finance, Support Staff, Admin Solo

Relevant files:
- frontend/src/features/organization-dashboard/
- frontend/src/features/admin-dashboard/
- frontend/src/features/reports/
- backend/src/modules/reporting/

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Each widget/export uses canonical permission and repository scope; sensitive finance/admin fields are not merely hidden.

Frontend requirements:
- Implement role compositions and report/export states; chart data has table/text alternative, source/freshness and filter parity.

Backend requirements:
- Implement scoped aggregate/read models and background export with authorization at creation and download.

Database requirements:
- Add only justified aggregate indexes/jobs/export records; source data remains authoritative.

Testing:
- Aggregate reconciliation, stale/source labels, role snapshot, export filter/scope/download authorization, chart accessibility and responsive tests.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Owner, manager, academic manager, finance and support dashboards differ by authorized daily work.
- All totals reconcile to source fixtures/transactions.
- Exports preserve filters and are reauthorized at download.
- Charts have accessible non-color/tabular alternatives.
- Dashboard/report integration and E2E pass.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-020 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```


## TASK-021 — Deliver seller navigation, dashboard, and operational queues

**Priority:** P2

**Status:** [ ]

**Role(s):** Seller capability

**Section:** Seller panel

**Depends on:** TASK-013, TASK-015, TASK-016

**Blocks:** None

### Problem

Seller routes are off-nav and onboarding doubles as a home; no operational dashboard/settings composition connects products, moderation, orders, returns, balance, payout, and alerts.

### Current Behavior

Product, variant, order, balance, taxonomy, analytics and shipping routes exist as mocks. The capability engine has no seller keys and AppShell does not expose them.

### Expected Behavior

Only a granted seller receives a seller workspace with trustworthy product/moderation/order/fulfillment/return/payout queues, notifications, analytics and own settings.

### Evidence

- frontend/src/app/personal/seller/**/page.tsx
- frontend/src/components/layouts/AppShell.tsx:18-29
- frontend/src/lib/capabilities/engine.ts:18-105
- docs/project-audit/roles/seller.md

### Scope

#### Frontend

- Create seller shell/dashboard/settings and connect existing pages to TASK-015 APIs; show actionable states and ledger-derived values.

#### Backend

- Provide seller-scoped dashboard aggregates and settings projection; reuse marketplace domain services.

#### Database

- No new core marketplace entities expected; add settings/read-model records only if justified.

#### Permissions

- Seller grant plus object ownership is required; losing grant immediately removes navigation and API access.

#### Navigation

- Add seller group only for granted capability; ≤5 mobile primary destinations with overflow.

#### Tests

- Non-seller/grant revocation, cross-seller denial, queue counts, deep links, settings, responsive and seller E2E.

### Files Likely Affected

- frontend/src/features/seller-*/
- frontend/src/app/personal/seller/
- backend/src/modules/seller-dashboard/

### Acceptance Criteria

- [ ] Granted seller can reach every relevant operational page from the panel.
- [ ] Dashboard queues reconcile with owned marketplace records.
- [ ] Non-seller and revoked seller are denied server-side.
- [ ] Balance/payout values derive from authoritative ledger.
- [ ] Seller panel E2E passes.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
pnpm --dir frontend test:e2e
```

### AI Implementation Prompt

```text
Implement TASK-021 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
Only a granted seller receives a seller workspace with trustworthy product/moderation/order/fulfillment/return/payout queues, notifications, analytics and own settings.

Current problem:
Seller routes are off-nav and onboarding doubles as a home; no operational dashboard/settings composition connects products, moderation, orders, returns, balance, payout, and alerts. Product, variant, order, balance, taxonomy, analytics and shipping routes exist as mocks. The capability engine has no seller keys and AppShell does not expose them.

Relevant roles:
- Seller capability

Relevant files:
- frontend/src/features/seller-*/
- frontend/src/app/personal/seller/
- backend/src/modules/seller-dashboard/

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Seller grant plus object ownership is required; losing grant immediately removes navigation and API access.

Frontend requirements:
- Create seller shell/dashboard/settings and connect existing pages to TASK-015 APIs; show actionable states and ledger-derived values.

Backend requirements:
- Provide seller-scoped dashboard aggregates and settings projection; reuse marketplace domain services.

Database requirements:
- No new core marketplace entities expected; add settings/read-model records only if justified.

Testing:
- Non-seller/grant revocation, cross-seller denial, queue counts, deep links, settings, responsive and seller E2E.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Granted seller can reach every relevant operational page from the panel.
- Dashboard queues reconcile with owned marketplace records.
- Non-seller and revoked seller are denied server-side.
- Balance/payout values derive from authoritative ledger.
- Seller panel E2E passes.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-021 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```


## TASK-022 — Complete route resilience, interaction states, and WCAG 2.1 AA basics

**Priority:** P2

**Status:** [ ]

**Role(s):** All

**Section:** Frontend resilience / accessibility

**Depends on:** TASK-016 through TASK-021

**Blocks:** TASK-023, TASK-024

### Problem

There are no App Router loading/error files, three declared state pages are absent, interaction feedback varies, and observed accessibility E2E includes a home-page failure.

### Current Behavior

Only the root layout exists; routes commonly manage client loading ad hoc. Shells lack skip/focus/breadcrumb behavior; responsive and keyboard coverage is incomplete.

### Expected Behavior

Primary route groups have consistent loading/error/not-found/forbidden/deleted/archived/offline/retry behavior, accessible focus and feedback, 44px targets, no horizontal overflow, and keyboard/semantic parity.

### Evidence

- frontend/src/app/layout.tsx:1-38
- frontend/src/lib/routes.ts:212-217
- frontend/src/app/state/not-found/page.tsx
- docs/project-audit/TEST_MATRIX.md

### Scope

#### Frontend

- Add route-group layouts/loading/error states where appropriate; shared form/table/dialog feedback; focus management, skip links, live status, reduced motion and responsive fixes.
- Test at 375/768/1024/1440 and avoid overloaded horizontal nav.

#### Backend

- Return consistent typed 4xx/5xx/problem responses so UI can distinguish forbidden/not-found/conflict/retry.

#### Database

- No DB change expected.

#### Permissions

- Error rendering must not leak object existence or sensitive response detail.

#### Navigation

- All state/retry/back flows preserve safe context and never dead-end.

#### Tests

- Axe serious/critical zero on primary shells; keyboard paths; focus after navigation/dialog/error; reduced motion; responsive overflow and route-boundary tests.

### Files Likely Affected

- frontend/src/app/
- frontend/src/components/ui/
- frontend/e2e/a11y.spec.ts
- frontend/src/styles/

### Acceptance Criteria

- [ ] Primary route groups render usable loading/error/retry states.
- [ ] Forbidden/deleted/archived/not-found routes exist and do not leak data.
- [ ] No serious/critical axe violation remains on audited primary pages.
- [ ] Keyboard/focus/reduced-motion and 375px overflow tests pass.
- [ ] Lint/typecheck/unit/E2E/build pass.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
pnpm --dir frontend test:e2e
```

### AI Implementation Prompt

```text
Implement TASK-022 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
Primary route groups have consistent loading/error/not-found/forbidden/deleted/archived/offline/retry behavior, accessible focus and feedback, 44px targets, no horizontal overflow, and keyboard/semantic parity.

Current problem:
There are no App Router loading/error files, three declared state pages are absent, interaction feedback varies, and observed accessibility E2E includes a home-page failure. Only the root layout exists; routes commonly manage client loading ad hoc. Shells lack skip/focus/breadcrumb behavior; responsive and keyboard coverage is incomplete.

Relevant roles:
- All

Relevant files:
- frontend/src/app/
- frontend/src/components/ui/
- frontend/e2e/a11y.spec.ts
- frontend/src/styles/

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Error rendering must not leak object existence or sensitive response detail.

Frontend requirements:
- Add route-group layouts/loading/error states where appropriate; shared form/table/dialog feedback; focus management, skip links, live status, reduced motion and responsive fixes.
- Test at 375/768/1024/1440 and avoid overloaded horizontal nav.

Backend requirements:
- Return consistent typed 4xx/5xx/problem responses so UI can distinguish forbidden/not-found/conflict/retry.

Database requirements:
- No DB change expected.

Testing:
- Axe serious/critical zero on primary shells; keyboard paths; focus after navigation/dialog/error; reduced motion; responsive overflow and route-boundary tests.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Primary route groups render usable loading/error/retry states.
- Forbidden/deleted/archived/not-found routes exist and do not leak data.
- No serious/critical axe violation remains on audited primary pages.
- Keyboard/focus/reduced-motion and 375px overflow tests pass.
- Lint/typecheck/unit/E2E/build pass.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-022 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```


## TASK-023 — Reproduce verification failures and establish isolated CI gates

**Priority:** P3

**Status:** [ ]

**Role(s):** Engineering

**Section:** Testing / CI

**Depends on:** TASK-022

**Blocks:** TASK-024

### Problem

The audit build ran concurrently with the Playwright dev server and failed during page collection; the 129-test E2E run showed failures. Lint has four hook warnings and Knip reports configuration hints.

### Current Behavior

Typecheck and 287 unit tests pass. Build compilation passed but page collection reported missing `/_document` under concurrent `.next` activity. Home accessibility and add-ons E2E failures were observed before suite completion.

### Expected Behavior

Every failure is reproduced in isolation, classified as product/test/infrastructure, fixed only when confirmed, and protected by deterministic serial CI stages with artifacts.

### Evidence

- docs/project-audit/TEST_MATRIX.md
- frontend/src/features/add-ons/components/OrganizationAddOnsView.tsx:126
- frontend/src/features/checkout/components/OrganizationCheckoutView.tsx:131-185
- frontend/src/features/teacher-plans/components/TeacherPlansView.tsx:133

### Scope

#### Frontend

- Fix confirmed product/test issues and hook dependencies without suppressing rules; make E2E server lifecycle isolated from build output.

#### Backend

- Include backend quality stages introduced by TASK-002 and database service readiness.

#### Database

- Use isolated disposable test DB; no shared developer data.

#### Permissions

- CI includes negative permission/integration suites and does not expose secrets in artifacts.

#### Navigation

- Dead-link and role-nav matrix tests run in CI.

#### Tests

- Run build alone; run E2E alone with trace/screenshots on failure; repeat flaky suspects; add deterministic stage ordering and documented timeouts.

### Files Likely Affected

- frontend/playwright.config.ts
- frontend/e2e/
- frontend/eslint.config.mjs
- package.json
- CI configuration

### Acceptance Criteria

- [ ] Isolated build passes or has a reproducible root-cause test/fix.
- [ ] Full E2E result is green with no unexplained retry/flakiness.
- [ ] Lint has zero errors/warnings and Knip configuration is intentional.
- [ ] CI serializes conflicting `.next` operations and stores useful failure artifacts.
- [ ] Audit verification record is updated with exact final results.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
pnpm --dir frontend test:e2e
```

### AI Implementation Prompt

```text
Implement TASK-023 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
Every failure is reproduced in isolation, classified as product/test/infrastructure, fixed only when confirmed, and protected by deterministic serial CI stages with artifacts.

Current problem:
The audit build ran concurrently with the Playwright dev server and failed during page collection; the 129-test E2E run showed failures. Lint has four hook warnings and Knip reports configuration hints. Typecheck and 287 unit tests pass. Build compilation passed but page collection reported missing `/_document` under concurrent `.next` activity. Home accessibility and add-ons E2E failures were observed before suite completion.

Relevant roles:
- Engineering

Relevant files:
- frontend/playwright.config.ts
- frontend/e2e/
- frontend/eslint.config.mjs
- package.json
- CI configuration

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- CI includes negative permission/integration suites and does not expose secrets in artifacts.

Frontend requirements:
- Fix confirmed product/test issues and hook dependencies without suppressing rules; make E2E server lifecycle isolated from build output.

Backend requirements:
- Include backend quality stages introduced by TASK-002 and database service readiness.

Database requirements:
- Use isolated disposable test DB; no shared developer data.

Testing:
- Run build alone; run E2E alone with trace/screenshots on failure; repeat flaky suspects; add deterministic stage ordering and documented timeouts.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Isolated build passes or has a reproducible root-cause test/fix.
- Full E2E result is green with no unexplained retry/flakiness.
- Lint has zero errors/warnings and Knip configuration is intentional.
- CI serializes conflicting `.next` operations and stores useful failure artifacts.
- Audit verification record is updated with exact final results.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-023 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```


## TASK-024 — Reconcile design-system, performance, and delivery budgets

**Priority:** P3

**Status:** [ ]

**Role(s):** All

**Section:** Design system / performance

**Depends on:** TASK-022, TASK-023

**Blocks:** None

### Problem

Design documentation specifies a different font system than runtime, performance targets are not fully enforced per route, and dashboard/table/chart consistency lacks a final measured gate.

### Current Behavior

App uses Source Sans/Vazirmatn while design MASTER documents Poppins/Open Sans. Route budgets exist, but no completed audit proves p75 LCP/INP/CLS, bundle budget, Lighthouse floors, or all shell visual states.

### Expected Behavior

One documented token/typography source matches runtime; key routes meet explicit mobile-4G/auth-walled budgets and WCAG floors; performance and visual regression gates prevent drift.

### Evidence

- docs/project-audit/MASTER_AUDIT.md (Frontend assumptions)
- frontend/src/lib/performance/budgets.ts
- design-system/solo/MASTER.md
- frontend/src/app/layout.tsx:1-38

### Scope

#### Frontend

- Resolve typography/token source deliberately; normalize shell/table/form/chart primitives; remove avoidable client work and measure bundles/Core Web Vitals.
- Keep LCP/INP/CLS and per-route JS budgets stated in current project docs; add accessible chart/table alternatives.

#### Backend

- Optimize only measured API/read-model bottlenecks; include cache/freshness semantics without weakening scope.

#### Database

- Add indexes only from measured query plans and migration tests.

#### Permissions

- Performance caching must vary by verified tenant/user/scope and never leak data.

#### Navigation

- Visual regressions cover every role shell and mobile overflow.

#### Tests

- Bundle/budget checks, Lighthouse accessibility/performance floors, visual baselines, reduced-motion and representative 4G measurements.

### Files Likely Affected

- frontend/src/lib/performance/budgets.ts
- frontend/src/app/layout.tsx
- frontend/src/components/
- design-system/
- frontend/e2e/visual.spec.ts

### Acceptance Criteria

- [ ] Runtime typography/tokens and documented source of truth agree.
- [ ] Home/public/admin and role-panel budgets are measured and enforced.
- [ ] Lighthouse accessibility ≥90 and agreed performance floors pass on representative routes.
- [ ] No cache or optimization crosses user/tenant scope.
- [ ] Visual and performance baselines are documented and green.

### Verification Commands

```bash
pnpm frontend:lint
pnpm frontend:typecheck
pnpm frontend:test
pnpm frontend:build
pnpm --dir frontend test:e2e
```

### AI Implementation Prompt

```text
Implement TASK-024 from docs/project-audit/AI_IMPLEMENTATION_TASKS.md.

Objective:
One documented token/typography source matches runtime; key routes meet explicit mobile-4G/auth-walled budgets and WCAG floors; performance and visual regression gates prevent drift.

Current problem:
Design documentation specifies a different font system than runtime, performance targets are not fully enforced per route, and dashboard/table/chart consistency lacks a final measured gate. App uses Source Sans/Vazirmatn while design MASTER documents Poppins/Open Sans. Route budgets exist, but no completed audit proves p75 LCP/INP/CLS, bundle budget, Lighthouse floors, or all shell visual states.

Relevant roles:
- All

Relevant files:
- frontend/src/lib/performance/budgets.ts
- frontend/src/app/layout.tsx
- frontend/src/components/
- design-system/
- frontend/e2e/visual.spec.ts

Before editing:
- Read this full task and every evidence/file path listed below.
- Inspect current code and tests; verify assumptions against the current branch.

Required implementation:
1. Complete the Frontend, Backend, Database, Permissions, Navigation, and Tests scope in this task.
2. Preserve current contracts where sound; replace mock-only production behavior with durable behavior.
3. Keep changes bounded to this task and its prerequisites.

Authorization requirements:
- Performance caching must vary by verified tenant/user/scope and never leak data.

Frontend requirements:
- Resolve typography/token source deliberately; normalize shell/table/form/chart primitives; remove avoidable client work and measure bundles/Core Web Vitals.
- Keep LCP/INP/CLS and per-route JS budgets stated in current project docs; add accessible chart/table alternatives.

Backend requirements:
- Optimize only measured API/read-model bottlenecks; include cache/freshness semantics without weakening scope.

Database requirements:
- Add indexes only from measured query plans and migration tests.

Testing:
- Bundle/budget checks, Lighthouse accessibility/performance floors, visual baselines, reduced-motion and representative 4G measurements.
- Run the exact verification commands listed in this task; if this task introduces backend scripts, document and run them too.

Verification commands:
- `pnpm frontend:lint`
- `pnpm frontend:typecheck`
- `pnpm frontend:test`
- `pnpm frontend:build`
- Run `pnpm --dir frontend test:e2e` when the task affects an end-to-end workflow.

Acceptance criteria:
- Runtime typography/tokens and documented source of truth agree.
- Home/public/admin and role-panel budgets are measured and enforced.
- Lighthouse accessibility ≥90 and agreed performance floors pass on representative routes.
- No cache or optimization crosses user/tenant scope.
- Visual and performance baselines are documented and green.

Constraints:
- Do not make unrelated refactors.
- Preserve existing patterns unless they are the source of the problem.
- Do not use mock data for production flows.
- Do not weaken or implement authorization only in the browser.
- Do not mark the task complete until verification succeeds.

After implementation:
- run the task verification commands
- update related audit docs when behavior changes
- change TASK-024 Status to [x] only if every acceptance criterion passes
- report changed files and exact verification results
```
