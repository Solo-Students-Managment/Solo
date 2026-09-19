# Role: Academic Manager (`academic_manager`)

## Role Purpose

Oversee subjects, courses, classes, enrollments, sessions, assessments and academic reporting.

## Access Scope

Academic records in assigned organization/branches; no billing, HR documents, API keys or ownership lifecycle.

## Dashboard

### Required

- [ ] Academic KPIs, scheduling conflicts, attendance risk, grading backlog and upcoming exams

### Current Status

- [ ] No distinct dashboard

## Sidebar / Navigation

- 🔴 Required grouped Academic navigation is not role-filtered
- ⚠️ Current shell also exposes billing, HR, CRM, API keys and lifecycle

## Pages

Expected routes are the academic subset under `/org/[orgId]`. Permission: engine exposes only `students.manage`; role-template client separately names `courses.manage`/`exams.manage`, creating a mismatch. Status: ⚠️ Problem. Backend/database: missing.

## Actions

- [ ] Manage curriculum/classes/enrollment/scheduling/attendance/assessment publishing and reports
- [ ] Be denied unrelated HR/billing/platform operations

## Business Flows

Academic authoring consoles exist in memory; student/guardian consumption and durable publication are broken.

## Notifications

Needs schedule conflicts, absence thresholds, grading SLA and publication alerts.

## Settings

Academic calendars, grading/evaluation scales and subject defaults are fragmented across pages.

## UI/UX Issues

No academic hierarchy, cross-feature context or pending-action dashboard.

## Permission Issues

Two incompatible permission vocabularies make intended access unverifiable.

## Missing Features

Academic manager policy, role dashboard and cross-role release workflow.

## Partial Features

Most academic authoring pages are rich mock implementations.

## Bugs / Broken Flows

Exam publish defines `exams.publish` but the exam UI uses `students.manage`.

## Suggested Improvements

Unify academic capabilities and model publish/release as audited state transitions.

## Implementation Checklist

- [ ] Define academic capability matrix
- [ ] Re-gate academic routes/actions and navigation
- [ ] Add publication/consumer E2E journeys
