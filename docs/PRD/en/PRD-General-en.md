# PRD: Student Management System — General (English)

## Purpose

A concise product requirements document for the Student Management System (SMS). This doc presents primary goals, user personas, success metrics, constraints, and high-level functional requirements.

## Executive Summary

The SMS enables schools and tutoring centers to manage students, sessions, attendance, exams, messaging, and administrative analytics from one interface. The product targets teachers, parents, students, and administrators.

## Personas

- Administrator: manages users, revenue, analytics.
- Teacher: creates sessions, exams, and reviews student work.
- Parent: views student progress and approves homework.
- Student: attends sessions, completes homework and exams.

## High-level goals

- Streamline session management and attendance tracking.
- Provide a lightweight exam workflow for assignments and timed exams.
- Enable two-way messaging between users.
- Provide admin analytics and revenue tracking.

## Core features

- Authentication & role-based access
- Session creation, scheduling, and attendance
- Homework assignment and parent approvals
- Exam creation, distribution, and grading
- Messaging and chat threads
- Admin dashboards and revenue reports

## Non-functional requirements

- Responsive web UI
- Accessibility basics (WCAG 2.1 AA)
- Data privacy and role-based access control
- Performance: 95th percentile page load < 1s on decent connections

## Success metrics

- Time-to-create session < 2 minutes
- Daily active teachers > X in pilot
- Average attendance rate > 75%

## Constraints and assumptions

- Initial MVP uses mock/stubbed backend for demos
- Authentication via email/password (expandable to SSO later)

## Acceptance criteria

- End-to-end happy path for session creation, attendance, and reporting
- Role-based access enforced across routes
