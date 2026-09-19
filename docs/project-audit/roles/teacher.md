# Role: Teacher Persona (`teacher`)

## Role Purpose

Run daily teaching work: assigned learners/classes, sessions, attendance, assignments, grading, exams, resources, calendar and communication.

## Access Scope

Only assigned organizations, classes, subjects and learners; never organization billing, unrelated students or platform administration.

## Dashboard

### Required

- [ ] Today/upcoming sessions, pending grading, attendance alerts, messages and quick actions
- [ ] Class performance and workload scoped to the teacher

### Current Status

- [x] `/teacher` renders three mock summary values
- [ ] No assigned-class or daily-work data; no teacher-specific shell

## Sidebar / Navigation

- 🟡 Dashboard, Plans, Public profile exist
- 🔴 My classes, Students, Sessions, Attendance, Assignments, Gradebook, Exams, Resources, Calendar, Messages, Notifications and Settings
- ⚠️ Generic `AppShell` instead shows Personal, Teacher and hardcoded Organization `demo`

## Pages

Routes: `/teacher`, `/teacher/activate`, `/teacher/plans`, `/teacher/public-profile`. Permission: dashboard/plans use client-only `nav.teacher`; public profile has no equivalent role gate. Status: 🔴 Missing panel. API/DB: mock clients/no DB. Required actions: role-scoped list/detail/create/edit/publish/review flows.

## Actions

- [ ] Create/edit/cancel sessions and attach materials
- [ ] Mark roster attendance
- [ ] Publish assignments/exams, review submissions, record feedback/grades
- [ ] Message assigned students/guardians and export assigned-class reports

## Business Flows

Teacher → assignment/session/exam flows exist only in the organization staff console and have no teacher-scoped consumer path. Status: 🔴 Broken.

## Notifications

Needs submission, absence, message, schedule-change and review reminders. Current center is static mock data and off-nav.

## Settings

Profile/security pages exist under `/personal`; teaching preferences, availability and notification shortcuts are not integrated.

## UI/UX Issues

Dashboard is overly generic; no role navigation, active state, breadcrumbs, relevant quick actions or wired header search/bell.

## Permission Issues

`teacher` receives global `students.manage`, enabling unrelated org/admin UI; assigned-class data scope is absent.

## Missing Features

The entire daily teacher workspace and end-to-end grading/communication flows.

## Partial Features

Activation, plans and public-profile settings; organization academic mock consoles can be reused after scoping.

## Bugs / Broken Flows

Teacher can directly open screens guarded only by `students.manage`; students/guardians cannot consume published work.

## Suggested Improvements

Create a `/teacher` shell backed by teacher-assignment claims and shared domain services rather than duplicating org views.

## Implementation Checklist

- [ ] Define teacher-scoped capabilities and queries
- [ ] Build role-aware teacher navigation/dashboard
- [ ] Connect session → attendance → assignment/exam → grade flows
- [ ] Add teacher/student/guardian cross-role E2E tests
