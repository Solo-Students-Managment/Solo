# Role: Finance (`finance`)

## Role Purpose

Manage organization subscription/billing, invoices, tuition records and permitted financial reporting.

## Access Scope

Financial records and minimal member/student identity needed for reconciliation; no academic content, grades, HR documents or platform admin.

## Dashboard

### Required

- [ ] Receivables, invoice status, usage/limits, dunning and reconciliation exceptions

### Current Status

- [ ] No finance dashboard

## Sidebar / Navigation

- 🟡 Billing-related mock routes exist
- ⚠️ Same shell exposes every academic/HR/developer destination
- 🔴 Finance-only grouped Billing/Tuition/Reports/Settings menu

## Pages

Relevant routes: pricing, subscription, plan-change, billing, usage, add-ons, coupons, checkout, tax-invoices, cancellation, plan-versions, manual-billing and tuition. Permission: some use `billing.manage`; tuition and several pricing/subscription surfaces reuse `students.manage`, denying finance or granting wrong roles. Status: ⚠️ Problem.

## Actions

- [ ] View/export/record/reconcile allowed financial data with audit and idempotency

## Business Flows

Subscription/checkout/invoice/tuition flows are disconnected mock state; no payment or accounting backend.

## Notifications

Needs payment failure, overdue tuition, usage threshold, invoice and dunning events.

## Settings

Tax/billing contacts, invoice numbering and payment configuration are incomplete.

## UI/UX Issues

No finance information architecture or exception-focused dashboard.

## Permission Issues

Mixed `billing.manage`/`students.manage` checks make access inconsistent; financial field-level scope is absent.

## Missing Features

Durable ledger/invoice/payment integration, reconciliation and safe exports.

## Partial Features

Billing and tuition mock consoles.

## Bugs / Broken Flows

Finance sees irrelevant routes and may be blocked from finance-adjacent pages.

## Suggested Improvements

Separate `billing.*` and `tuition.*` capabilities and use immutable monetary records/idempotent commands.

## Implementation Checklist

- [ ] Define finance capability and data-field scope
- [ ] Build finance dashboard/navigation
- [ ] Implement audited, idempotent billing/tuition backend flows
