# Section: Platform Administration

## Purpose

Operate Solo accounts, support, verification, audit, incidents, privacy, flags, storage and marketplace moderation.

## Used By Roles

Admin Solo only.

## Current Pages

Eleven `/admin` pages.

## Expected Pages

Current pages plus revenue/subscription reporting, system settings and complete moderation navigation.

## Current Features

Mock dashboards and action consoles.

## Missing Features

Server admin policy, immutable audit, support mode, queues/SLAs, authoritative exports and mobile shell.

## API

Typed mock clients, no admin backend.

## Database

All platform operations/audit entities absent.

## Permissions

Most screens use `students.manage`; moderation checks only session presence.

## UI Components

Marketplace moderation is orphaned; AdminShell is desktop-only.

## Business Flows

Review/action/escalation/audit flows do not persist.

## Problems

P0 admin URL access weakness.

## Required Improvements

Dedicated `admin.*` policies and server-side audited commands.

## Implementation Checklist

- [ ] Add admin policy/guard layer
- [ ] Add moderation nav and mobile shell
- [ ] Persist/audit every privileged action
