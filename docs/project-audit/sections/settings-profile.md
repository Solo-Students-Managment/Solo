# Section: Profile & Settings

## Purpose

Manage personal profile, phone, security, preferences, notifications and organization/platform settings.

## Used By Roles

All authenticated users; settings scope varies by context.

## Current Pages

`/personal/profile`, `/phone`, `/security`, notification preferences and scattered public-profile/customization pages.

## Expected Pages

Context-aware Personal, Teaching, Student/Guardian, Organization and Admin settings hubs.

## Current Features

Validated mock personal forms, 2FA/device UI and theme/i18n foundations.

## Missing Features

Settings information architecture, durable persistence, role preferences, organization settings route and consent/privacy controls.

## API

Mock clients.

## Database

Missing profile/preference/consent/notification/org-setting persistence.

## Permissions

Personal capabilities exist client-side; organization settings policy is undefined.

## UI Components

Personal routes are mostly absent from navigation; OrgShell Settings is plain text.

## Business Flows

Update preference → affect notification/calendar/panel is not durable.

## Problems

Settings are fragmented and undiscoverable.

## Required Improvements

Create one settings hub per context with explicit ownership and save feedback.

## Implementation Checklist

- [ ] Define settings taxonomy/schema
- [ ] Add context-aware navigation and policies
- [ ] Persist preferences and test cross-device behavior
