# Project Completeness Audit

**Product:** Solo — general education / student-management platform  
**Audit date:** 2026-09-19  
**Codebase snapshot:** `/frontend` (Next.js App Router) is the only implemented product surface. `/backend` is a placeholder README. `/legacy` is a frozen Vite prototype and is not product.

## How completeness was judged

A feature is **Complete** only if all of these are true:

1. UI exists  
2. Route is correct  
3. Permission is correct (frontend **and** backend)  
4. Real API exists  
5. Real database integration exists  
6. Validation exists  
7. Error handling exists  
8. Loading state exists  
9. Empty state exists  
10. Responsive behavior exists  
11. End-to-end flow works  
12. The intended role can actually use it from their panel

**Result:** no user-facing feature meets Complete. Typed HTTP clients exist as contracts, but there are zero Next.js API route handlers and every service defaults to an in-memory mock (`createMock*Client`). Local mock mode swaps clients to HTTP only after MSW starts; production disables MSW and currently leaves the in-memory defaults registered. There is no NestJS server, Prisma schema, PostgreSQL, HttpOnly session, or server authorization.

Status key used below:

| Symbol | Meaning |
| ------ | ------- |
| 🟡 Partial | Frontend slice exists (often with loading/empty/error + mock client) but is not production-complete |
| 🔴 Missing | Required by PRD / role / identity model, and not implemented as a usable panel flow |
| ⚠️ Problem | Exists, but permission, navigation, scope, or wiring is wrong |

Frontend-first context from `docs/frontend/PROJECT_CONTEXT.md`: real backend, database, authorization, payments, WebSockets, and storage remain out of scope until a backend phase. This audit still reports those as production blockers because the user’s completeness bar requires them.

## Product identity vs what was built

| Layer | Intended | Actual |
| ----- | -------- | ------ |
| Product | Education platform for teachers, students, guardians, organizations, and platform admin | Frontend-only mock platform spanning Phase 0–6 UI slices |
| Identity | One User, many personas; seller is a capability | Personas exist in auth schema; seller has personal routes; persona switcher is mock |
| Auth | Phone + OTP, future HttpOnly cookies | In-memory mock; login password `Password1`; OTP `123456`; default persona `teacher` |
| Panels | Role-specific shells and dashboards | Three shells: generic `AppShell`, unfiltered `OrgShell` (~70 items), `AdminShell` |
| Academic work | Teacher / student / parent daily product | Almost all academic CRUD lives under `/org/[orgId]/…`, not under `/teacher`, `/student`, `/guardian` |
| Data | PostgreSQL + Prisma | None. `docs/new/database-design.md` is a sketch that does not match the frontend identity model |

## Inventory counts

| Item | Count | Notes |
| ---- | ----: | ----- |
| Personas (auth) | 5 | `student`, `guardian`, `teacher`, `organization`, `admin_solo` |
| Org role templates | 6 + custom | `owner`, `manager`, `academic_manager`, `teacher`, `finance`, `support_staff`, `custom` |
| Seller | capability, not a persona | Personal seller routes exist |
| `page.tsx` files | 137 | Canonical UI inventory |
| Typed service clients | 111+ | Almost all default to mock |
| Implemented API route handlers | 0 | Contract URLs are intercepted by MSW locally; no deployed API lives in this repo |
| Nested `layout.tsx` | 0 | Only root `src/app/layout.tsx` |
| `loading.tsx` / `error.tsx` | 0 | Next.js App Router conventions unused |
| `middleware.ts` | 0 | No server route protection |
| Prisma / SQL schema | 0 | Backend placeholder only |

### Pages by surface

