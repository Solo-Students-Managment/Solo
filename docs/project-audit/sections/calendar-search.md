# Section: Calendar & Search

## Purpose

Provide a unified schedule and discovery of authorized entities/actions.

## Used By Roles

All personas.

## Current Pages

`/personal/calendar`, `/personal/search`, plus presence calendar.

## Expected Pages

Role-integrated calendar/search shortcuts and entity detail deep links.

## Current Features

Mock upcoming list, search model and URL-state helpers.

## Missing Features

Server index/query, authorization filtering, recent queries, full event sources and shell integration.

## API

Mock only.

## Database

Search index/event projection absent.

## Permissions

Results are not backed by server policy predicates.

## UI Components

Header Search has no action; mobile Search points to login.

## Business Flows

Notification/search result → authorized deep page is incomplete.

## Problems

Discoverability is poor despite existing routes.

## Required Improvements

Create server-filtered unified search and calendar projections.

## Implementation Checklist

- [ ] Wire shell search/calendar entry points
- [ ] Add authorized indexed API
- [ ] Test URL state, keyboard use and deep links
