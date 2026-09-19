# Gap Report

Audit snapshot: 2026-09-19. Acceptance criteria below are testable; “backend” always includes server-side authorization, not merely a client check.

## P0 — Critical

### G-000 — Production bootstrap silently retains mock clients

- **Problem / role / section:** Every role; runtime/API bootstrap.
- **Current behavior:** `MswBootstrap` registers HTTP clients only after MSW starts. `canEnableMocks()` is false in production, so production marks itself ready while module-level in-memory clients remain active; MSW boot failure also silently falls back.
- **Expected behavior:** production registers real HTTP clients before rendering and fails closed with an explicit configuration/service error. Mocks are opt-in, non-production, and visibly labeled.
- **Evidence:** `frontend/src/app/providers.tsx:369-507`; `frontend/src/config/env.ts:82-87`.
- **Dependencies:** none.
- **Acceptance criteria:** production cannot invoke a mock client; missing/unreachable API never produces believable demo state; environment branch tests and isolated build pass.

### G-001 — No production backend/database/authz

- **Problem / role / section:** Every role; Backend & Database.
- **Current behavior:** 112 service modules define typed HTTP contracts but default to in-memory clients; zero `route.ts` handlers exist; `/backend` is a README; no Prisma/SQL schema.
- **Expected behavior:** Durable transactional APIs and PostgreSQL with tenant/row/object authorization.
- **Changes:** Frontend—switch clients feature-by-feature; Backend—session, policy, Phase 1 modules; Database—migrations/FKs/uniqueness/audit/outbox; Permission—deny-by-default server checks.
- **Dependencies:** Final identity/domain/capability contracts.
- **Acceptance criteria:** Restart-safe data; unauthorized direct API/URL tests fail; contract/integration tests pass; no browser-supplied tenant/user ID is trusted.

### G-002 — Admin privilege escalation

- **Problem / role / section:** Teacher/Organization/Admin Solo; Admin Platform.
- **Current behavior:** Most admin views gate on client-side `students.manage`, held by teacher and organization personas; moderation only checks session.
- **Expected behavior:** `admin.*` server capabilities bound only to verified Admin Solo grants.
- **Changes:** Frontend—replace gates/nav; Backend—admin guard and audited commands; Database—admin grant/audit records; Permission—remove transitive access.
- **Dependencies:** G-001/G-003.
- **Acceptance criteria:** Every non-admin direct URL/API request receives 403; moderation included; privileged actions create immutable audit events.

### G-003 — Two incompatible permission systems

- **Problem / role / section:** All organization roles; Membership & Roles.
- **Current behavior:** effective engine has 15 keys while role templates emit unrelated keys such as `courses.manage` and `tasks.manage`.
- **Expected behavior:** One versioned permission registry used by templates, backend policies, UI actions and menus.
- **Changes:** Frontend—route/action manifest; Backend—policy evaluator; Database—roles/grants; Permission—migration map and deny unknown keys.
- **Dependencies:** Identity model decision.
- **Acceptance criteria:** No unknown permission strings; matrix tests cover every role × route × action; nav visibility matches API authorization.

### G-004 — Tenant/self/child/assignment scoping absent

- **Problem / role / section:** Teachers, students, guardians, org roles; all academic data.
- **Current behavior:** mock lists are at best organization-scoped; no membership/class/self/guardian predicates.
- **Expected behavior:** every query is scoped by server-derived actor, tenant, assignments and relationships.
- **Changes:** Frontend—remove arbitrary IDs as authority; Backend—policy-aware repositories; Database—membership/enrollment/teacher/guardian relations and constraints.
- **Dependencies:** G-001/G-003.
- **Acceptance criteria:** cross-tenant, other-student and unrelated-child tests return 404/403 with no data leakage.

### G-005 — Insecure persona/context switching

- **Problem / role / section:** All personas; Auth & Identity.
- **Current behavior:** mock `switchPersona` accepts any persona enum; context is held in memory.
- **Expected behavior:** server validates active persona/context against grants/membership and rotates signed session claims.
- **Changes:** Frontend—display only available grants; Backend—secure cookie/session switch endpoint; Database—persona grants/memberships/session audit.
- **Dependencies:** G-001.
- **Acceptance criteria:** ungranted persona/tenant switch rejected; session fixation tests pass; switch is audited.

## P1 — High

### G-006 — Teacher daily panel missing

- **Problem / role / section:** Teacher; panels/core academic.
- **Current behavior:** four teacher routes and three mock counters; academic work is hidden in org consoles.
- **Expected behavior:** assigned classes/students, sessions, attendance, assignments, grading, exams, resources, calendar/messages.
- **Changes:** Frontend—teacher shell/routes; Backend—assigned-scope queries/commands; Database—teacher assignments; Permission—`*.assigned.*`.
- **Dependencies:** G-001–G-004.
- **Acceptance criteria:** teacher completes session → attendance → assignment/review/grade for an assigned class and cannot access another class.

### G-007 — Student learning panel missing

- **Problem / role / section:** Student; assignments/exams/schedule.
- **Current behavior:** dashboard/activation/portfolio only.
- **Expected behavior:** schedule/join, submission, timed attempt, grades/progress/resources/messages.
- **Changes:** all layers for self-scoped consumer routes.
- **Dependencies:** G-001/G-004 and academic APIs.
- **Acceptance criteria:** enrolled student completes a submission and resumable timed attempt; released results are visible only when allowed.

