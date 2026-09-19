# Role: Organization Manager (`manager`)

## Role Purpose

Coordinate organization people and day-to-day operations without owner-only governance or finance powers.

## Access Scope

Tenant members, students and approved operations; no billing, ownership transfer, platform admin or unrestricted academic records.

## Dashboard

### Required

- [ ] Operational tasks, staffing, enrollment and approval queues

### Current Status

- [ ] No manager-specific dashboard

## Sidebar / Navigation

- ⚠️ Sees the same academic, HR, developer and billing links as owner/finance/teachers
- 🔴 Role-filtered Operations, People, Students, Reports and Settings navigation

## Pages

Route family: `/org/[orgId]/*`. Permission: client engine gives member/student operations, but shell ignores it and feature gates are inconsistent. Status: ⚠️ Problem. Backend/database: missing.

## Actions

- [ ] Manage allowed members/students/operations; approve within delegated limits
- [ ] Be denied billing, API keys, lifecycle and owner-only policies

## Business Flows

Invite/assign/manage flow is 🟡 mock-only; delegated approval and audit are incomplete.

## Notifications

Needs staffing, enrollment, task and approval alerts.

## Settings

Only delegated organization/preferences settings should appear; none are integrated.

## UI/UX Issues

No prioritization or explanation for unavailable destinations.

## Permission Issues

Menu disclosure and direct-URL decisions do not come from one policy; no backend denial.

## Missing Features

Delegation boundaries, approval limits and manager dashboard.

## Partial Features

Members, students, directory, tasks and approvals have mock slices.

## Bugs / Broken Flows

The user can see billing/developer/lifecycle links despite lacking intended authority.

## Suggested Improvements

Define explicit `people.*`, `operations.*`, `academic.read` and `reports.*` capabilities.

## Implementation Checklist

- [ ] Define manager capability bundle
- [ ] Filter navigation and enforce server policies
- [ ] Build operational dashboard and delegated approval tests
