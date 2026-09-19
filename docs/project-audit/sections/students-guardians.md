# Section: Students & Guardian Relationships

## Purpose

Manage learner records, activation, guardian links, privacy and role-scoped viewing.

## Used By Roles

Owner, manager, academic manager, org teacher, teacher persona, student and guardian.

## Current Pages

Org student list/detail, student/guardian activation, student/guardian dashboards and public portfolio.

## Expected Pages

Edit/archive/restore/import/export, relationship management/history, and student/guardian self-service detail views.

## Current Features

Mock list/create/detail and link-guardian; search/filter basics vary by view.

## Missing Features

Durable relation/consent model, update/delete/archive/restore, self/child scopes and invitations/activation handoff.

## API

Typed mock clients; no authoritative API, pagination contract or uniqueness enforcement.

## Database

Missing Person/User, StudentProfile, GuardianRelationship, OrganizationStudent and consent/history relations.

## Permissions

Broad `students.manage`; no assigned-class, self or linked-child predicate.

## UI Components

Org forms exist; student and guardian panels cannot reach records.

## Business Flows

Create student → link guardian → activate accounts → consume academic records is broken after staff-side mock creation.

## Problems

P0 privacy/scope and P1 consumer panel gaps.

## Required Improvements

Define identity/relationship lifecycle before adding more student CRUD.

## Implementation Checklist

- [ ] Model student/org/guardian relations and consent
- [ ] Add scoped APIs and edit/archive lifecycle
- [ ] Complete activation-to-dashboard E2E flow
