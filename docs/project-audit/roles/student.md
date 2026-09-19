# Role: Student Persona (`student`)

## Role Purpose

Participate in enrolled learning: schedule, sessions, assignments, exams, grades, resources, progress and communication.

## Access Scope

Self only, plus explicitly enrolled classes and published content; no peer/private staff records.

## Dashboard

### Required

- [ ] Today/upcoming classes, due work, recent grades, announcements and progress
- [ ] Join/submit/attempt quick actions

### Current Status

- [x] `/student` shows three mock counters
- [ ] No schedule, due-work list or usable academic actions

## Sidebar / Navigation

- 🟡 Dashboard and public portfolio route exist
- 🔴 Schedule, Classes, Assignments, Exams, Grades, Resources, Messages, Notifications and Settings
- ⚠️ Generic shell omits Student and links to Teacher/Organization instead

## Pages

Routes: `/student`, `/student/activate`, `/student/public-portfolio`. Permission: dashboard uses client-only `nav.student`; no server/self-scope. Status: 🔴 Missing panel. API/DB: mock only/absent.

## Actions

- [ ] View enrollment/schedule and join a session
- [ ] Submit/revise homework and view feedback
- [ ] Attempt timed exams and view released results
- [ ] Download resources, message teachers and manage profile/privacy

## Business Flows

Enrollment → student dashboard, assignment submission, exam attempt and grade release are 🔴 broken because staff-only org consoles have no student consumer UI.

## Notifications

Needs new assignment, deadline, schedule change, published grade and teacher-message events; no event fan-out exists.

## Settings

Personal profile/security exists off-nav; learning, accessibility and notification preferences are not integrated.

## UI/UX Issues

No student information architecture, due-date hierarchy, progress visualization, empty-state guidance or wired search/alerts.

## Permission Issues

No backend self-scope; a future API could expose other students if it trusted only the current client checks.

## Missing Features

All daily learning pages, timed exam player, submission UI, grade/progress views and certificates.

## Partial Features

Persona activation and public portfolio settings are mock-backed.

## Bugs / Broken Flows

The dashboard has no path to the academic records already represented in organization mocks.

## Suggested Improvements

Prioritize a mobile-first student shell with five primary destinations and accessible deadline/status semantics.

## Implementation Checklist

- [ ] Add server self/enrollment scope
- [ ] Build Schedule, Assignments, Exams and Grades routes
- [ ] Implement submission and timed-attempt flows
- [ ] Add p75 mobile-4G performance and student E2E gates
