# Solo Frontend — Project Context

Binding Phase 0 context for coding agents working in `/frontend`.

## Product identity

Solo is a **general education / student-management platform**, not a language-only product. Subjects are extensible and can be created by teachers or organizations.

Canonical repository: `Solo-Students-Managment/Solo` (default branch `main`).

## Current phase

**Phase 0 — Foundation**

Build the repository, architecture, design system, mock/network layer, identity/context foundations, shared primitives, testing, security, PWA/realtime, and quality gates required by later features.

Frontend-first. Backend implementation, database work, real authorization, real payment processing, real WebSocket servers, and real storage services are **out of scope** until the backend phase.

## Repository layout

```
/
  frontend/   # Next.js App Router + pnpm (canonical product UI)
  backend/    # Placeholder README only (Phase 0)
  docs/       # Preserved documentation
  legacy/     # Vite prototype — reference only
```

## Identity model (summary)

- Every person starts as a normal User account
- One account may hold multiple personas/contexts (e.g. Teacher + Student + School Owner)
- Core personas: Student, Guardian/Parent, Teacher, organization roles, Admin Solo
- Seller is a capability, not a persona/role
- After login, multi-persona users see Global Home and switch via Role/Persona Switcher
- Context Switcher (Personal / School / Institute) and Subject Switcher are distinct

## Auth posture (frontend)

- Phone is the primary login identity (E.164)
- Credentials/tokens must never be stored in `localStorage`
- Future production auth targets HttpOnly Secure Cookie sessions
- Frontend remains backend-agnostic through an Auth Client adapter

## Explicit prohibitions

- Hardcoded final production prices in UI
- Scattered role/plan permission conditionals outside Effective Capabilities
- Feature UI importing seed data directly
- Importing anything from `/legacy` into `/frontend`
- Turborepo / Nx / package-based monorepo (at this stage)

## Implementation phasing

| Phase | Focus |
| --- | --- |
| 0 | Foundation |
| 1 | Core Solo |
| 2 | Academic Advanced |
| 3 | Organization Operations |
| 4 | Plans & Platform |
| 5 | Marketplace & Commerce |
| 6 | Advanced Platform & Hardening |

## Explicit non-goals for frontend Phase 0 tasks

- Evolving `/legacy` into the product
- Porting MockFeaturePage / localStorage business mocks
- Real backend/database/authz/payments/storage/WebSocket servers
- Marketing landing website (separate project)

## Authoritative references

- `docs/frontend/ENGINEERING_RULES.md`
- `docs/Solo-Frontend-AI-Phases-Full-Execution.md`
- Frozen product scope decisions communicated to coding agents
- Task-specific acceptance criteria for each F0-xxx ticket