| Surface | Pages | Status |
| ------- | ----: | ------ |
| Organization `/org/...` | 62 | 🟡 Partial mock CRUD, ⚠️ one flat nav for every org role |
| Personal `/personal/...` | 33 | 🟡 Partial; ⚠️ most pages not in sidebar |
| Admin `/admin/...` | 11 | 🟡 Partial; ⚠️ gated with `students.manage` not `nav.admin` |
| Public | 12 | 🟡 Partial marketplace/discovery mocks |
| Auth | 5 | 🟡 Partial mock auth |
| Teacher `/teacher/...` | 4 | 🔴 Core teaching panel missing |
| Student `/student/...` | 3 | 🔴 Core student panel missing |
| Guardian `/guardian/...` | 2 | 🔴 Core parent panel missing |
| Dev | 3 | Internal |
| Global home `/` | 1 | 🟡 Persona/context switcher |
| State pages | 1 of 4 | ⚠️ `forbidden` / `deleted` / `archived` routes have no pages |

---

## Roles

| Role | Dashboard | Navigation | Pages | Permissions | Backend | Overall |
| ---- | --------- | ---------- | ----- | ----------- | ------- | ------- |
| Admin Solo (`admin_solo`) | 🟡 Partial KPIs | 🟡 AdminShell (marketplace missing) | 🟡 11 pages | ⚠️ Uses `students.manage`; `nav.admin` unused | 🔴 None | ⚠️ Problem |
| Teacher persona | 🟡 3 counters | 🔴 Generic AppShell | 🔴 4 pages, no academic work | ⚠️ Has `students.manage`; can open org/admin URLs | 🔴 None | 🔴 Missing panel |
| Student persona | 🟡 3 counters | 🔴 Generic AppShell | 🔴 Dashboard + activate + portfolio | 🟡 `nav.student` on dashboard only | 🔴 None | 🔴 Missing panel |
| Guardian persona | 🟡 3 counters | 🔴 Generic AppShell | 🔴 Dashboard + activate | 🟡 `nav.guardian` on dashboard only | 🔴 None | 🔴 Missing panel |
| Organization persona | 🟡 3 org stats | ⚠️ 70-item ungrouped OrgShell | 🟡 62 org pages | ⚠️ Most pages use `students.manage` | 🔴 None | ⚠️ Problem |
| Org Owner | 🟡 Same as org | ⚠️ Sees every menu | 🟡 Same pages | 🟡 Broadest org capabilities | 🔴 None | ⚠️ Problem |
| Org Manager | 🔴 No distinct panel | ⚠️ Sees every menu | 🟡 Same pages | 🟡 Members + students; no billing capability | 🔴 None | ⚠️ Problem |
| Academic Manager | 🔴 No distinct panel | ⚠️ Sees every menu | 🟡 Same pages | 🟡 `students.manage` only | 🔴 None | ⚠️ Problem |
| Org Teacher role | 🔴 No distinct panel | ⚠️ Sees every menu | ⚠️ Pages then 403 on `students.manage` | 🔴 Academic caps missing from engine | 🔴 None | ⚠️ Problem |
| Finance | 🔴 No distinct panel | ⚠️ Sees every menu | 🟡 Billing pages work if capability used | 🟡 `billing.manage` | 🔴 None | ⚠️ Problem |
| Support Staff | 🔴 No distinct panel | ⚠️ Sees every menu | ⚠️ Academic pages 403 | 🟡 Directory/members view only | 🔴 None | ⚠️ Problem |
| Seller (capability) | 🔴 No seller home KPIs | 🔴 Not in AppShell | 🟡 Personal seller routes | 🔴 No seller capability in engine | 🔴 None | 🟡 Partial |

---

## Sections

