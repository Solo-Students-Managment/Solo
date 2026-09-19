# Section: Enrollment

## Purpose

Connect students to courses/classes with status, transfer, freeze and withdrawal history.

## Used By Roles

Owner, manager, academic manager, teachers, students and guardians (read-only where appropriate).

## Current Pages

`/org/[orgId]/enrollments`.

## Expected Pages

Role-scoped enrollment detail/history plus student/guardian views and request/approval states.

## Current Features

Mock create, status change and transfer with some transition validation.

## Missing Features

Database constraints, capacity/waitlist checks, effective dates, audit, consumer visibility and pagination.

## API

Typed mock client; no real transaction boundary.

## Database

Missing Enrollment and EnrollmentTransition with class/student/organization FKs and uniqueness rules.

## Permissions

Uses broad student-management access; no enrollment-specific approvals.

## UI Components

Staff console only.

## Business Flows

Enroll → schedule/content visibility is broken for the student.

## Problems

State transitions cannot be trusted without persistence/transactions.

## Required Improvements

Implement transactional enrollment state machine and downstream access projection.

## Implementation Checklist

- [ ] Persist enrollment history and invariants
- [ ] Add student/guardian read views
- [ ] Test transfer/freeze/withdrawal downstream effects
