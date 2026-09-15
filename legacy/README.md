# Legacy Vite Prototype (Reference Only)

This directory contains the previous Vite + React Router prototype.

## Status

- **Reference only** — do not evolve this code into the product.
- The canonical greenfield frontend lives in `/frontend` (Next.js App Router + pnpm).
- Do not port `MockFeaturePage` routes, `localStorage`/`sessionStorage` business mocks, Formik/Yup patterns, or React Router architecture into `/frontend` unless a later task explicitly reviews and retains a specific independent asset/utility.

## How to run (optional local reference)

```bash
cd legacy
pnpm install   # or npm install
pnpm dev       # scripts follow the legacy package.json
```

## Notes

- Package-manager lockfiles (`package-lock.json`, `bun.lock`) are preserved here for historical reference.
- New work must target `/frontend` only.