| Section | UI | API | DB | Permissions | Flow | Status |
| ------- | -- | --- | -- | ----------- | ---- | ------ |
| Auth / session | 🟡 | 🟡 mock | 🔴 | ⚠️ persona switch unrestricted | 🟡 login works in mock | ⚠️ Problem |
| Identity / personas | 🟡 | 🟡 mock | 🔴 | ⚠️ no activation gate on switch | 🟡 activate forms exist | 🟡 Partial |
| App shells / navigation | ⚠️ | — | — | 🔴 nav not capability-filtered | 🔴 role panels unusable | ⚠️ Problem |
| Students | 🟡 org list/create/detail | 🟡 mock list/create/link guardian | 🔴 | ⚠️ `students.manage` too broad | 🟡 org-only | 🟡 Partial |
| Subjects | 🟡 org | 🟡 mock | 🔴 | ⚠️ `students.manage` | 🟡 | 🟡 Partial |
| Courses / classes | 🟡 org create/clone/class | 🟡 mock; no update/delete | 🔴 | ⚠️ `students.manage` | 🟡 | 🟡 Partial |
| Enrollments | 🟡 org | 🟡 mock create/status/transfer | 🔴 | ⚠️ `students.manage` | 🟡 | 🟡 Partial |
| Sessions | 🟡 org list/create/detail | 🟡 mock; no cancel/edit | 🔴 | ⚠️ `students.manage` | 🟡 | 🟡 Partial |
| Attendance | 🟡 org mark by typed name | 🟡 mock on sessions client | 🔴 | ⚠️ `students.manage` | ⚠️ not roster-based | 🟡 Partial |
| Assignments | 🟡 org staff console | 🟡 mock create/submit | 🔴 | ⚠️ `students.manage` | 🔴 student/parent sides missing | ⚠️ Problem |
| Gradebook | 🟡 org upsert by name | 🟡 mock | 🔴 | ⚠️ `students.manage` | 🔴 student/parent view missing | 🟡 Partial |
| Exams | 🟡 org create/publish/grade | 🟡 mock; `exams.publish` unused | 🔴 | ⚠️ `students.manage` | 🔴 student take-exam missing | ⚠️ Problem |
| Evaluations | 🟡 org | 🟡 mock | 🔴 | ⚠️ | 🟡 | 🟡 Partial |
| Question bank | 🟡 org | 🟡 mock | 🔴 | ⚠️ | 🟡 | 🟡 Partial |
| Curriculum / lesson plans | 🟡 org + teacher/plans | 🟡 mock | 🔴 | ⚠️ | 🟡 | 🟡 Partial |
| Tuition | 🟡 org record | 🟡 mock | 🔴 | ⚠️ `students.manage` | 🔴 parent payment missing | 🟡 Partial |
| Billing / plans | 🟡 org billing pages | 🟡 mock | 🔴 | 🟡 `billing.manage` | 🟡 | 🟡 Partial |
| Members / roles | 🟡 org | 🟡 mock | 🔴 | 🟡 org.* caps | ⚠️ templates ≠ engine | ⚠️ Problem |
| HR / ops (shifts, leave, …) | 🟡 org | 🟡 mock | 🔴 | ⚠️ `students.manage` | 🟡 | 🟡 Partial |
| Messaging | 🟡 personal inbox | 🟡 mock | 🔴 | 🔴 not in AppShell | 🔴 no role targeting | 🟡 Partial |
| Chat | 🟡 personal | 🟡 mock | 🔴 | 🔴 not in AppShell | 🔴 | 🟡 Partial |
| Notifications | 🟡 personal list + prefs | 🟡 one seeded mock | 🔴 | ⚠️ header bell not wired | 🔴 no event fan-out | ⚠️ Problem |
| Calendar / search | 🟡 personal | 🟡 mock | 🔴 | 🔴 not in AppShell | 🟡 | 🟡 Partial |
| Reports / analytics | 🟡 org | 🟡 mock export | 🔴 | ⚠️ | 🟡 | 🟡 Partial |
| Admin platform | 🟡 11 pages | 🟡 mock | 🔴 | ⚠️ `students.manage` | 🟡 | ⚠️ Problem |
| Marketplace | 🟡 public + seller + admin | 🟡 mock | 🔴 | ⚠️ admin page off-nav | 🟡 | 🟡 Partial |
| Settings / profile | 🟡 personal security/phone/profile | 🟡 mock | 🔴 | 🟡 account.* | 🔴 org settings is a label | 🟡 Partial |
| Public discovery | 🟡 catalog/discover/articles | 🟡 mock | 🔴 | public | 🟡 | 🟡 Partial |
| Files / resources | 🟡 org resources + admin storage | 🟡 mock | 🔴 | ⚠️ | 🟡 | 🟡 Partial |
| Backend / database | 🔴 placeholder | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 Missing |

