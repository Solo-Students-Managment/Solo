# Implementation Plan

> Superseded for execution detail by `AI_IMPLEMENTATION_TASKS.md`. This phase summary remains useful, but TASK-001 must run first because production currently retains mock clients when MSW is disabled.

Order is dependency-driven: do not build more screens before identity, policy and domain invariants are stable. Every task remains unchecked because this audit did not implement product features.

## Phase 1 — Critical foundations

- [ ] **P1.1 Freeze identity model** — Roles: all; Section: Auth/Membership; Files: auth contracts, capability engine, backend schema; Dependencies: none; **AC:** multi-persona + org-role + seller-capability model approved and represented in migrations.
- [ ] **P1.2 Unify permission registry** — Roles: all; Section: Roles; Files: `lib/capabilities`, role templates, route manifest; Dependencies: P1.1; **AC:** unknown keys fail CI and role×route×action tests pass.
- [ ] **P1.3 Implement server session/auth** — Roles: all; Section: Auth; Files: backend auth, frontend auth adapter; Dependencies: P1.1; **AC:** HttpOnly Secure cookies, rotation/revocation/rate limits and persona/context validation.
- [ ] **P1.4 Create Phase 1 database/migrations** — Roles: all; Section: Backend; Dependencies: P1.1; **AC:** FKs, tenant keys, uniqueness, soft-delete policy, audit/outbox and migration tests.
- [ ] **P1.5 Add policy-aware API foundation** — Roles: all; Section: Backend; Dependencies: P1.2–P1.4; **AC:** deny-by-default guards and tenant/self/child/assignment repository filters.
- [ ] **P1.6 Remove admin escalation** — Role: Admin Solo; Section: Admin; Dependencies: P1.2/P1.5; **AC:** only admin grants can reach every admin route/action, including moderation.

## Phase 2 — Role & permission completion

- [ ] **P2.1 Add membership/invitation/custom-role backend** — Owner/Manager; Files: organization/roles clients + backend; **AC:** invite→accept→role→offboard is durable/audited.
- [ ] **P2.2 Build one policy-derived navigation manifest** — All roles; Files: AppShell/OrgShell/AdminShell/routes; **AC:** menu visibility and API permission use identical keys.
- [ ] **P2.3 Replace flat shells with adaptive grouped shells** — All roles; Dependencies: P2.2; **AC:** desktop grouped sidebar, mobile ≤5 primaries, skip link, breadcrumbs, user/context menu.
- [ ] **P2.4 Add settings hubs and state routes** — All roles; **AC:** personal/org/admin settings plus forbidden/deleted/archived pages are reachable and guarded.

## Phase 3 — Missing core features

- [ ] **P3.1 Students/guardians vertical slice** — Roles: org staff/student/guardian; **AC:** create/link/activate/edit/archive and scoped self/child reads.
- [ ] **P3.2 Courses/classes/enrollment slice** — Roles: academic staff/teachers/students; **AC:** assign teacher/enroll learner and downstream access changes atomically.
- [ ] **P3.3 Sessions/attendance slice** — **AC:** schedule/conflict/edit/cancel, roster attendance, student join and guardian absence view.
- [ ] **P3.4 Assignments/submissions/gradebook slice** — **AC:** author→submit→review→release with version history/files.
- [ ] **P3.5 Exams/attempts/evaluations slice** — **AC:** resumable timed attempt, server clock/autosave, grade/regrade/release.
- [ ] **P3.6 Tuition/billing core** — **AC:** ledger/idempotency/reconciliation and finance/payer scope.

## Phase 4 — Dashboard & navigation completion

- [ ] **P4.1 Teacher panel** — Dependencies: P3.2–P3.5; **AC:** assigned work dashboard and complete teacher nav.
- [ ] **P4.2 Student panel** — Dependencies: P3.2–P3.5; **AC:** mobile schedule/due work/submission/exam/grades.
- [ ] **P4.3 Guardian panel** — Dependencies: P3.1/P3.3–P3.6; **AC:** child context, approvals, alerts and payments.
- [ ] **P4.4 Org-role dashboards** — Owner/Manager/Academic/Finance/Support/Teacher; **AC:** relevant KPIs/tasks only.
- [ ] **P4.5 Admin and seller navigation/dashboard** — **AC:** moderation/revenue and seller lifecycle are discoverable and guarded.

## Phase 5 — Cross-role flows

- [ ] **P5.1 Event outbox + notification delivery** — Dependencies: core slices; **AC:** idempotent fan-out, unread badge, preferences and authorized deep links.
- [ ] **P5.2 Messaging authorization/realtime** — **AC:** only valid relationships can initiate/read threads; retry/offline states work.
- [ ] **P5.3 End-to-end academic journey** — **AC:** teacher/student/guardian accounts complete enrollment→class→attendance→submission/exam→grade→notification.
- [ ] **P5.4 Commerce seller/admin/buyer journey** — gated until core complete; **AC:** author→moderate→order→fulfill→settle/refund is transactional.

## Phase 6 — UI/UX completion

- [ ] **P6.1 Route loading/error/empty/offline states** — all primary routes; **AC:** retry/recovery works and no blank states.
- [ ] **P6.2 Forms/destructive-action audit** — **AC:** server + client validation, focus/error summary, idempotent submit, confirm/undo/audit.
- [ ] **P6.3 Responsive and accessibility pass** — **AC:** 375/768/1024/1440, keyboard/screen reader, WCAG 2.1 AA, Lighthouse a11y ≥90.
- [ ] **P6.4 Design-system reconciliation** — **AC:** typography/tokens/source-of-truth documented and visual baselines approved.

## Phase 7 — Testing, performance & cleanup

- [ ] **P7.1 Security suite** — cross-role/direct-URL/API/tenant/object tests; **AC:** no escalation or IDOR findings.
- [ ] **P7.2 Contract/integration/E2E suite** — replace mock-only confidence with database-backed journeys.
- [ ] **P7.3 Performance gates** — Primary: mobile-4G + desktop; **AC:** p75 LCP public ≤2000ms, app home ≤2500ms, admin ≤3000ms; INP ≤200ms; CLS ≤0.1; route JS budgets 150/180/220 KB gzip; Lighthouse perf ≥80.
- [ ] **P7.4 Quality cleanup** — fix four hook warnings, Knip config hints, orphan routes/components and stale docs; **AC:** lint/typecheck/tests/knip/build clean.
- [ ] **P7.5 Production readiness review** — rollback, backups, observability, privacy retention and incident runbooks; **AC:** signed release checklist and disaster-recovery exercise.
