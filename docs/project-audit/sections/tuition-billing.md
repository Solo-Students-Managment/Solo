# Section: Tuition, Plans & Billing

## Purpose

Track tuition and organization subscription/payment/invoice lifecycle.

## Used By Roles

Owner, finance, managers (limited), guardians/students (their records), Admin Solo (platform oversight).

## Current Pages

Org tuition plus pricing, subscription, plan-change, billing, usage, add-ons, coupons, checkout, tax-invoices, cancel, plan-versions and manual-billing.

## Expected Pages

Finance dashboard, payer/guardian view, reconciliation, payment history and admin revenue reporting.

## Current Features

Extensive mock subscription/checkout/invoice/tuition UI.

## Missing Features

Payment provider/backend, durable ledger, idempotency, reconciliation, refunds/dunning and payer scope.

## API

Typed mock clients; checkout explicitly includes a mock provider.

## Database

Missing PlanVersion, Subscription, Invoice, LineItem, Payment, Refund, Credit, TuitionCharge and LedgerEntry.

## Permissions

Mixed `billing.manage` and `students.manage`; no field/action separation.

## UI Components

Many direct routes, no finance/guardian navigation or exception dashboard.

## Business Flows

Plan → checkout → invoice/payment and tuition → payer view are not production flows.

## Problems

Financial integrity and authorization are absent.

## Required Improvements

Design ledger/idempotency/audit model before connecting real payments.

## Implementation Checklist

- [ ] Define financial schema and capability matrix
- [ ] Implement idempotent provider/webhook backend
- [ ] Add finance and payer panels with reconciliation tests
