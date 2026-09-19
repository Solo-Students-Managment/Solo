# Dashboard Matrix

Only widgets supported by existing entities and workflows are listed. Every current data source is mock-backed.

| Role | KPI / widget | Current source / query | Status | Missing states or behavior | Task |
| --- | --- | --- | --- | --- | --- |
| Admin Solo | Platform KPIs | `AdminDashboardView` → admin-dashboard client | MOCKED / PERMISSION_RISK | Server aggregate, freshness, error, scope, audited drill-down | TASK-006, TASK-019 |
| Admin Solo | Users/support/incidents/verification work queues | Separate admin clients/routes | PARTIAL | Unified pending work, role-safe deep links, mobile nav | TASK-006, TASK-016 |
| Teacher | Three summary counts | `TeacherDashboardView.tsx:55-109` | MOCKED | Assigned classes, next sessions, submissions to review, attendance alerts, quick actions | TASK-011, TASK-017 |
| Student | Three counts + relationships | `StudentDashboardView.tsx:56-129` | MOCKED | Next class, due work, active exams, released results, resources, deep links | TASK-011, TASK-018 |
| Guardian | Counts + linked relationships | `GuardianDashboardView.tsx:50-123` | MOCKED | Explicit child context, absences, due approvals/payments, released results | TASK-008, TASK-019 |
| Organization Owner | Trial/branch/member counts | `OrganizationDashboardView.tsx:14-96` | MOCKED / PERMISSION_RISK | Tenant access check, operational/academic/finance alerts, quick actions | TASK-007, TASK-020 |
| Organization Manager | Generic owner dashboard | Same route for all org roles | BROKEN | Delegated people/operations queues only; hide owner/billing/API-key data | TASK-007, TASK-020 |
| Academic Manager | Generic owner dashboard | Same route for all org roles | BROKEN | Academic schedule, enrollment, attendance, grading, exam queues | TASK-009, TASK-020 |
| Organization Teacher | No tenant-aware role dashboard | Teacher route plus generic org shell | MISSING | Assigned class/session/submission view within active organization | TASK-011, TASK-017 |
| Finance | Generic owner dashboard | Same route for all org roles | BROKEN | Receivables, overdue tuition, reconciliation, failed payments, exports | TASK-014, TASK-020 |
| Support Staff | Generic owner dashboard | Same route for all org roles | BROKEN | Assigned cases/tasks, directory, KB/forms, SLA-like existing task status | TASK-007, TASK-020 |
| Seller capability | Onboarding at `/personal/seller` | seller-onboarding client | PARTIAL / MOCKED | Product/order/fulfillment/payout summary and seller-scoped alerts | TASK-015, TASK-021 |

All dashboards require loading, empty, error, stale-data/source labels, accessible tabular alternatives for charts, and server-derived scope. These shared requirements are tracked by TASK-022.