### G-008 — Guardian panel and approvals missing

- **Problem / role / section:** Guardian; relationships/notifications/tuition.
- **Current behavior:** relationship counters with no child-scoped pages.
- **Expected behavior:** child switcher, progress/attendance/homework approval/results/messages/payments.
- **Changes:** all layers for durable relationships, consent and child projections.
- **Dependencies:** G-004/G-009.
- **Acceptance criteria:** guardian sees only linked children and can approve a task with an auditable result.

### G-009 — Notifications are static and disconnected

- **Problem / role / section:** All; Messaging & Notifications.
- **Current behavior:** one seeded notification; bell is nonfunctional; no unread/event fan-out.
- **Expected behavior:** domain event → authorized notification → unread badge → valid deep link.
- **Changes:** Frontend—badge/center/deep links; Backend—outbox/workers/retries; Database—notifications/deliveries/preferences.
- **Dependencies:** G-001/G-004.
- **Acceptance criteria:** assignment, grade, absence, schedule and payment events deliver once to correct actors and link to authorized pages.

### G-010 — Organization navigation is role-blind

- **Problem / role / section:** All org roles; Navigation.
- **Current behavior:** ~60 ungrouped links for every role; mobile horizontal scroller; Settings has no route.
- **Expected behavior:** grouped policy-derived nav and role dashboards.
- **Changes:** Frontend—manifest/adaptive shell/settings; Backend—session capability payload; Database—grants.
- **Dependencies:** G-003.
- **Acceptance criteria:** role snapshots show only allowed groups; all links resolve; mobile has ≤5 primary destinations; direct URL decisions match nav.

### G-011 — Core cross-role education flows are broken

- **Problem / role / section:** Teacher ↔ Student ↔ Guardian; core academic.
- **Current behavior:** staff mock authoring has no student/guardian consumer side.
- **Expected behavior:** enroll → schedule → attend → submit/attempt → review/grade → publish → notify/view.
- **Changes:** vertical slices across all layers; transactional release/outbox.
- **Dependencies:** G-001/G-004/G-006–G-009.
- **Acceptance criteria:** full Playwright journey succeeds with three accounts and data visibility assertions at every transition.

### G-012 — Financial flows are non-transactional mocks

- **Problem / role / section:** Owner/Finance/Guardian/Seller/Admin; Tuition & Billing.
- **Current behavior:** checkout/invoice/tuition/balance screens mutate memory.
- **Expected behavior:** immutable ledger, idempotent payment/webhook/refund/dunning and scoped payer views.
- **Changes:** Backend/database/payment integration plus finance/payer panels and `billing.*`/`tuition.*` policies.
- **Dependencies:** G-001/G-003.
- **Acceptance criteria:** duplicate commands/webhooks do not duplicate money; totals reconcile; unauthorized financial fields never render/return.

## P2 — Medium

### G-013 — Route-level resilience and deep-state pages missing

- **Problem / role / section:** All; Routing.
- **Current behavior:** no nested layouts, `loading.tsx`, `error.tsx` or middleware; three declared state routes are missing.
- **Expected behavior:** route-level loading/error boundaries and consistent forbidden/deleted/archived handling.
- **Dependencies:** shell and server auth.
- **Acceptance criteria:** every primary route handles loading, offline, 4xx/5xx and retry without blank/broken UI.

### G-014 — CRUD and form completeness varies

- **Problem / role / section:** Org/admin/seller; multiple entities.
- **Current behavior:** many create/list/status mocks lack edit/delete/archive/restore, pagination, duplicate-submit protection or stable IDs.
- **Expected behavior:** lifecycle-specific CRUD with Zod + server validation, confirmations/undo and accessible feedback.
- **Dependencies:** real APIs/schema.
- **Acceptance criteria:** entity matrices are satisfied; double submit is idempotent; error focuses the first invalid field; destructive actions are confirmed/audited.

### G-015 — Reporting and exports are not authoritative

- **Problem / role / section:** Admin/org/teacher/finance; Reports.
- **Current behavior:** seeded KPIs and mock exports can look real.
- **Expected behavior:** scoped aggregates, freshness/source labels, background export and accessible table alternative.
- **Acceptance criteria:** report totals reconcile to source data, exports honor scope/filters and charts have keyboard/text equivalents.

## P3 — Polish

### G-016 — Accessibility/navigation polish

- **Problem:** no skip links/breadcrumbs/route focus; inconsistent deep-page chrome; chart/table keyboard coverage incomplete.
- **Expected behavior:** WCAG 2.1 AA with 44px targets, visible focus, semantic status, reduced motion and responsive checks at 375/768/1024/1440.
- **Acceptance criteria:** Lighthouse a11y ≥90, axe has no serious/critical issues, keyboard journeys pass.

### G-017 — Design-system drift and quality warnings

- **Problem:** design master specifies Poppins/Open Sans while app uses Source Sans/Vazirmatn; lint reports four missing React-hook dependencies; Knip has 24 stale config hints.
- **Expected behavior:** one documented typography/token source, zero lint warnings and maintained dead-code checks.
- **Acceptance criteria:** design decision recorded; lint/typecheck/tests/knip clean; visual regression baselines cover each shell.