---

## Major Missing Features

These are required for the product described in `docs/Solo-PRD-Complete-en.md` and `docs/frontend/PROJECT_CONTEXT.md`, and are not usable today from the correct role panel.

1. **Role-specific navigation** for Teacher, Student, Guardian, and each org role.
2. **Teacher daily panel:** students, classes, sessions, attendance, homework review, exams, calendar, parent messaging — from `/teacher`, not only `/org`.
3. **Student daily panel:** schedule, join session, submit homework, take exam, grades, files, chat.
4. **Guardian daily panel:** child switcher, progress, attendance, homework status, exam results, chat, payments.
5. **Real backend, Prisma schema, and server authorization.**
6. **Data scoping** (teacher sees assigned classes; student sees self; guardian sees linked children).
7. **Notification fan-out** from academic events (assignment published, grade released, attendance issue, session reminder).
8. **Homework approval / parent visibility** (PRD Parents).
9. **Student exam attempt UI** (timed, anti-cheat as specified).
10. **Org role–filtered menus** (finance must not see academic CRUD; teacher must not see billing).
11. **Nested App Router layouts**, `loading.tsx`, `error.tsx`, and middleware.
12. **Production auth** (HttpOnly cookies, no unrestricted `switchPersona`).
13. **Org settings page** (`OrgShell` renders Settings as a non-link `<span>`).
14. State pages `/state/forbidden`, `/state/deleted`, `/state/archived`.
15. Student/guardian/admin links in `AppShell`; Search and Alerts currently point at login and not-found.

---

## Major Partial Features

Frontend slices that exist as mock CRUD under `/org/[orgId]` (and some personal/admin/public routes):

- Organization create, members, branches, facilities, departments, positions, directory, roles, policies
- Students list/create/detail + link guardian (no edit/delete/archive)
- Subjects, courses/terms/classes, enrollments, sessions, attendance, assignments, gradebook, exams, evaluations, question bank, curriculum, lesson plans, tuition, resources, reports
- Org HR: shifts, leave, staff attendance, employee documents, onboarding, offboarding, approvals, tasks
- Org billing: pricing, subscription, plan change, invoices, usage, add-ons, coupons, checkout, tax invoices, cancellation, plan versions, manual billing
- Personal: security, phone, profile, messages, chat, notifications, calendar, search, seller, AI stubs, PWA/security hardening stubs
- Admin: dashboard KPIs, users restrict, support, verification, audit, announcements, incidents, privacy, feature flags, storage, marketplace moderation
- Auth: login, signup, OTP, reset, recover
- Public: discover, catalog, trials, reviews, articles, cart, orders, promos, public profiles/forms

These are **not Complete**: mock persistence, weak or wrong permission keys, missing update/delete on many entities, and no cross-role consumer UI.

---

## Broken Flows

| Flow | Status | Why |
| ---- | ------ | --- |
| Teacher registers student → student logs in → sees class | 🔴 | Student panel has no class/homework/exam pages; org student create does not activate student persona or send login link |
| Teacher creates assignment → student submits → teacher reviews → parent sees | 🔴 | Submit exists on org staff console by typing a student name; no student or parent surfaces |
| Teacher publishes exam → student takes exam → grade → parent sees | 🔴 | Org exam console only; no `/student` attempt route |
| Teacher marks attendance → parent notified | 🔴 | Attendance is org-only; notifications are a static mock row |
| Guardian views children and switches | 🟡/🔴 | Dashboard lists relationships if mock returns them; no child-scoped pages |
| Create org → role-appropriate sidebar | ⚠️ | Org is created; every role sees the same 70-item sidebar |
| Login → Teacher shell | ⚠️ | Lands as teacher; sidebar still shows Home / Teacher / Organization(`demo`) |
| Open `/admin` as teacher | ⚠️ Broken authz | Admin views check `students.manage`, which teachers have |
| Header bell / search | ⚠️ | Buttons have no navigation; mobile Search → login; Alerts → not-found |
| `switchPersona('admin_solo')` | ⚠️ | Mock allows any persona with no allowlist |

