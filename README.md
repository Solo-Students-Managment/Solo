# Solo

Canonical repository: [Solo-Students-Managment/Solo](https://github.com/Solo-Students-Managment/Solo)

Solo is a general education / student-management platform. Subjects are extensible and can be created by teachers or organizations.

## Repository layout

| Path | Purpose |
| --- | --- |
| `/frontend` | **Canonical product frontend** — Next.js App Router, TypeScript strict, pnpm |
| `/backend` | Placeholder for the future NestJS backend (not implemented in Phase 0) |
| `/docs` | Product, design, and engineering documentation |
| `/legacy` | Previous Vite + React Router prototype — **reference only** |

This repository is **not** a Turborepo/Nx or package-based monorepo at this stage. `/frontend` and `/backend` are independent boundaries. The root `package.json` exists only for Husky git hooks and convenience scripts that delegate into `/frontend`.

## Frontend (active development)

```bash
cd frontend
pnpm install
pnpm dev
```

Useful scripts:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Binding frontend references:

- [`docs/frontend/ENGINEERING_RULES.md`](docs/frontend/ENGINEERING_RULES.md)
- [`docs/frontend/PROJECT_CONTEXT.md`](docs/frontend/PROJECT_CONTEXT.md)

## Legacy prototype

The Vite application previously lived at the repository root. It was relocated to `/legacy` by task **F0-001**. Do not evolve it into the product and do not port mock/localStorage business patterns into `/frontend`.

## Documentation

All existing documentation under `/docs` is preserved. Older docs may still describe the Vite prototype or language-school framing; the frozen product scope and engineering rules above are authoritative for new work.

## Phase model

Implementation is phased: Phase 0 Foundation → Phase 1 Core Solo → Phase 2 Academic Advanced → Phase 3 Organization Operations → Phase 4 Plans & Platform → Phase 5 Marketplace & Commerce → Phase 6 Advanced Platform & Hardening.

Frontend-first: real backend, database, authorization, payments, WebSockets, and storage services remain out of scope until the backend phase.
