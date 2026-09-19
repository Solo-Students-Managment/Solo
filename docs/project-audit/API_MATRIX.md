# API Matrix

There are **zero implemented Next.js `route.ts` handlers** and no backend controllers. Rows below are typed frontend contracts intercepted by MSW in local development; `Status: CONTRACT_ONLY` does not mean an endpoint is deployed.

| Endpoint / action family | Method(s) | Consumers | Auth / role / data scope required | Validation today | Status | Related pages | Task |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/api/auth/*` login, OTP, session, switch context | POST/GET | Auth views, home | Public for challenge; authenticated grant for switch | Zod/client mock | CONTRACT_ONLY / unsafe switch | `/auth/*`, `/` | TASK-003 |
| `/api/organizations/*` | GET/POST/PATCH | Organization creation/dashboard | Session + tenant membership; owner for lifecycle | Typed client parsers | CONTRACT_ONLY | `/org/new`, `/org/[orgId]` | TASK-002, TASK-005, TASK-007 |
| `/api/organizations/:orgId/members/*` | GET/POST/PATCH | Members, invites | `org.members.*`, tenant scope | Typed client/mock | CONTRACT_ONLY | org members/roles | TASK-007 |
| `/api/organizations/:orgId/roles/*` | GET/POST/PATCH/DELETE | Role editor | role-management capability; deny unknown keys | Typed client; incompatible registry | CONTRACT_ONLY | org roles | TASK-004, TASK-007 |
| `/api/organizations/:orgId/students/*` | GET/POST/PATCH | Student management | tenant + assigned/read scope | Typed client/mock | CONTRACT_ONLY | org students | TASK-005, TASK-008 |
| `/api/guardians/*` relationships | GET/POST | Dashboards, link flow | self or linked-child relationship | Typed client/mock | CONTRACT_ONLY | guardian dashboard, student detail | TASK-008 |
| `/api/organizations/:orgId/courses/*` and classes | GET/POST/PATCH | Academic consoles | academic capability + tenant/assignment | Typed client/mock | CONTRACT_ONLY | courses/classes | TASK-009 |
| `/api/organizations/:orgId/enrollments/*` | GET/POST/PATCH | Enrollment console | academic capability; student self read | Some transition checks in mock | CONTRACT_ONLY | enrollments | TASK-009 |
| `/api/organizations/:orgId/sessions/*` | GET/POST/PATCH | Sessions/attendance | assigned class/tenant scope | Typed client/mock | CONTRACT_ONLY | sessions/attendance | TASK-010 |
| `/api/organizations/:orgId/assignments/*` and submissions | GET/POST/PATCH | Assignment/grade flows | assigned teacher; enrolled student self | Zod/client mock | CONTRACT_ONLY | assignments, future student pages | TASK-011 |
| `/api/organizations/:orgId/gradebook/*` | GET/PUT | Gradebook | assigned teacher; release-gated self/linked read | Typed client/mock | CONTRACT_ONLY | gradebook | TASK-011 |
| `/api/organizations/:orgId/exams/*` and attempts | GET/POST/PATCH | Exam authoring | separate author/publish/grade/attempt permissions | Typed client; UI uses wrong gate | CONTRACT_ONLY | exams, future student exam | TASK-012 |
| `/api/notifications/*` | GET/PATCH | Center/header | authenticated recipient only | Typed client/mock | CONTRACT_ONLY | `/personal/notifications` | TASK-013 |
| `/api/messages/*`, `/api/chat/*` | GET/POST | Messaging/chat | authorized relationship/thread participant | Typed client/mock | CONTRACT_ONLY | personal messages/chat | TASK-013 |
| `/api/tuition/*`, billing, checkout, invoices | GET/POST/PATCH | Finance/owner/guardian | finance write; payer/self read; idempotency | Client schemas only | CONTRACT_ONLY / money risk | org billing/tuition/checkout | TASK-014 |
| `/api/marketplace/*`, seller products/orders/balance | GET/POST/PATCH | Public buyer/seller | public read; seller ownership; buyer order scope | Typed client/mock | CONTRACT_ONLY | public + seller pages | TASK-015 |
| `/api/admin/*` users/support/incidents/flags/storage | GET/POST/PATCH | Admin views | verified `admin.*` only; audit every mutation | Client schemas only | CONTRACT_ONLY / wrong UI gates | `/admin/*` | TASK-006 |
| marketplace moderation approve/reject | POST/PATCH | Moderation view | `admin.marketplace.moderate` | Session check only in UI | CONTRACT_ONLY / UNPROTECTED DESIGN | `/admin/marketplace-moderation` | TASK-006, TASK-015 |
| `/api/reports/*`, analytics/export | GET/POST | Org/admin/finance/teacher | scoped aggregate + export filters | Mock values | CONTRACT_ONLY | reports/dashboards | TASK-019 |
| Realtime/WS presence/chat | socket contract | Chat/presence | authenticated channel membership | Contract only | MISSING SERVER | personal chat/presence | TASK-013 |

## Unused/unprotected endpoint conclusion

Because no server is implemented, no endpoint can be described as protected. Static discovery of URL strings cannot prove deployability. Every future controller must validate server-derived actor, active persona, organization membership, object ownership/relationship, input schema, and idempotency where commands are repeatable.
