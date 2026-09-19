# Role: Organization Teacher (`teacher` org role)

## Role Purpose

Teach assigned organization classes while operating inside the tenant context.

## Access Scope

Assigned classes/subjects/students only; no global student list, organization HR/billing/governance or unrelated teacher records.

## Dashboard

### Required

- [ ] Assigned schedule, rosters, attendance, due grading and messages

### Current Status

- [ ] No org-teacher dashboard; same org home as all roles

## Sidebar / Navigation

- ⚠️ Sees every org destination
- 🔴 Should see Home, My Classes, Sessions, Attendance, Assignments, Gradebook, Exams, Resources, Calendar and Messages

## Pages

Expected academic subset under `/org/[orgId]`. Permission: `orgRoleCapabilities.teacher` only has `org.members.view`; most academic pages demand `students.manage`, so the menu leads to 403 states. Status: ⚠️ Broken. Backend/database: missing.

## Actions

- [ ] Run only assigned teaching workflows and read the necessary roster/contact subset

## Business Flows

Teacher opens menu → academic route is commonly denied; if broad persona permission is used elsewhere, scope is too wide. Both outcomes are wrong.

## Notifications

Needs assignments, submissions, schedule, absences and messages scoped to assigned classes.

## Settings

Availability, notification and classroom preferences are absent from the org context.

## UI/UX Issues

The shell advertises dozens of unusable destinations instead of a teaching workspace.

## Permission Issues

Role has no academic capabilities and no assignment predicate.

## Missing Features

Teacher-class assignment model, scoped queries, usable org-teacher panel.

## Partial Features

Organization academic consoles can be adapted after authorization/scoping is designed.

## Bugs / Broken Flows

Visible link → client 403 is the dominant flow for org teachers.

## Suggested Improvements

Share the teacher workspace across personal/org contexts while requiring tenant and class assignments.

## Implementation Checklist

- [ ] Add teacher assignments to the data model
- [ ] Define org-teacher academic capabilities
- [ ] Filter navigation and test cross-tenant isolation
