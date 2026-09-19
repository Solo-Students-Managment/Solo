# Role: Organization Owner (`owner`)

## Role Purpose

Own tenant governance, membership, configuration, academic operations and billing accountability.

## Access Scope

All resources inside owned organizations, excluding Solo platform administration. Ownership transfer and destructive lifecycle actions require re-authentication and audit.

## Dashboard

### Required

- [ ] Organization health, enrollment, attendance, finance, staff tasks, limits and alerts

### Current Status

- [ ] No owner-specific composition; generic organization mock dashboard only

## Sidebar / Navigation

- 🟡 All org mock destinations exist
- ⚠️ Same flat menu as every other org role; no grouping or role policy source

## Pages

Route family: `/org/[orgId]/*`. Permission: intended broad tenant scope; current engine grants members/students/billing only, while pages mostly check `students.manage`. Status: ⚠️ Problem. Backend/database: missing.

## Actions

- [x] Mock management across org modules
- [ ] Secure ownership transfer, archive/delete, role delegation and billing changes

## Business Flows

Create org → become owner works in memory; durable ownership, transfer, deletion and role-correct menu are missing.

## Notifications

Needs billing, limits, security, approvals, incidents and lifecycle alerts.

## Settings

The Settings label has no route; tenant identity/security/retention settings are missing.

## UI/UX Issues

Excessive ungrouped navigation and no role/task prioritization.

## Permission Issues

No server tenant/owner guard; sensitive actions do not consistently require re-authentication.

## Missing Features

Durable governance, ownership transfer, org settings and authoritative reporting.

## Partial Features

All organization modules are mock-backed.

## Bugs / Broken Flows

Capability strings in role templates and the effective engine disagree.

## Suggested Improvements

Treat owner as a tenant policy bundle, not a hardcoded UI branch.

## Implementation Checklist

- [ ] Define owner policy and sensitive-action re-auth rules
- [ ] Add org settings/ownership lifecycle
- [ ] Add tenant audit and owner authorization tests
