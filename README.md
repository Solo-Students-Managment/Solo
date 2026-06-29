# Solo Frontend

A production-ready frontend for Solo, a Persian-first student management platform for private tutors.

## Overview

This project is the React + TypeScript + Vite dashboard for Teacher, Student, Parent, and Admin roles. It is built with RTL support, reusable UI components, mock data, and role-based route protection.

## Tech stack

- React 19 + React DOM 19
- TypeScript 6
- Vite
- Tailwind CSS v4
- React Router v7
- Formik & Yup
- Recharts, Lucide React, Sonner

## Structure

- `src/app/` — app shell, providers, and router
- `src/components/layout/` — dashboard shell and navigation
- `src/components/ui/` — reusable UI primitives
- `src/features/` — feature-specific pages and components
- `src/lib/` — domain utilities and formatters
- `src/hooks/` — shared hooks
- `src/mocks/` — mock data and seed helpers
- `src/styles/` — global Tailwind and theme styles
- `src/types/` — shared TypeScript definitions

## How to run

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Available scripts

- `dev` — Start the Vite development server
- `build` — Build production bundles
- `preview` — Preview the production build
- `lint` — Run ESLint
- `lint:fix` — Fix lint issues
- `format` — Run Prettier formatting
- `format:check` — Check formatting
- `knip` — Identify unused exports

## Key features

- RTL Persian dashboard layout
- Role-based authentication and routing
- Teacher, Student, Parent, and Admin dashboards
- Session, attendance, exam, and messaging views
- Mock service layer for rapid frontend validation
- Professional project structure and documentation

## Docs

- `docs/PRD/PRD-Frontend-Complete-en.md`
- `docs/PRD/PRD-Frontend-Complete-fa.md`

## Notes

This frontend is intentionally isolated from backend implementation. It uses mock data and role-based route guard logic to simulate the full application experience.
