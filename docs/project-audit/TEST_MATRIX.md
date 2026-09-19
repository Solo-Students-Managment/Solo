# Test Matrix

Baseline: Vitest completed with 175 files / 287 tests passing; typecheck passed. These primarily validate mock clients and UI slices. Playwright completed 129 tests in 32.7 minutes: **61 passed and 68 failed**. Failures include genuine assertions plus many later timeouts, `ERR_ABORTED`, and detached-frame/server-instability symptoms; TASK-023 requires isolated reproduction before attributing each failure to product code. There is no backend integration or database test project.

| Workflow | Unit | Integration | E2E | Permission negative path | Error path | Missing coverage | Task |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Login, refresh, logout, persona/context switch | Mock client tests | None | Mock auth smoke | No server grant/escalation test | Partial client validation | Cookie rotation, replay, revoked grant, fixation | TASK-003 |
| Production client bootstrap | Env/unit partial | None | None | N/A | Silent mock fallback | Production build must use HTTP or fail closed; no mock state | TASK-001 |
| Role/permission registry | Capability unit tests | None | UI gates only | No route/action/API matrix | Unknown key behavior incomplete | One registry and parity tests | TASK-004 |
| Cross-tenant/self/child/assigned scope | None authoritative | None | None | Missing | Missing | 403/404 non-disclosure across every repository | TASK-005 |
| Admin users/moderation/actions | UI/mock tests | None | Some admin smoke | Non-admin direct API absent | Mock only | Admin-only server tests and audit event assertions | TASK-006 |
| Invite → accept → role → offboard | Mock slices | None | Partial pages | Missing | Partial | Transactional lifecycle, last-owner invariant | TASK-007 |
| Create student → link guardian | Mock slices | None | Partial staff flow | Missing unrelated guardian test | Partial | Activation, uniqueness, linked-child projection | TASK-008 |
| Course/class → assign teacher → enroll | Mock slices | None | Staff-only mock | Missing unassigned/unenrolled tests | Partial | Transaction and state-transition integration | TASK-009 |
| Schedule session → attendance → correction | Mock slices | None | Mock org tests | Missing assignment/roster tests | Partial | Concurrency, cancel/edit, audit | TASK-010 |
| Publish assignment → submit → review → release grade | Mock service tests | None | No three-role journey | Missing cross-student test | Partial | Full teacher/student/guardian handoff | TASK-011 |
| Publish exam → timed attempt → grade/release | Mock service tests | None | No consumer journey | Missing attempt ownership/publish tests | Partial | Resume/timeout/idempotent submit/release | TASK-012 |
| Domain event → notification/message/deep link | Mock tests | None | Static center only | Missing recipient/thread tests | Retry absent | Outbox dedupe, delivery retry, unread badge | TASK-013 |
| Charge → payment/webhook → ledger/reconcile | Mock tests | None | Mock billing tests | Missing payer/finance boundaries | Provider errors absent | Duplicate webhook/command and reconciliation | TASK-014 |
| Seller author → admin moderate → buyer order → fulfill/payout | Mock slices | None | Disconnected smoke tests | Missing seller/buyer ownership | Partial | Multi-account transaction journey | TASK-015 |
| Navigation parity by role/device | Component partial | None | Many route smokes | No policy parity | Dead-link coverage absent | Role snapshots, active state, mobile overflow | TASK-016 |
| Dashboards and authoritative reports | UI tests | None | Smoke tests | Scope absent | Loading/error uneven | Aggregate reconciliation and source labels | TASK-017–TASK-020 |
| Route resilience/accessibility | Component partial | None | Axe suite currently observed failing | N/A | Route boundaries absent | 375/768/1024/1440, keyboard, reduced motion, retries | TASK-022 |
| Full verification/build | Vitest pass | No backend suite | In progress/failing observations | N/A | N/A | Isolated build rerun; E2E failure triage; CI gates | TASK-023 |

## Current verification record

| Command | Result |
| --- | --- |
| `pnpm frontend:typecheck` | PASS |
| `pnpm frontend:test` | PASS — 175 files, 287 tests |
| `pnpm frontend:lint` | PASS with 4 hook-dependency warnings |
| `pnpm --dir frontend knip` | Exit 0 with 24 configuration hints |
| `pnpm frontend:build` | PASS in isolation; first overlapping run was invalid. Four hook warnings remain. |
| `pnpm --dir frontend test:e2e` | FAIL — 61 passed, 68 failed, 32.7m; mixed assertion and dev-server/timeout failures |