---

## Permission Problems

1. **No server authorization.** All checks are `resolveCapability()` in client components.
2. **Admin surface uses `students.manage`**, not `nav.admin`. Teacher and organization personas both have `students.manage`.
3. **Capability vocabulary is too small** (14 keys). Academic, HR, reports, marketplace, and seller actions are not first-class capabilities. Most org pages reuse `students.manage`.
4. **`exams.publish` is defined and never used.** Exam publish is gated like student CRUD.
5. **Org role templates** in `services/roles/client.ts` (`org.manage`, `courses.view`, `gradebook.manage`, `tuition.manage`, …) **do not match** `lib/capabilities/engine.ts`.
6. **OrgShell does not filter by `session.orgRole`.** Finance sees Exams; support staff sees Billing in the menu (page may 403 later).
7. **No tenant membership check** on org pages beyond fetching `get(orgId)` from a shared mock map.
8. **`switchPersona` has no server or client allowlist.**
9. **Data scope is not implemented.** Mock lists are per `organizationId` only, not per teacher/class/child.
10. **URL bypass:** dashboards that check `nav.*` show forbidden; almost all `/org/...` and `/admin/...` pages that check `students.manage` do not.

---

## UI/Layout Problems

Evidence aligned with UI/UX Pro Max navigation and density rules (sticky nav, active state, bottom-nav limit ≤5, empty states, skip links, breadcrumbs for 3+ levels).

| Issue | Evidence |
| ----- | -------- |
| Generic shell for three personas | `AppShell` used by teacher, student, guardian, personal, messaging, notifications |
| Hardcoded org id `demo` | `AppShell` DESKTOP_NAV |
| Dead mobile items | Search → `/auth/login`, Alerts → `/state/not-found` |
| Bell/search not wired | Header icon buttons have no `href` |
| No skip link | OrgShell with ~70 links is a keyboard trap |
| No breadcrumbs | Deep org routes (`students/[id]`, `sessions/[id]`) |
| Org nav not grouped | Flat list: HR + billing + academic mixed |
| Org mobile nav | Horizontal chip scroller of every item (violates bottom-nav ≤5) |
| Admin has no mobile nav | `hidden md:block` sidebar only |
| Active state missing | AppShell links have no active class |
| Settings is not a route | OrgShell `<span>Settings</span>` |
| No page title/chrome consistency | Each view invents its own header |
| No `loading.tsx` / `error.tsx` | Route-level states missing |
| Design tokens vs MASTER.md | Product uses `next/font` Source Sans + Vazirmatn; design-system MASTER still lists Poppins + Open Sans |
| Attendance/gradebook forms | Free-text student name instead of roster select |
| Org dashboard | Trial/branches/members only — no academic or task widgets |

---

## Backend Problems

- `/backend/README.md` states the NestJS API is not implemented.
- HTTP client helpers (`apiRequest`) and `createHttp*Client` factories are installed only after MSW starts. When production disables MSW, bootstrap currently leaves module-level mock clients active; production must install HTTP clients explicitly and fail closed.
- No REST versioning, rate limiting, idempotency, or consistent error envelope in a running server.
- Realtime client exists as a frontend contract only.
- Payments, SMS, storage, and WebSockets are UI/mocks only.

---

## Database Problems

- No Prisma schema, no migrations, no UUID PKs, no FKs.
- `docs/new/database-design.md` models a single `User.role` enum (`teacher \| student \| parent \| admin`) which **contradicts** the implemented multi-persona + org-role model.
- Missing entities implied by the UI: Organization, Membership, Branch, Course, Class, Enrollment, Session, Attendance, Assignment, Submission, Exam, Attempt, Grade, Tuition, Notification, DeviceSession, FeatureFlag, etc.
- No uniqueness, soft delete, or tenant isolation constraints because there is no database.

---

