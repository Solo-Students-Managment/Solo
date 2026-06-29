# API Specification — SOLO

## 1. Auth APIs

POST /auth/login  
POST /auth/verify-otp  
POST /auth/register

---

## 2. User APIs

GET /users/me  
GET /users/:id  
PATCH /users/:id

---

## 3. Class APIs

POST /classes  
GET /classes  
GET /classes/:id  
PATCH /classes/:id

---

## 4. Session APIs

POST /sessions  
GET /sessions  
PATCH /sessions/:id/attendance

---

## 5. Assignment APIs

POST /assignments  
GET /assignments  
PATCH /assignments/:id

---

## 6. Exam APIs

POST /exams  
GET /exams  
POST /exams/:id/submit

---

## 7. Messaging APIs

POST /messages  
GET /messages/:threadId

---

## 8. Payment APIs

POST /payments/checkout  
GET /payments/history

---

## 9. Public APIs (Next.js)

GET /public/teachers  
GET /public/teachers/:slug
