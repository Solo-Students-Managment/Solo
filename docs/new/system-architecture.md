# System Architecture — SOLO

## 1. Tech Stack

### Backend

- NestJS (Modular architecture)
- PostgreSQL
- Redis (queues + cache)

### Frontend

#### App Layer

- React.js (Teacher / Student / Parent / Admin panels)
- TanStack Router

#### Public Layer

- Next.js (SEO + marketplace + profiles)

---

## 2. Architecture Style

Hybrid Enterprise SaaS:

- Multi-layer architecture
- Multi-role RBAC system
- Multi-tenant ready (future schools)

---

## 3. System Modules

- Auth System (OTP + Role-based access)
- User Management
- Class Management
- Exam Engine
- Assignment System
- Messaging System
- Notification Engine
- Payment System
- Analytics Engine

---

## 4. Communication Flow

- REST API (main)
- WebSocket (chat + live updates)
- Queue system (notifications, SMS)

---

## 5. Separation Strategy

### Frontend Split

- Next.js → Public SEO system
- React App → Private dashboard system

---

## 6. Scalability Design

- Stateless backend
- Horizontal scaling ready
- Modular NestJS domains
- Event-driven architecture for notifications