## Technical Debt

- Duplicate role enums: `services/auth/client.ts` `orgRoleSchema` and `services/organization/members.ts` `orgRoleSchema`.
- Two permission sources: capability engine vs role-template permission strings.
- Service modules initialize getters with mock clients. Local MSW bootstrap replaces them with HTTP clients; production currently does not. This silent environment-dependent wiring is a P0 release blocker.
- Phase 3–6 slices (HR, marketplace, AI, gamification, collab) landed in the same app shell as Phase 1 core, inflating org navigation before core role panels exist.
- E2E coverage exists for many org mock slices; it does not prove cross-role academic journeys.
- `console` / TODO search in `/frontend/src` did not yield a large TODO/FIXME set; incompleteness is structural, not leftover comments.

---

## Frontend assumptions (senior-frontend)

| Assumption | Value used for this audit |
| ---------- | ------------------------- |
| Primary device + network | Mobile-first education SaaS; mixed mobile-4G and desktop (AppShell has bottom nav) |
| LCP targets | `/` 2500ms, public SEO 2000ms, `/admin` 3000ms (`docs/frontend/performance-budgets.md`) |
| SEO vs auth-walled | Public catalog/profiles are SEO-dependent; panels are auth-walled |
| WCAG | PRD states WCAG 2.1 AA; no named a11y owner in repo |
| Bundle budget | Route JS budgets in `frontend/src/lib/performance/budgets.ts` (home 180 KB, public 150 KB, admin 220 KB) |

Verifiable CI gates for a later frontend completion pass: LCP/INP/CLS p75 on mobile-4G, per-route gzip JS budget, Lighthouse a11y ≥90 and perf ≥80 on primary routes. Not measured in this audit.

---

## Related documents

- [GAP_REPORT.md](./GAP_REPORT.md)
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- [FEATURE_MATRIX.md](./FEATURE_MATRIX.md)
- [ROUTES_MATRIX.md](./ROUTES_MATRIX.md)
- [PANEL_STRUCTURE.md](./PANEL_STRUCTURE.md)
- Roles: [roles/](./roles/)
- Sections: [sections/](./sections/)

---

## Final audit summary

| Measure | Result |
| --- | ---: |
| Persona contexts | 5 (`student`, `guardian`, `teacher`, `organization`, `admin_solo`) |
| Organization role templates | 6 (`owner`, `manager`, `academic_manager`, `teacher`, `finance`, `support_staff`) |
| Additional capability identity | 1 seller capability (not a role/persona) |
| Role/capability audit files | 12 |
| Major section audit files | 19 |
| Implemented `page.tsx` routes | 137 (134 product + 3 internal developer routes) |
| Complete product routes | 0 |
| Partial routes | 19 |
| Problem/off-navigation routes | 106 |
| Incomplete role-panel routes | 9 |
| Internal routes | 3 |
| Declared state routes without pages | 3 |
| Mock-backed product routes | 134 |
| P0 implementation tasks | 6 |
| P1 implementation tasks | 9 |
| P2 implementation tasks | 7 |
| P3 implementation tasks | 2 |

“Problem/off-navigation” includes 73 admin/organization routes with unsafe or inconsistent permissions and 33 personal/seller routes that are mock-backed and absent from primary navigation. Counts classify route files, not missing PRD pages; the missing teacher/student/guardian workflows are listed separately in role and panel documents.

## First 15 implementation priorities

1. Make production data-client bootstrap install HTTP clients and fail closed instead of retaining mocks.
2. Establish the backend/PostgreSQL/Prisma foundation.
3. Freeze and implement the multi-persona, organization-role and seller-capability identity/session model.
4. Replace the two conflicting permission vocabularies with one versioned registry.
5. Add deny-by-default server policy enforcement and tenant/self/child/assignment/ownership scopes.
6. Remove the `students.manage` admin escalation and secure every `/admin` action.
7. Persist organization invitations/memberships/roles/settings and custom grants.
8. Deliver students/guardians plus activation/relationship lifecycle.
9. Deliver courses/classes/enrollment with teacher assignment and downstream access.
10. Deliver sessions/attendance with roster-based marking and consumer views.
11. Deliver assignments/submissions/grade release across teacher, student and guardian.
12. Deliver exams/attempts/grading/release with a resilient timed student experience.
13. Add event outbox, notifications, messages, unread state and authorized deep links.
14. Build policy-derived, role-filtered desktop/mobile navigation and role workspaces.
15. Triage E2E failures, complete resilience/accessibility, and enforce performance/design gates.

