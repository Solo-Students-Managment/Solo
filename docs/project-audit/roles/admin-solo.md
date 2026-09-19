# Role: Admin Solo (`admin_solo`)

## Role Purpose

Platform operations: users, support, verification, audit, announcements, incidents, privacy, feature flags, storage, marketplace moderation, revenue and usage oversight.

## Access Scope

Must have platform-wide, server-enforced access with audited sensitive actions. It must not inherit organization/teacher access merely through `students.manage`.

## Dashboard

### Required

- [ ] Revenue/subscription, activation, retention, incident, support SLA, storage and risk KPIs
- [ ] Pending moderation/verification/privacy actions and recent audit activity

### Current Status

- [x] Mock KPI dashboard exists at `/admin`
- [ ] No real data, server authorization, revenue report, task aggregation or responsive mobile navigation

## Sidebar / Navigation

- 🟡 Dashboard, Users, Support, Verification, Audit, Announcements, Incidents, Privacy, Feature flags, Storage
- ⚠️ Marketplace moderation exists at `/admin/marketplace-moderation` but is absent from `AdminShell`
- 🔴 Settings, revenue/subscription reporting and a mobile navigation pattern are missing

## Pages

Routes: `/admin` plus ten linked admin pages and the orphan marketplace-moderation page. Permission: most views use the client-only `students.manage`; moderation only checks that a session exists. Status: ⚠️ Problem. Frontend/API: mock UI + typed mock clients. Database: absent. Missing: `nav.admin` enforcement, server guard, pagination/scope guarantees, mobile shell and real exports.

## Actions

- [x] View/update mock users, support, verification, incidents, flags and storage data
- [ ] Enforce restrict/unrestrict, impersonation/support mode, exports and destructive changes server-side with audit trails

## Business Flows

Admin review flows are UI-demonstrable only; no action survives process restart or reaches a backend.

## Notifications

Needs incident, verification, privacy deadline, support SLA and moderation queues. No event-driven delivery exists.

## Settings

Platform policy, security, billing catalog and notification settings are missing as an integrated admin area.

## UI/UX Issues

No mobile nav/header, no global search/notifications, no breadcrumbs, and one orphan route.

## Permission Issues

P0: teacher/organization personas also possess `students.manage`, so direct admin URLs can pass current UI gates. There is no backend gate.

## Missing Features

Real platform analytics/revenue, server RBAC, admin settings, event queues and downloadable authoritative reports.

## Partial Features

All 11 admin screens, because each is mock-backed and not production-authorized.

## Bugs / Broken Flows

`/admin/marketplace-moderation` is not in navigation and lacks an admin capability check.

## Suggested Improvements

Use a dedicated `admin.*` capability namespace and a server policy layer; derive navigation from the same policy manifest.

## Implementation Checklist

- [ ] Add server session and `nav.admin`/`admin.*` guards
- [ ] Add marketplace moderation to the shell and an adaptive mobile menu
- [ ] Back KPIs/actions with database queries and immutable audit records
- [ ] Add admin integration and authorization-bypass tests
