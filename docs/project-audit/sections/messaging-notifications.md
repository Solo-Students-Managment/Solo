# Section: Messaging, Chat & Notifications

## Purpose

Deliver direct/broadcast communication, chat rooms and event-driven actionable alerts.

## Used By Roles

All personas; scope varies by relationship and organization.

## Current Pages

`/personal/messages`, `/personal/chat`, `/personal/notifications`.

## Expected Pages

Current pages integrated into each panel with deep links, unread state, preferences and role targeting.

## Current Features

Mock inbox/chat/notification center and preference controls.

## Missing Features

Backend delivery, relationship authorization, unread badge, event producers, realtime/polling, deep links and retries.

## API

Typed mock clients; realtime client is a contract only.

## Database

Missing Conversation, Membership, Message, Notification, DeliveryAttempt and Preference records.

## Permissions

No proof that participants may contact each other or view a thread.

## UI Components

Pages are off-nav; AppShell bell is nonfunctional and shows a hardcoded dot.

## Business Flows

Academic/billing event → notification → destination is entirely missing.

## Problems

Cross-role workflows have no feedback channel.

## Required Improvements

Use an outbox/event model and authorized deep-link payloads.

## Implementation Checklist

- [ ] Add conversation/notification schema and policies
- [ ] Produce domain events with idempotent fan-out
- [ ] Wire shell badges, read state and deep links
