📄 Product Requirements Document (PRD) — Solo Student Management System

1. Project Identity
   Full Project Name: Student Management System (to be confirmed)
   Brand Name: Solo
   Tagline: Managing your students has never been easier.
   Vision / Mission

The goal of this project is to build a platform that connects students, teachers, and parents in one unified system. It simplifies student management, enables parents to stay informed about their children's progress, and allows students to access online learning features to improve their academic performance through private tutoring.

Launch Timeline & Initial Market

The platform is planned to launch in approximately 1 month.
The initial target market is private tutors and independent teachers.

2. Business Goals & Success Metrics
   Main Business Objectives
   Better student evaluation
   Improved class management
   Structured student tracking and planning
   Increased teacher follow-up on students
   Increased parent engagement and tracking
   Ready-to-use exam system at all levels
   Multi-level term-based class structure
   Multi-subject teaching support per teacher
   Flexible scheduling system with conflict prevention
   Full academic history centralized in one platform
   Attendance tracking per session
   Homework assignment and tracking system
   Automated notifications (SMS/email)
   Online meeting integration (e.g., meeting links)
   Automated performance-based certificates per term
   Lesson plan creation per session
   Multi-class and multi-teacher management per student
   Teacher availability scheduling system
   Session history filtering (Jalali & Gregorian support)
   Teacher profile system (SEO optimized in Pro version)
   Smart ranking system for teachers based on performance
   KPIs
   Student score (defined per teacher scale)
   Monthly student progress (0–10)
   Session activity score (0–10)
3. Target Users & Personas
   Teachers
   Simplify student management
   Track grades and performance
   Manage attendance
   Create exams and lesson plans
   Send reminders to students/parents
   View schedules (daily/weekly/monthly)
   Avoid scheduling conflicts
   Manage multiple subjects
   Handle private/off-platform sessions
   Generate and manage assessments
   Communication with students/parents
   Financial tracking (optional)
   Pro profile management (SEO, media, files)
   Students
   View classes and schedules
   Take online exams
   Submit homework
   Track performance
   Download certificates
   Chat with teachers
   Parents
   Monitor student progress
   View schedules and exams
   Approve homework
   Communicate with teachers
   Switch between multiple children
   Admin / Support
   Full system control
   Manage users, classes, subjects
   Financial and analytics dashboard
   Role management
   Support chat system moderation
4. Features (Module Breakdown)
   Authentication & Users
   Teacher-led student registration
   OTP-based login system
   Role-based access control
   14-day free trial for teachers
   Subscription plans (Basic & Pro)
   Monthly / quarterly / yearly billing
   Classes & Scheduling
   Session creation with date/time
   Attendance tracking
   File uploads per session
   Meeting link integration
   Exam scheduling per student/class
   Internal chat per session
   Homework System
   Assignment creation per session
   File-based submission
   Teacher review and approval
   Parent visibility
   Exams System
   Timed exams
   Question bank
   Auto-grading (MCQ)
   Manual grading (descriptive)
   Score calculation system
   Term-based exams
   Notifications & Messaging
   SMS templates
   Automated reminders (class/exam)
   Payment reminders
   Teacher-controlled notification toggles
   Student Dashboard
   Class switcher
   Calendar view
   Homework list
   Exam results
   Performance analytics
   Session details
   Anti-cheating exam mode (restricted actions)
   Admin Panel
   Full CRUD for all entities
   Role management
   Financial tracking
   Analytics dashboard
   Subscription management
   Support chat moderation
   Integrations
   Payment gateways (Iranian providers)
   SMS panel providers
   Future: Zoom / meeting tools
5. Workflows
   Teacher onboarding → trial → student creation → class setup → exam creation → schedule management
   Teacher subscription activation → unlock full features
   Session flow: class → attendance → homework → follow-up
   Student login → OTP → class access → attendance → homework → exam → results
   Parent login → OTP → child selection → monitoring → communication
   Exam flow: start → complete → auto/manual grading → result display
6. Business Rules
   Each question must have a score
   Exams must be pre-created
   MCQ must define correct answer
   Homework tracking is mandatory per session
   Attendance required per class
   Pro version unlocks SEO profile & file system
   14-day trial limitation
   Anti-cheat restrictions in exams
   Admin has full override access
7. Privacy & Data
   All user data is private and protected
   No external usage allowed outside platform
   Role-based data access control enforced
