# Monorepo Structure — SOLO

## Tech: Turborepo + PNPM

apps/
web-app/ (React dashboard)
web-public/ (Next.js SEO marketplace)
api/ (NestJS backend)

packages/
ui/ (shared components)
config/ (eslint, tsconfig)
types/ (shared types)
utils/ (helpers)
db/ (prisma or typeorm)

services/
sms/
payment/
notification/

---

## Key Rules

- Shared types in /packages/types
- Business logic ONLY in backend
- UI shared components isolated
- Public & private apps fully separated
