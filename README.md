# Student Management System

A lightweight Student Management System built with modern React and TypeScript tooling.

## English / فارسی (English first, Persian summary below)

### Tech stack

- React 19 + React DOM 19
- TypeScript
- Vite
- Tailwind CSS
- React Router v7
- Formik & Yup
- Recharts, Framer Motion, Lucide React, Sonner

### Folder structure overview

- `src/` — application source
  - `app/` — app shell, providers, and router
  - `components/` — UI primitives and layout components
  - `features/` — feature modules (auth, sessions, exams, etc.)
  - `lib/` — lightweight service and helper modules
  - `hooks/` — local hooks
  - `mocks/` — mock data for development
  - `styles/` — global styles
  - `types/` — shared TypeScript types

### How to run

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

### Available scripts

- `dev` — Start Vite dev server
- `build` — Build production bundles
- `preview` — Preview built app
- `lint` — Run linter
- `test` — Run tests (if configured)

### Key features

- Authentication and role-based routes
- Session management and attendance
- Exam creation and participation
- Messaging between users
- Admin analytics and revenue views

### Architecture (brief)

This project follows a pragmatic feature-sliced approach:

- `app/` contains the application shell, global providers, and router.
- `features/` groups feature-specific pages and components.
- `components/` holds UI primitives and layout components shared across features.
- `lib/` contains domain helpers and lightweight services.

This structure keeps features isolated and makes the codebase easier to scale and maintain.

---

خلاصه فارسی

این پروژه یک سامانه‌ی مدیریت دانش‌آموزان است که با React و TypeScript و ابزارهای مدرن ساخته شده است. ساختار پروژه مبتنی بر جداسازی بر مبنای ویژگی (feature-sliced) است تا مقیاس‌پذیری و نگهداری کد ساده‌تر شود. برای اجرای پروژه از `npm run dev` استفاده کنید و برای تولید بسته‌ی نهایی `npm run build` را اجرا کنید.

ویژگی‌های کلیدی شامل تأیید هویت، مدیریت جلسات و حضور و غیاب، آزمون‌سازی، پیام‌رسانی و داشبوردهای آماری برای مدیران است.

---