8. Technical Stack
   Backend: NestJS
   Database: PostgreSQL
   Hosting: Linux server
9. Branding
   Brand: Solo
   Colors:
   Primary: oklch(0.72 0.14 240)
   Secondary: oklch(0.87 0.09 340)
   Warning: oklch(0.93 0.12 95)
   Danger: oklch(0.72 0.18 20)
   Disabled: oklch(0.93 0.005 240)
   Tone: Friendly with slight formality
10. Marketing
    14-day free trial
    Subscription plans (Basic & Pro)
    Target: private teachers (future schools)
    Competitive advantage: no dedicated Iranian platform for this niche
    Monetization: SaaS model
11. Investment
    Required: ~1 billion Toman
    Purpose: development, marketing, scaling
12. Documentation Format
    Bilingual (EN / FA)
    ⚠️ Frontend Scope Instruction (IMPORTANT)

Only update and extend frontend-related sections based on this PRD.

This includes:

UI/UX design system
Dashboard layouts (Teacher / Student / Parent / Admin)
Authentication flows (Login, OTP, Trial onboarding)
Component structure (tables, calendars, charts, forms)
State management (user roles, sessions, permissions)
Routing architecture (role-based routes)
Notification UI system
Calendar & scheduling UI
Exam interface (including anti-cheat UI behavior)
Homework submission interface
Messaging/chat UI
Subscription / billing UI
Teacher profile UI (Pro version features)
Responsive design strategy (mobile-first if needed)

❗ Do NOT change backend logic in this request — only frontend structure, UI, and UX layer.

# 📄 Product Requirements Document (PRD) — Solo Student Management System

---

## 1. Project Identity

- **Full Project Name:** Student Management System (to be confirmed)
- **Brand Name:** Solo
- **Tagline:** Managing your students has never been easier.

### Vision / Mission

The goal of this project is to build a platform that connects students, teachers, and parents in one unified system. It simplifies student management, enables parents to stay informed about their children's progress, and allows students to access online learning features to improve their academic performance through private tutoring.

### Launch Timeline & Initial Market

The platform is planned to launch in approximately **1 month**.  
The initial target market is **private tutors and independent teachers**.

---

## 2. Business Goals & Success Metrics

### Main Business Objectives

- Better student evaluation
- Improved class management
- Structured student tracking and planning
- Increased teacher follow-up on students
- Increased parent engagement and tracking
- Ready-to-use exam system at all levels
- Multi-level term-based class structure
- Multi-subject teaching support per teacher
- Flexible scheduling system with conflict prevention
- Full academic history centralized in one platform
- Attendance tracking per session
- Homework assignment and tracking system
- Automated notifications (SMS/email)
- Online meeting integration (e.g., meeting links)
- Automated performance-based certificates per term
- Lesson plan creation per session
- Multi-class and multi-teacher management per student
- Teacher availability scheduling system
- Session history filtering (Jalali & Gregorian support)
- Teacher profile system (SEO optimized in Pro version)
- Smart ranking system for teachers based on performance

### KPIs

- Student score (defined per teacher scale)
- Monthly student progress (0–10)
- Session activity score (0–10)

---

## 3. Target Users & Personas

### Teachers

- Simplify student management
- Track grades and performance
- Manage attendance
- Create exams and lesson plans
- Send reminders to students/parents
- View schedules (daily/weekly/monthly)
- Avoid scheduling conflicts
- Manage multiple subjects
- Handle private/off-platform sessions
- Communication with students/parents
- Pro profile management (SEO, media, files)

### Students

- View classes and schedules
- Take online exams
- Submit homework
- Track performance
- Download certificates
- Chat with teachers

### Parents

- Monitor student progress
- View schedules and exams
- Approve homework
- Communicate with teachers
- Switch between multiple children

### Admin / Support

- Full system control
- Manage users, classes, subjects
- Financial and analytics dashboard
- Role management
- Support chat moderation

---

## 4. Frontend Features & UI Modules

## 4.1 Authentication & Onboarding UI

- Teacher onboarding wizard
- OTP login UI
- Role-based UI rendering
- 14-day trial countdown UI
- Subscription upgrade screens (Basic / Pro)

---

## 4.2 Dashboard Layout System

### Teacher Dashboard

- KPI cards (students, progress, income)
- Calendar (daily / weekly / monthly)
- Class list with filters
- Quick actions (create class, exam, homework)
- Subject switcher
- Notifications panel

### Student Dashboard

