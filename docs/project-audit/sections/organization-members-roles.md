# Section: Organization Membership & Roles

## Purpose

Invite members, assign organization roles and calculate effective capabilities.

## Used By Roles

Organization owner/manager and all organization members.

## Current Pages

Org members, roles and directory.

## Expected Pages

Invitation detail, custom-role matrix, access review, membership history and safe offboarding.

## Current Features

Mock owner seed, invites, member status/role updates and role-template editor.

## Missing Features

Durable invites/memberships, custom-role evaluation, least-privilege review and server policy enforcement.

## API

Mock clients only.

## Database

Missing OrganizationMembership, Invitation, Role, Permission, RoleAssignment and history relations.

## Permissions

Critical mismatch: template strings such as `courses.manage`/`tasks.manage` are not accepted by the 15-key effective-capability engine.

## UI Components

Member controls exist; shell never applies the selected org role to navigation.

## Business Flows

Invite → accept → correct role access/menu → offboard is incomplete.

## Problems

This is the root dependency for every organization panel.

## Required Improvements

Adopt one permission registry and evaluate it on server and client.

## Implementation Checklist

- [ ] Unify permission vocabulary and migrate templates
- [ ] Persist invitation/membership/role history
- [ ] Generate route/action policies and nav from registry
