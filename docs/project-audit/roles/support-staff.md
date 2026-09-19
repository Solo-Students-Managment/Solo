# Role: Support Staff (`support_staff`)

## Role Purpose

Assist organization users with directory, tasks, forms and approved operational support without academic or financial authority.

## Access Scope

Minimal tenant directory/task data and explicitly delegated support cases; no grades, billing, HR-sensitive documents or role administration.

## Dashboard

### Required

- [ ] Assigned tasks/cases, SLA, announcements and safe directory shortcuts

### Current Status

- [ ] No support-staff dashboard

## Sidebar / Navigation

- ⚠️ All organization routes are visible
- 🔴 Should show only Home, Directory, Tasks/Cases, Knowledge, Forms, Messages and allowed Settings

## Pages

Expected subset under `/org/[orgId]`. Permission: engine only grants `org.members.view`; role-template client separately grants `directory.view`/`tasks.manage`, which the engine does not know. Status: ⚠️ Broken. Backend/database: missing.

## Actions

- [ ] View safe directory data, manage assigned tasks/cases and use approved knowledge/forms

## Business Flows

Visible route → permission denial or overly broad `students.manage` route; there is no coherent support workflow.

## Notifications

Needs task assignment, SLA and internal announcement events.

## Settings

Personal notifications/profile only; no integrated support preferences.

## UI/UX Issues

Dozens of irrelevant links and no case/task prioritization.

## Permission Issues

Template/engine vocabulary mismatch and no field-level privacy filtering.

## Missing Features

Support policy bundle, case dashboard and restricted directory projections.

## Partial Features

Directory, tasks, knowledge base and forms have mock implementations.

## Bugs / Broken Flows

The menu promises pages the role cannot legitimately use.

## Suggested Improvements

Use explicit support projections and explain unavailable features rather than exposing dead links.

## Implementation Checklist

- [ ] Unify support capabilities
- [ ] Build filtered support navigation/dashboard
- [ ] Add sensitive-field and direct-URL denial tests
