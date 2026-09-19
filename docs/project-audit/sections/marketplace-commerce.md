# Section: Marketplace & Commerce

## Purpose

Discover/catalog, trial/review, seller product/order/balance, cart/orders/promos/shipping/wallet and moderation.

## Used By Roles

Public/buyers, seller capability and Admin Solo.

## Current Pages

Twelve public routes, seven seller routes, personal shipping/wallet and admin moderation.

## Expected Pages

Connected buyer/seller/admin state machine with account and ownership guards.

## Current Features

Extensive mock browsing and transaction-like UI.

## Missing Features

Seller grants, inventory/order/payment/fulfillment persistence, moderation handoff, ownership and fraud/refund rules.

## API

Typed mock clients only.

## Database

Missing Seller, Product, Variant, Inventory, Cart, Order, Shipment, Return, Review, Promotion, Wallet and ModerationCase.

## Permissions

No seller capability/ownership; moderation lacks admin capability gate.

## UI Components

Public pages are reachable; seller/admin destinations are off-nav.

## Business Flows

Author → moderate → buy → fulfill → settle/refund is disconnected.

## Problems

Phase 5 breadth increases risk before core Phase 1 completion.

## Required Improvements

Keep disabled/demo-labeled until transactional backend and policies exist.

## Implementation Checklist

- [ ] Define commerce state machines and ownership policies
- [ ] Implement transactional backend/inventory/idempotency
- [ ] Connect seller-admin-buyer E2E flow
