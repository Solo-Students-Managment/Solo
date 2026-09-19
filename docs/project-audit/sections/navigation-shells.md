# Section: Panels, Shells & Navigation

## Purpose

Expose role-appropriate destinations, context, page hierarchy, search, alerts and responsive navigation.

## Used By Roles

All authenticated roles.

## Current Pages

Three shells: generic `AppShell`, flat `OrgShell`, desktop-only `AdminShell`.

## Expected Pages

Role-aware teacher/student/guardian/personal shells, filtered organization/admin shells and organization settings.

## Current Features

Org/admin active state; AppShell mobile bottom nav and safe-area padding.

## Missing Features

Policy-derived menus, grouping, breadcrumbs, skip links, user/context menu, wired search/bell, mobile admin nav and org settings.

## API

Navigation should consume session/capability data; currently hardcoded.

## Database

Requires membership/persona/capability data after auth is implemented.

## Permissions

Menus are not filtered by the same policy used by pages.

## UI Components

AppShell has dead Search/Alerts destinations; OrgShell renders every item as horizontal mobile chips.

## Business Flows

Deep links can reveal/deny inconsistently; several real pages are orphaned.

## Problems

Central usability and security-disclosure gap.

## Required Improvements

Create one route manifest with label, group, capability, role visibility and mobile priority.

## Implementation Checklist

- [ ] Build policy-aware navigation manifest
- [ ] Add adaptive shell, breadcrumbs and route focus management
- [ ] Test every menu target and direct URL per role
