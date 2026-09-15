# Solo Frontend

Greenfield Next.js App Router application for Solo (Phase 0 Foundation).

## Stack

- Next.js App Router
- TypeScript strict
- pnpm
- Tailwind CSS v4 + semantic CSS variables
- Vitest + React Testing Library
- Playwright

## Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e:install
pnpm test:e2e
```

## Structure

```
src/
  app/                 # routing / layout / composition only
  features/            # feature modules (public API via index.ts)
  components/          # shared ui / shared / layouts
  lib/                 # infrastructure (i18n, routes, utils)
  store/               # global UI state only
  config/
```

## Notes

- Do not import from `/legacy`
- Do not persist credentials in `localStorage`
- `pnpm-workspace.yaml` is **not** a multi-package monorepo — it only holds pnpm v11 settings (`allowBuilds`) for this single package
- Playwright is configured to use system Chrome (`channel: "chrome"`) so local e2e can run when Playwright's headless-shell download fails
- Binding docs: `docs/frontend/ENGINEERING_RULES.md`, `docs/frontend/PROJECT_CONTEXT.md`
- `pnpm-workspace.yaml` in this folder is **pnpm v11 settings only** (allowBuilds). It is not a multi-package monorepo.
