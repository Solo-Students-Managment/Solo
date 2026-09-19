# Section: Organization Operations

## Purpose

Manage branches, facilities, departments, positions, shifts, leave, staff attendance/documents, onboarding/offboarding, approvals, tasks, knowledge, forms, automation, CRM, events and bulk/data operations.

## Used By Roles

Owner, manager, support staff and delegated HR/operations users (no dedicated HR persona exists).

## Current Pages

Twenty-four organization operation pages under `/org/[orgId]`.

## Expected Pages

Existing routes with role grouping, detail/history, audit, pagination and scoped dashboards.

## Current Features

Broad mock CRUD/state transitions across all named modules.

## Missing Features

Backend/data model, granular policy, reliable file/workflow execution, entity details and cross-module handoffs.

## API

Typed client surface is extensive but active clients are in-memory.

## Database

All operational entities/relations are absent.

## Permissions

Most pages incorrectly reuse `students.manage`.

## UI Components

Form/table slices exist, but the flat navigation makes the suite unusable and mobile chip scrolling is excessive.

## Business Flows

Hire/onboard/schedule/leave/offboard and form/approval/automation flows are demos, not durable workflows.

## Problems

Advanced Phase 3 breadth landed before core role panels and authorization.

## Required Improvements

Gate/postpone modules by roadmap priority; implement shared workflow/audit primitives first.

## Implementation Checklist

- [ ] Prioritize modules and define owners/capabilities
- [ ] Persist shared workflow/audit/document primitives
- [ ] Add module-level integration/E2E tests before enabling nav
