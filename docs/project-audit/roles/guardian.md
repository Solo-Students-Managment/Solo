# Role: Guardian Persona (`guardian`)

## Role Purpose

Monitor linked children, approve required work, receive alerts, communicate with teachers and review tuition/progress.

## Access Scope

Only explicitly linked children and guardian-visible published records; no draft grades, unrelated learners or staff data.

## Dashboard

### Required

- [ ] Child switcher, progress/attendance summary, upcoming sessions and pending approvals
- [ ] Messages, alerts and tuition status

### Current Status

- [x] `/guardian` can list mock relationships and counters
- [ ] No child-scoped detail pages or actionable approvals

## Sidebar / Navigation

- 🟡 Dashboard and activation exist
- 🔴 Children, Progress, Attendance, Homework approvals, Results, Schedule, Messages, Payments, Notifications and Settings
- ⚠️ Generic shell contains Teacher and hardcoded Organization links

## Pages

Routes: `/guardian`, `/guardian/activate`. Permission: dashboard uses client-only `nav.guardian`; relationship scope is not server-enforced. Status: 🔴 Missing panel. API/DB: mock/absent.

## Actions

- [ ] Switch child and view progress/attendance/results
- [ ] Approve/reject homework tasks with history
- [ ] Message assigned teachers and review/pay allowed charges

## Business Flows

Teacher publishes work/attendance/result → guardian sees/acts/notified is 🔴 broken. Activation itself is 🟡 mock-functional.

## Notifications

Required for absence, homework approval, upcoming session, released grade, payment and messages. Current notifications have no domain events.

## Settings

Profile/security exists off-nav; child-notification rules and consent/privacy settings are missing.

## UI/UX Issues

No persistent child context, no action queue, no parent-friendly summary or relevant navigation.

## Permission Issues

No database relationship or server predicate proves guardian-to-child access.

## Missing Features

Child detail views, approvals, tuition/payment view and all cross-role consumption.

## Partial Features

Relationship activation and dashboard counters.

## Bugs / Broken Flows

Guardian cannot reach academic, communication or notification records from the role panel.

## Suggested Improvements

Make child context explicit in URL/state and enforce it in every backend query.

## Implementation Checklist

- [ ] Persist guardian relationships with status/consent
- [ ] Add child-scoped routes and guard policies
- [ ] Implement approval and notification fan-out flows
- [ ] Test multi-child switching and direct-URL isolation
