# Final Recommended Panel Structure

This is the intended least-privilege tree derived from existing routes and workflows. `EXISTS` means only that a page is present. Every permission must be enforced by the server and used by the navigation manifest. Seller is a capability, not a persona.

## Admin Solo

- **Dashboard**
  - Route: `/admin`
  - Permission: `admin.dashboard.read`
  - Status: PERMISSION_RISK
  - Current availability: Mock page; browser checks `students.manage`.
  - Required work: TASK-004, TASK-006, TASK-020
- **Users & access**
  - Route: `/admin/users`
  - Permission: `admin.users.manage`
  - Status: PERMISSION_RISK
  - Current availability: Mock UI; wrong browser gate; no server.
  - Required work: TASK-006
- **Support & verification**
  - Route: `/admin/support`, `/admin/verification`
  - Permission: `admin.support.manage`, `admin.verification.manage`
  - Status: MOCKED
  - Current availability: Pages and clients exist; no durable action/audit.
  - Required work: TASK-006
- **Safety, privacy & audit**
  - Route: `/admin/audit`, `/admin/incidents`, `/admin/privacy`, `/admin/announcements`
  - Permission: corresponding `admin.*` keys
  - Status: MOCKED
  - Current availability: Pages exist; no authoritative event store.
  - Required work: TASK-006
- **Platform controls**
  - Route: `/admin/feature-flags`, `/admin/storage`
  - Permission: `admin.platform.manage`
  - Status: MOCKED
  - Current availability: Desktop sidebar only; no server changes.
  - Required work: TASK-006, TASK-016
- **Marketplace moderation**
  - Route: `/admin/marketplace-moderation`
  - Permission: `admin.marketplace.moderate`
  - Status: UNREACHABLE / PERMISSION_RISK
  - Current availability: Orphan page; any session passes its check.
  - Required work: TASK-006, TASK-015

## Teacher Persona

- **Dashboard**
  - Route: `/teacher`
  - Permission: `teacher.dashboard.read`
  - Status: PARTIAL / MOCKED
  - Current availability: Three counts and client-side `nav.teacher` check.
  - Required work: TASK-017
- **My classes & students**
  - Route: `/teacher/classes`, `/teacher/students`
  - Permission: `classes.assigned.read`, `students.assigned.read`
  - Status: MISSING
  - Current availability: Similar staff pages live only under organization routes.
  - Required work: TASK-005, TASK-009, TASK-017
- **Sessions & attendance**
  - Route: `/teacher/sessions`, `/teacher/attendance`
  - Permission: `sessions.assigned.manage`, `attendance.assigned.manage`
  - Status: MISSING
  - Current availability: Organization mock pages only.
  - Required work: TASK-010, TASK-017
- **Assignments, gradebook & exams**
  - Route: `/teacher/assignments`, `/teacher/gradebook`, `/teacher/exams`
  - Permission: assigned-scope author/grade keys; separate publish key
  - Status: MISSING
  - Current availability: Organization mock pages use `students.manage`.
  - Required work: TASK-011, TASK-012, TASK-017
- **Calendar, messages & notifications**
  - Route: `/personal/calendar`, `/personal/messages`, `/personal/notifications`
  - Permission: authenticated self plus relationship scope
  - Status: EXISTS / UNREACHABLE
  - Current availability: Mock pages are omitted from the primary shell.
  - Required work: TASK-013, TASK-016, TASK-017
- **Plans, public profile & account settings**
  - Route: `/teacher/plans`, `/teacher/public-profile`, personal profile/security
  - Permission: own account/profile
  - Status: PARTIAL / MOCKED
  - Current availability: Routes exist; production persistence is absent.
  - Required work: TASK-003, TASK-016, TASK-017

## Student

- **Dashboard**
  - Route: `/student`
  - Permission: `student.self.read`
  - Status: PARTIAL / MOCKED
  - Current availability: Counts/relationships only.
  - Required work: TASK-018
- **Schedule & classes**
  - Route: `/student/schedule`, `/student/classes`
  - Permission: `enrollment.self.read`
  - Status: MISSING
  - Current availability: No student consumer route.
  - Required work: TASK-009, TASK-010, TASK-018
