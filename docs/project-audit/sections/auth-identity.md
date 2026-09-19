# Section: Authentication & Identity

## Purpose

Phone/password/OTP access, recovery, profile, multi-persona activation and context switching.

## Used By Roles

All authenticated personas and organization roles.

## Current Pages

`/auth/login`, `/signup`, `/otp`, `/recover`, `/reset`; `/personal/profile`, `/phone`, `/security`; persona activation pages and global home.

## Expected Pages

Current pages plus complete forbidden/deleted/archived states and an account/persona management surface.

## Current Features

Zod-validated mock flows, re-auth/device/2FA UI, no secrets in localStorage, persona/context switch UI.

## Missing Features

HttpOnly server sessions, credential store, OTP/SMS delivery, activation allowlist, durable recovery and account state enforcement.

## API

Typed HTTP contracts exist, but there are **zero** implemented Next.js `route.ts` handlers. In local mock mode the HTTP client is intercepted by MSW; in production MSW is disabled and the module-level in-memory mock remains registered unless bootstrap is corrected. There is no production auth service.

## Database

Missing User, Credential, PersonaGrant, Session, Device, OTPChallenge, Recovery and audit tables.

## Permissions

`switchPersona` accepts any enum value in mock mode; no server claim validation.

## UI Components

Forms have strong baseline validation/feedback; account/persona navigation remains fragmented.

## Business Flows

Login/activation work only in memory; restart/different process loses state.

## Problems

P0 authentication and account-state enforcement are absent for production.

## Required Improvements

Implement server auth, secure cookies, session rotation/revocation and durable persona grants.

## Implementation Checklist

- [ ] Create identity schema and auth service
- [ ] Enforce persona/account state server-side
- [ ] Add recovery, rate-limit and session security tests
