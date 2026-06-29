# PRD: Solo Frontend — Complete (English)

## 1. Overview

Solo is a Persian-first student management platform built for private teachers and online tutoring. This frontend product requirements document focuses on the app layer: the React + TypeScript + Vite dashboard experience for Teacher, Student, Parent, and Admin roles.

The frontend should present a polished, scalable, RTL-friendly dashboard architecture with strong role-based routing, reusable UI components, responsive behavior, and ready-to-integrate service layers.

## 2. Vision

Provide a unified digital workspace where private tutors can manage their students, sessions, attendance, homework, exams, and parent communication, while students and parents receive clear progress reports in Persian.

## 3. Scope

### In scope

- Frontend architecture and folder structure
- Role-based authentication and route protection
- Dashboard UI for Teacher, Student, Parent, and Admin
- Sessions, attendance, homework, exam, messaging, and analytics screens
- RTL support and Persian interface text
- Mock data services for demonstration and early validation
- Production-ready build config, README, and documentation

### Out of scope

- Backend NestJS code and API implementation
- Real database persistence
- WebSocket real-time messaging
- File upload and payment provider integration
- Enterprise multi-tenant school administration module

## 4. User Roles

### Teacher

Primary capabilities:

- View personal classroom dashboard
- Manage student list and session plans
- Create mock sessions and exam flows
- Review attendance, homework, and exam summaries
- Communicate with parents and students

### Student

Primary capabilities:

- View own study progress and session history
- Access upcoming sessions and exam status
- Read assigned homework and performance summary
- Review teacher feedback and scores

### Parent

Primary capabilities:

- Monitor child progress and attendance
- Review session summaries and homework status
- View exam and performance reports
- Access child-specific dashboards and messages

### Admin

Primary capabilities:

- View aggregate school metrics
- Inspect revenue-like summary cards and KPIs
- Review top student ranking and attendance trends
- Track overall usage and engagement from a system perspective

## 5. Functional Requirements

### Authentication & Routing

- `LoginPage` with username/password entry
- Mock validation using hardcoded demo users
- Persist authenticated session in `sessionStorage`
- Redirect authenticated users away from login
- Protect dashboard routes with role-based access control
- Block unauthorized routes and redirect to the correct dashboard

### Dashboard Shell

- RTL sidebar and top header
- Role badge and current page label
- Responsive mobile drawer behavior
- Shared layout wrapper for all authenticated routes
- Main content area with card-based panels

### Session Management

- Session list page with filters and role-specific views
- Session detail page showing attendance, homework, participation, and teacher evaluation
- Teacher session creation form as UI mock experience
- Display Persian dates, class topics, and attendance badges

### Attendance & Progress

- Student/parent attendance summary cards
- Attendance rate visualization and status badges
- Progress chart for recent sessions
- Average score and performance summary

### Exams & Assignments

- Exam listing and detail screens
- Student exam progress page and take-exam flow
- Score tags, question summaries, and result states
- Homework and task tracking sections in session details

### Messaging

- Message thread preview for parent and teacher roles
- Static conversation list with Persian date labels
- Read-only thread view for Phase 1

### Admin Analytics

- KPI cards for attendance, homework completion, and active users
- Charts for monthly progress and attendance trends
- Student ranking table and revenue simulation

### UI/UX

- Persian-first copy and RTL support
- Brand-relevant tone: clean, modern, warm, and professional
- Card-based dashboard design with soft shadows and rounded corners
- Focus styles for accessibility
- Responsive behavior for mobile and desktop

### Data and Mock Services

- Mock domain services under `src/mocks/`
- Helpers in `src/lib/` for formatting, route metadata, and mock data access
- Types in `src/types/` defining core entities and session models
- `useMockData` hook to expose role-specific mock data

## 6. Non-functional Requirements

- Modern React 19 + TypeScript + Vite stack
- Tailwind CSS v4 with theme tokens and consistent spacing
- `@/` alias for scalable imports
- Fast production build and preview scripts
- Clean `README.md` with frontend-focused onboarding
- RTL-ready HTML and Persian fonts
- Maintainable folder structure and barrel exports
- Build without TypeScript or Vite errors

## 7. UI Architecture

### Folder structure

- `src/app/` — app shell, router, providers
- `src/components/layout/` — shell and navigation components
- `src/components/ui/` — reusable UI primitives
- `src/features/` — feature-specific page and component modules
- `src/hooks/` — shared React hooks
- `src/lib/` — helper functions and domain utilities
- `src/mocks/` — mock data and seed helpers
- `src/types/` — shared TypeScript entity definitions

### Routing

- `/login` — public authentication page
- `/dashboard` — role home pages
- `/dashboard/sessions` — session list
- `/dashboard/sessions/:id` — session details
- `/dashboard/attendance` — student/parent attendance
- `/dashboard/messages` — parent/teacher messaging preview
- `/dashboard/students` — teacher student list
- `/dashboard/admin/*` — admin analytics

## 8. Success Criteria

- Role-based routing works for all demo users
- Mock dashboard displays for Teacher, Student, Parent, and Admin
- RTL layout renders correctly on desktop and mobile
- Build passes successfully with Vite and TypeScript
- Documentation exists in `docs/PRD/`
- Frontend structure is clearly organized and maintainable

## 9. Deliverables

- `docs/PRD/PRD-Frontend-Complete-en.md`
- `docs/PRD/PRD-Frontend-Complete-fa.md`
- Updated root `README.md` with frontend summary
- Improved route protection and app documentation
- Barrel index files for UI, layout, and providers
