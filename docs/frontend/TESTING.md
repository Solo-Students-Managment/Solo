# Frontend Testing Harness (F0-033)

## Layers

| Layer | Tool | Command |
| --- | --- | --- |
| Unit / component | Vitest + React Testing Library | `pnpm test` |
| Coverage (critical logic) | Vitest coverage-v8 | `pnpm test:coverage` |
| E2E smoke | Playwright (Chromium) | `pnpm test:e2e` |
| Accessibility | axe-core (unit helper) + `@axe-core/playwright` | included in unit/e2e |
| Visual regression | Playwright screenshots | `pnpm test:visual` (opt-in) |

## Conventions

- Prefer testing behavior and contracts over implementation details.
- Keep fixtures deterministic; do not import production seed tables into UI tests.
- Cover fa/en, RTL/LTR, Light/Dark, capability denial, and offline/sensitive paths when the slice owns that behavior.
- Visual baselines are generated locally with `pnpm test:visual --update-snapshots` and are optional in CI until Phase 1 product screens stabilize.

## Coverage focus

Thresholds target critical foundation modules (`lib/capabilities`, `lib/security`, `services/api`, `lib/query`, `lib/pwa`, `services/auth`) rather than blanket UI coverage.
