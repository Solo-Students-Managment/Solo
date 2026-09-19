# Section: Backend, Database & Authorization

## Purpose

Provide durable data, invariants, transactions, server authorization, integrations and observability.

## Used By Roles

Every role and feature.

## Current Pages

Not applicable; `/backend` contains only a placeholder README.

## Expected Pages

No backend UI; admin operational surfaces should reflect real backend health.

## Current Features

Frontend contracts, Zod parsers, mock clients/MSW and an API error model.

## Missing Features

NestJS service, Prisma schema/migrations, PostgreSQL, queues, WebSockets, storage, payments/SMS, rate limits and policy enforcement.

## API

112 typed service client modules describe a large intended surface, but there are **zero** implemented Next.js `route.ts` handlers. Local HTTP calls are intercepted by MSW, while production currently leaves module-level mock clients registered.

## Database

No `schema.prisma`, migration or SQL schema. The design sketch uses a single role enum inconsistent with the implemented multi-persona/org-role model.

## Permissions

All effective checks are browser-side; tenant/row/object scopes do not exist.

## UI Components

Frontend error/loading/empty states cannot compensate for missing durable services.

## Business Flows

No user-facing flow meets the production-complete definition.

## Problems

Primary P0 dependency for security, integrity and multi-user behavior.

## Required Improvements

Freeze identity/permission/domain contracts, implement backend vertically for Phase 1, then replace mock wiring feature by feature.

## Implementation Checklist

- [ ] Resolve identity/role schema and add migrations
- [ ] Implement server session, policy and tenant filters
- [ ] Deliver Phase 1 APIs with transactions/audit/outbox
- [ ] Run contract/integration/security tests before switching clients
