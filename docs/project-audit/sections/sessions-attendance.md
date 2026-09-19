# Section: Sessions & Attendance

## Purpose

Schedule classes, manage conflicts/recurrence, run session detail and record attendance.

## Used By Roles

Academic manager, teachers, students and guardians.

## Current Pages

Org session list/detail and attendance console.

## Expected Pages

Teacher create/edit/cancel, student join/schedule, guardian schedule/absence view and reports.

## Current Features

Mock list/create/detail and attendance marking.

## Missing Features

Edit/cancel lifecycle, roster-driven marking, recurrence/conflict enforcement, join links, consumer pages and absence notifications.

## API

Mock client only; cancellation/idempotency and concurrency semantics absent.

## Database

Missing Session, Recurrence, Availability, Holiday, SessionParticipant and Attendance records.

## Permissions

No assigned-class/self/child scope; uses `students.manage`.

## UI Components

Attendance relies on typed student names rather than authoritative roster selection.

## Business Flows

Schedule → attend → mark → publish report → notify guardian is broken cross-role.

## Problems

Core PRD flow is not production-usable.

## Required Improvements

Build a roster/assignment-aware, transactional session lifecycle.

## Implementation Checklist

- [ ] Add session/attendance schema and scoped APIs
- [ ] Replace free-text attendance with roster UI
- [ ] Add student join and guardian notification flows
