# Section: Assignments, Submissions & Gradebook

## Purpose

Author work, collect submissions/revisions, review, score and release feedback.

## Used By Roles

Teachers, students, guardians and academic managers.

## Current Pages

Org assignments and gradebook consoles.

## Expected Pages

Teacher review queue, student assignment/detail/submission, guardian approval/status and released-grade views.

## Current Features

Mock create/submit/team/peer-review/revision functions and grade upsert.

## Missing Features

Role-specific surfaces, files/version history, release policy, rubric feedback, guardian approval and notification fan-out.

## API

Typed mock actions; no ownership, concurrency or durable file/API integration.

## Database

Missing Assignment, Assignee, Submission, SubmissionVersion, Rubric, Grade and Release/Approval tables.

## Permissions

Staff console uses `students.manage`; no submit-own/review-assigned/release capabilities.

## UI Components

Gradebook uses free-text learner references; student/guardian UI absent.

## Business Flows

Create → student submit → teacher review → release → guardian approve/view is 🔴 broken.

## Problems

Critical cross-role educational workflow exists only as staff-side mock controls.

## Required Improvements

Model submission/grade state machines and expose each actor's task-oriented view.

## Implementation Checklist

- [ ] Persist assignments/submissions/grades with versions
- [ ] Add student submission and teacher review routes
- [ ] Add release, guardian visibility and notifications
