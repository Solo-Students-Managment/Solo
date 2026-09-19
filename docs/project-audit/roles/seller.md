# Capability: Seller

## Role Purpose

Allow an eligible personal account to onboard and sell marketplace products. Seller is correctly described as a capability, not a persona.

## Access Scope

Own seller profile, catalog items, variants, orders, balance, taxonomy and analytics; no access to other sellers except public data.

## Dashboard

### Required

- [ ] Sales/orders/payout KPIs, moderation status and actionable inventory alerts

### Current Status

- [ ] `/personal/seller` is onboarding, not a complete seller home

## Sidebar / Navigation

- 🔴 Seller routes are absent from `AppShell`
- 🟡 Seven seller pages exist by direct URL

## Pages

Routes: `/personal/seller` plus products, variants, orders, balance, taxonomy and analytics. Permission: no `seller.*` capability in the engine. Status: 🟡 Partial/⚠️ unsafe. API/DB: mock/absent.

## Actions

- [x] Demonstrate onboarding, product/variant/order/balance/taxonomy/analytics mock interactions
- [ ] Enforce seller ownership, moderation, payout and inventory transactions server-side

## Business Flows

Onboard → author → moderate → publish → order → fulfill → payout is only a disconnected set of mock screens.

## Notifications

Needs moderation, order, return/dispute, low-stock and payout events.

## Settings

Seller identity, payout, shipping/returns and tax settings are incomplete.

## UI/UX Issues

No seller navigation or dashboard; direct URLs are the only discovery path.

## Permission Issues

Missing seller capability/ownership policy is a P1 authorization gap before backend integration.

## Missing Features

Capability grant lifecycle, moderation handoff, fulfillment/payout workflow and ownership enforcement.

## Partial Features

All seller and public commerce screens.

## Bugs / Broken Flows

Marketplace moderation is also off the admin navigation, breaking the seller-to-admin handoff.

## Suggested Improvements

Add `seller.*` policies and expose a conditional seller section after verified onboarding.

## Implementation Checklist

- [ ] Define seller capability and ownership rules
- [ ] Add seller home/navigation and moderation status
- [ ] Connect order/refund/payout state machines
- [ ] Add seller/admin/buyer cross-role E2E tests
