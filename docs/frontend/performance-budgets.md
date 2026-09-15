# Frontend Performance Budgets (F0-035)

Canonical route budgets live in `frontend/src/lib/performance/budgets.ts`.

| Route | Max first-load JS (KB) | LCP target (ms) |
| --- | ---: | ---: |
| `/` | 180 | 2500 |
| `/p/[slug]` (public SEO) | 150 | 2000 |
| `/admin` | 220 | 3000 |

## Rules

- Prefer dynamic imports for editor, charts, maps, and PDF/print surfaces.
- Paginate or virtualize large tables.
- Keep public SEO routes on stricter budgets.
- CI should fail or warn when first-load JS exceeds the budget helper (`isWithinBudget`).
