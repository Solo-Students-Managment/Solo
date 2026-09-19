# Section: Exams, Question Bank & Evaluations

## Purpose

Create questions/exams, publish attempts, grade/regrade and record evaluations.

## Used By Roles

Academic managers, teachers, students and guardians (released results).

## Current Pages

Org exams, question bank and evaluations.

## Expected Pages

Student timed attempt/review, teacher grading queue, guardian released results and exam detail/versioning.

## Current Features

Rich mock authoring/publish/grade and evaluation templates/scales.

## Missing Features

Timed attempt UI, autosave, integrity signals, server clock, release/regrade workflow and consumer views.

## API

Mock only; `exams.publish` exists in capability types but UI gates publishing with `students.manage`.

## Database

Missing Question/Version, Exam/Pool, Attempt/Answer, Grade/Regrade and Evaluation relations.

## Permissions

No author/publish/attempt-own/grade-assigned/result-view split.

## UI Components

Staff consoles only; no high-stakes attempt recovery/accessibility flow.

## Business Flows

Author → publish → attempt → grade → release → guardian view is 🔴 broken.

## Problems

Publishing is not auditable and students cannot take exams.

## Required Improvements

Prioritize durable attempt/answer state and capability separation.

## Implementation Checklist

- [ ] Define exam/attempt schemas and policies
- [ ] Build resilient timed student attempt UI/API
- [ ] Add grading/release/result cross-role E2E tests
