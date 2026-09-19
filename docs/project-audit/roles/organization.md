# Role: Organization Persona (`organization`)

## Role Purpose

Enter an organization tenant and operate according to the member's organization role.

## Access Scope

Tenant membership plus `orgRole`; the persona alone must not grant all academic, HR or billing functions.

## Dashboard

### Required

- [ ] Role-filtered KPIs, tasks, calendar, alerts and quick actions
- [ ] Tenant/branch/subject context with clear switching

### Current Status

- [x] Mock trial, branch and member statistics
- [ ] No role-specific dashboard composition or academic/operations action queue

## Sidebar / Navigation

- ⚠️ `OrgShell` exposes roughly 60 flat links to every org role
- 🟡 Active state exists
- 🔴 Grouping, permission filtering, search, notification/header, breadcrumbs and Settings route
- ⚠️ Mobile renders the full menu as a horizontal chip scroller

## Pages

Routes: `/org/new`, `/org/[orgId]` and 61 tenant pages. Permission: mixed client gates; most unrelated features reuse `students.manage`; membership/tenant checks are not server-side. Status: ⚠️ Problem. API/DB: typed mock clients/no DB.

## Actions

- [x] Demonstrate many create/update/status operations in memory
- [ ] Persist, authorize, audit and scope all tenant actions

## Business Flows

Organization creation is mock-functional; creation → default owner → correct role menu is ⚠️ broken because every role gets the same shell.

## Notifications

No tenant event aggregation or header destination.

## Settings

Rendered as plain text, not a route. Organization profile, locale, security, retention and notification settings are fragmented or absent.

## UI/UX Issues

Navigation violates hierarchy, mobile discoverability and keyboard-efficiency guidance; deep pages lack breadcrumbs and skip links.

## Permission Issues

Role template strings do not match the effective-capability vocabulary; `OrgShell` does not filter by `orgRole`.

## Missing Features

Unified policy manifest, tenant enforcement, settings and role-specific dashboards/navigation.

## Partial Features

All organization pages: rich mock slices, but no production data or complete cross-role flow.

## Bugs / Broken Flows

Finance/support/teacher see unrelated menu entries; some then 403, while others pass overly broad checks.

## Suggested Improvements

Generate routes, navigation and server authorization from one capability manifest and group destinations by Academic, People, Operations, Billing and Settings.

## Implementation Checklist

- [ ] Unify permission namespaces and org role templates
- [ ] Add tenant membership/server policy guards
- [ ] Replace flat nav with role-filtered grouped navigation
- [ ] Add organization settings and adaptive mobile shell
