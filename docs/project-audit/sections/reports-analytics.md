# Section: Reports & Analytics

## Purpose

Provide role-scoped academic, operational and financial insight with saved views and exports.

## Used By Roles

Admin Solo and organization roles according to scope; teachers/students/guardians get limited views.

## Current Pages

Org reports/analytics and admin dashboard; seller analytics.

## Expected Pages

Role dashboards, saved reports, authoritative exports and accessible drill-downs.

## Current Features

Mock charts/KPIs and export actions.

## Missing Features

Real aggregates, row-level scope, background exports, freshness/source labels and role-specific insights.

## API

Mock only; no warehouse/query layer.

## Database

No source facts, snapshots, export jobs or saved-view tables.

## Permissions

Broad `students.manage`; financial/academic/privacy scopes are not separated.

## UI Components

Charts need text/table alternatives, keyboard tooltips, empty/error states and clear units/periods where absent.

## Business Flows

Record activity → aggregate → alert/export is not real.

## Problems

Displayed values may look authoritative despite being seeded mock data.

## Required Improvements

Label demo data and later build scoped aggregates with accessible table fallback.

## Implementation Checklist

- [ ] Define metric catalog, ownership and access scopes
- [ ] Implement aggregate/export jobs
- [ ] Add accessible charts, tables and freshness labels