- Schedule calendar
- Exams list
- Homework board
- Performance charts
- Class history
- Result viewer

### Parent Dashboard

- Child selector switcher
- Progress overview
- Calendar view
- Homework approval panel
- Exam tracking UI
- Messaging panel

### Admin Dashboard

- Full data tables (users, classes, payments)
- Analytics charts
- Role management UI
- Subscription management
- System logs

---

## 4.3 Scheduling & Calendar UI

- Drag & drop class scheduling
- Conflict detection UI
- Teacher availability selector
- Session detail modal
- Jalali + Gregorian toggle
- Filter by class / student / subject

---

## 4.4 Exams UI

- Exam builder interface
- Question types (MCQ / descriptive)
- Timer-based exam screen
- Anti-cheat fullscreen mode UI
- Auto-submit handler
- Result review page
- Score breakdown visualization

---

## 4.5 Homework UI

- Homework assignment creator
- File upload system
- Submission interface (image / text / file)
- Teacher review panel
- Parent approval status

---

## 4.6 Messaging & Notifications UI

- Chat system (teacher ↔ student ↔ parent)
- Session-based chat rooms
- SMS/email notification settings UI
- Reminder configuration panel

---

## 4.7 Teacher Profile (Pro Version UI)

- Public profile page
- SEO editor UI
- Media gallery uploader
- Video introduction section
- Articles/blog editor
- Student count & rating display

---

## 4.8 Subscription & Billing UI

- Plan comparison page
- Trial status banner
- Payment history page
- Upgrade flow UI
- Feature lock overlays

---

## 4.9 Component System

- Reusable tables (students, classes, exams)
- Calendar component
- Form system (react-hook-form / formik ready)
- Modal system
- Toast/notification system
- Role-based guards (UI-level)

---

## 4.10 State Management

- Auth state (role, session, trial)
- Scheduling state
- Exam state
- Homework state
- Notification state
- Subscription state

---

## 4.11 UX Rules

- Mobile-first responsive design
- Minimal clicks per action
- Role-based UI visibility
- Fast navigation (sidebar + shortcuts)
- Loading skeletons everywhere
- Offline-safe UI fallback

---

## 5. Workflows

- Teacher onboarding → trial → student creation → class setup → exam creation
- Subscription upgrade → unlock pro UI features
- Class flow: schedule → attendance → homework → report
- Student flow: login → view class → attend → homework → exam → results
- Parent flow: login → select child → monitoring → chat
- Exam flow: start → timer → submit → grading → results

---

## 6. Business Rules

- Each question has score
- Exams must be pre-created
- MCQ requires correct answer
- Homework per session required
- Attendance per session required
- Pro features locked behind subscription
- Trial lasts 14 days
- Anti-cheat UI restrictions in exams
- Admin has full override access

---

## 7. Privacy & Data

- All data is private
- Role-based access control enforced
- No external usage of student data

---

## 8. Technical Stack

- Backend: NestJS
- Database: PostgreSQL
- Server: Linux
- Frontend: React / Next.js (recommended)

---

## 9. Branding

- Brand: Solo
- Primary: oklch(0.72 0.14 240)
- Secondary: oklch(0.87 0.09 340)
- Warning: oklch(0.93 0.12 95)
- Danger: oklch(0.72 0.18 20)
- Disabled: oklch(0.93 0.005 240)
- Tone: Friendly, slightly formal

---

## 10. Marketing

- 14-day free trial
- Subscription-based SaaS
- Target: private teachers
- Future: schools & institutes
- Competitive advantage: niche-focused platform

---

## 11. Investment

- Required: ~1 billion Toman
- Purpose: development, marketing, scaling

---

## 12. Documentation Format

- Bilingual (EN / FA)

---

## ⚠️ Frontend Scope Rule (IMPORTANT)

Only update and extend **frontend-related sections** based on this PRD.

### Includes:

- UI/UX design system
- Dashboard layouts (Teacher / Student / Parent / Admin)
- Authentication flows (OTP, onboarding, trial)
- Calendar & scheduling UI
- Exam UI (including anti-cheat system)
- Homework UI
- Messaging/chat UI
- Subscription & billing UI
- Teacher Pro profile UI
- Component architecture
- Routing strategy (role-based)
- State management (frontend only)

### Strict Rule:

❌ Do NOT modify backend logic  
✔ Only implement UI/UX, frontend structure, and client-side behavior