- **Assignments & submissions**
  - Route: `/student/assignments`
  - Permission: `submissions.self.manage`
  - Status: MISSING
  - Current availability: Contract/mock methods exist; staff UI only.
  - Required work: TASK-011, TASK-018
- **Exams & results**
  - Route: `/student/exams`, `/student/results`
  - Permission: `attempts.self.manage`, `grades.self.read.released`
  - Status: MISSING
  - Current availability: No attempt/result page.
  - Required work: TASK-011, TASK-012, TASK-018
- **Resources, messages & notifications**
  - Route: student projections plus personal utilities
  - Permission: enrolled/self/thread-participant
  - Status: MISSING / UNREACHABLE
  - Current availability: Generic mock utilities only.
  - Required work: TASK-013, TASK-016, TASK-018
- **Portfolio & account settings**
  - Route: `/student/public-portfolio`, personal profile/security
  - Permission: own profile/account
  - Status: PARTIAL / MOCKED
  - Current availability: Routes exist; not in a coherent student shell.
  - Required work: TASK-016, TASK-018

## Guardian

- **Dashboard & child switcher**
  - Route: `/guardian`
  - Permission: `guardian.relationship.read`
  - Status: PARTIAL / MOCKED
  - Current availability: Relationship list and counters; no child-scoped navigation.
  - Required work: TASK-008, TASK-019
- **Attendance, progress & results**
  - Route: `/guardian/children/[studentId]/progress`
  - Permission: `child.linked.academic.read`
  - Status: MISSING
  - Current availability: No consumer pages.
  - Required work: TASK-008, TASK-010, TASK-011, TASK-012, TASK-019
- **Approvals & payments**
  - Route: `/guardian/children/[studentId]/approvals`, `/guardian/payments`
  - Permission: linked-child approval/payer scope
  - Status: MISSING
  - Current availability: Staff-side tuition/assignment mocks only.
  - Required work: TASK-008, TASK-011, TASK-014, TASK-019
- **Messages, notifications & settings**
  - Route: relationship-scoped utilities and personal settings
  - Permission: own account plus linked relationship
  - Status: MISSING / UNREACHABLE
  - Current availability: Generic personal mock pages.
  - Required work: TASK-013, TASK-016, TASK-019

## Organization Persona

- **Organization/context chooser**
  - Route: `/`, then `/org/[orgId]`
  - Permission: active organization membership
  - Status: PARTIAL / PERMISSION_RISK
  - Current availability: Client-side switch/fetch; no server membership validation.
  - Required work: TASK-003, TASK-005, TASK-016

After context selection, navigation is composed from the active organization role below; the persona itself does not grant all tenant actions.

## Organization Owner

- **Owner dashboard**
  - Route: `/org/[orgId]`
  - Permission: `org.dashboard.read`
  - Status: MOCKED / PERMISSION_RISK
  - Current availability: Trial/branch/member counts; URL org ID is trusted.
  - Required work: TASK-005, TASK-020
- **Academic, people & operations**
  - Route: grouped existing `/org/[orgId]/*` routes
  - Permission: granular domain keys
  - Status: EXISTS / WRONG_PERMISSION
  - Current availability: Many mock pages; most reuse `students.manage`.
  - Required work: TASK-004, TASK-007, TASK-008, TASK-009, TASK-010, TASK-011, TASK-012, TASK-016
- **Billing & governance**
  - Route: existing billing/audit/API-key/lifecycle routes
  - Permission: owner + specific `billing.*`/governance keys
  - Status: MOCKED
  - Current availability: Disconnected in-memory flows.
  - Required work: TASK-007, TASK-014, TASK-016
- **Settings**
  - Route: `/org/[orgId]/settings`
  - Permission: `org.settings.manage`
  - Status: MISSING
  - Current availability: Shell renders plain Settings text.
  - Required work: TASK-007, TASK-016

## Organization Manager