## Production answer — what fails for each role today?

### Admin Solo

The UI has 11 mock pages, but it is not production-safe: most routes use the wrong `students.manage` gate, marketplace moderation is off-nav and session-only, revenue/system settings are incomplete, mobile admin navigation is absent, and no privileged action is persisted or server-audited.

### Teacher persona

Only dashboard/activation/plans/public-profile exist. Classes, assigned students, sessions, attendance, assignment review, gradebook, exams, resources, calendar and parent/student communication are unavailable from a teacher panel. The current broad `students.manage` grant can also expose unrelated organization/admin screens.

### Student persona

The student cannot view a real schedule, join a session, submit homework, attempt an exam, see released grades/progress/certificates, access course resources or navigate messages/notifications from the panel. Only activation, three mock counters and portfolio settings exist.

### Guardian persona

The guardian cannot open child-scoped progress, attendance, homework approvals, results, schedule, messages or tuition/payment views. Relationship counters exist, but the guardian-to-child scope is not durable or server-enforced and no academic event produces a notification.

### Organization owner

Many mock consoles exist, but nothing persists. The owner lacks a settings route, secure ownership transfer/lifecycle, real billing, authoritative reports and backend tenant enforcement. The panel is an ungrouped ~60-item list with no actionable owner dashboard.

### Organization manager

There is no manager dashboard or filtered menu. Billing, developer, lifecycle, HR and academic links are all disclosed regardless of authority; feature gates are inconsistent and there is no delegated approval boundary.

### Academic manager

Academic authoring pages exist as mocks, but the role has only `students.manage` in the effective engine while templates name capabilities the engine cannot evaluate. Publishing, cross-role release and real reporting are unusable.

### Organization teacher

The role sees every organization menu item but usually lacks `students.manage`, so academic links lead to denial; there is no assignment/class scope or teaching dashboard. It is simultaneously overexposed in navigation and under-capable in legitimate work.

### Finance

Billing mock pages exist, but several finance-adjacent routes use `students.manage`, the navigation exposes unrelated academic/HR areas, and there is no ledger, idempotency, provider integration, reconciliation or finance dashboard.

### Support staff

There is no support-staff dashboard/panel. Directory/tasks/knowledge/forms are mock slices governed by a mismatched permission vocabulary; all other organization destinations are still visible and sensitive-field scoping is absent.

### Seller capability

Seven direct seller URLs exist, but there is no seller capability in the policy engine, no seller navigation/home, no ownership checks and no connected moderation/order/fulfillment/payout lifecycle. The matching admin moderation page is also orphaned.

## Audit verification

- `pnpm test`: passed (full Vitest suite at audit time).
- `pnpm knip`: exited successfully; reported 24 configuration hints rather than unused production symbols.
- `pnpm lint`: no errors, four `react-hooks/exhaustive-deps` warnings in add-ons, checkout and teacher-plans.
- `pnpm typecheck`: passed.
- `pnpm frontend:build`: passed in isolation; an overlapping build/E2E run had produced a false `/_document` page-collection failure. Build still reports the four hook warnings.
- `pnpm --dir frontend test:e2e`: failed — 61 passed, 68 failed in 32.7 minutes. Failures mix early assertions with widespread later timeouts/`ERR_ABORTED`/detached-frame symptoms and require isolated triage.
- Build output confirms current first-load JS is above documented budgets on important routes (for example `/` 257 KB versus 180 KB and `/catalog` 221 KB versus 150 KB); tracked by TASK-024.
