# Database Design — SOLO

## 1. Core Entities

### Users

- id
- name
- phone
- role (teacher | student | parent | admin)
- status
- createdAt

---

### Teacher Profile

- userId
- bio
- subjects
- rating
- subscriptionStatus
- seoData

---

### Student

- userId
- teacherId
- parentId
- gradeLevel

---

### Parent

- userId
- students[]

---

### Class

- id
- teacherId
- subject
- schedule
- status

---

### Session

- id
- classId
- date
- attendance[]
- meetingLink

---

### Assignment

- id
- sessionId
- studentId
- content
- status

---

### Exam

- id
- classId
- type (quiz / descriptive)
- questions[]
- schedule

---

### Payment

- id
- userId
- planId
- status
- amount

---

### Message

- id
- senderId
- receiverId
- content
- type

---

## 2. Relationships

- Teacher → Students (1:N)
- Parent → Students (1:N)
- Teacher → Classes (1:N)
- Class → Sessions (1:N)
- Session → Assignments (1:N)