- **Dashboard, people, students, operations, approvals & reports**
  - Route: policy-filtered subset of existing `/org/[orgId]/*`
  - Permission: explicit delegated grants
  - Status: BROKEN
  - Current availability: Same unfiltered ~60-item shell as every role.
  - Required work: TASK-004, TASK-007, TASK-016, TASK-020
- **Owner-only exclusions**
  - Route: billing ownership, API keys, lifecycle
  - Permission: prohibited unless explicitly delegated
  - Status: PERMISSION_RISK
  - Current availability: Links are visible in the shared shell.
  - Required work: TASK-005, TASK-016

## Academic Manager

- **Academic dashboard and authoring**
  - Route: academic subset under `/org/[orgId]`
  - Permission: course, enrollment, session, attendance, assignment, grade, exam keys
  - Status: WRONG_PERMISSION
  - Current availability: Pages exist, templates and engine disagree.
  - Required work: TASK-004, TASK-009, TASK-010, TASK-011, TASK-012, TASK-020
- **Resources & academic reports**
  - Route: existing resources/reports routes
  - Permission: academic scope only
  - Status: MOCKED
  - Current availability: Mock data/exports; flat navigation.
  - Required work: TASK-016, TASK-019, TASK-020

## Organization Teacher

- **Assigned academic workspace**
  - Route: tenant-aware teacher routes or teacher links scoped to active org
  - Permission: assigned class/student only
  - Status: BROKEN / MISSING
  - Current availability: Effective org role has only member view while academic pages require `students.manage`.
  - Required work: TASK-004, TASK-005, TASK-009, TASK-010, TASK-011, TASK-012, TASK-017

## Finance

- **Finance dashboard**
  - Route: `/org/[orgId]/finance`
  - Permission: `finance.dashboard.read`
  - Status: MISSING
  - Current availability: Generic owner dashboard.
  - Required work: TASK-014, TASK-020
- **Tuition, subscription, invoices, usage, add-ons, tax & reports**
  - Route: existing billing/tuition family
  - Permission: granular `billing.*`, `tuition.*`, `reports.finance.*`
  - Status: MOCKED / WRONG_PERMISSION
  - Current availability: Routes exist with mixed gates and memory mutations.
  - Required work: TASK-004, TASK-014, TASK-016, TASK-020
- **Academic/HR exclusions**
  - Route: unrelated org routes
  - Permission: prohibited
  - Status: PERMISSION_RISK
  - Current availability: Shared shell exposes them.
  - Required work: TASK-016

## Support Staff

- **Support dashboard, directory, tasks/cases, knowledge base & forms**
  - Route: subset of existing org routes
  - Permission: support/directory/task keys with sensitive-field masks
  - Status: BROKEN
  - Current availability: Pages exist; effective engine cannot evaluate template keys.
  - Required work: TASK-004, TASK-007, TASK-020
- **Messages, notifications & own settings**
  - Route: relationship-scoped utilities
  - Permission: assigned case/thread plus own account
  - Status: MISSING / UNREACHABLE
  - Current availability: Generic personal mock pages.
  - Required work: TASK-013, TASK-016

## Seller Capability

- **Seller home, products/variants, orders, shipping/returns, balance/payouts, taxonomy & analytics**
  - Route: existing `/personal/seller/*` plus `/personal/shipping`
  - Permission: `seller.*` plus object ownership
  - Status: MOCKED / UNREACHABLE
  - Current availability: Routes exist but are absent from AppShell; engine has no seller keys.
  - Required work: TASK-004, TASK-015, TASK-016, TASK-021
- **Seller settings**
  - Route: `/personal/seller/settings`
  - Permission: `seller.settings.manage`
  - Status: MISSING
  - Current availability: No route.
  - Required work: TASK-015, TASK-021

## Shared shell requirements

- Desktop: grouped/collapsible policy-derived sidebar, active state, context switcher, breadcrumbs for 3+ levels, working search/notifications/user menu.
- Mobile: at most five primary items and an accessible overflow sheet; never a 60-item horizontal scroller.
- All: skip link, focusable `main`, 44px targets, keyboard/focus behavior, loading/empty/error feedback, route-state preservation, and identical navigation/API policy outcomes (TASK-016 and TASK-022).
