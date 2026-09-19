# Data Model Audit

## Actual state

No executable database model exists: no Prisma schema, migrations, SQL, repository layer, or database-backed test fixture was found. `/backend` contains only `README.md`. The entities below are confirmed needs because current TypeScript contracts and pages already exchange them; they are not evidence of persisted tables.

The legacy sketch in `docs/new/database-design.md:5-39` is **outdated**: it models one `User.role` (`teacher | student | parent | admin`) and direct `Student.teacherId/parentId`. Current auth uses five independent personas, six organization roles plus custom roles, and the term `guardian` (`frontend/src/services/auth/client.ts:33-61`).

## Identity and authorization

| Entity / relationship | Confirmed source | Boundary / important fields | Missing constraint or mismatch | Task |
| --- | --- | --- | --- | --- |
| User | auth session/client | global identity, phone/status | unique normalized phone; lifecycle; no single role enum | TASK-003 |
| PersonaGrant | persona switch/session | user ↔ persona, activation/status | granted/active uniqueness; switch audit | TASK-003 |
| DeviceSession | security/session UI | user, refresh family, expiry/revocation | token hashing, rotation, replay prevention | TASK-003 |
| Organization | org client/dashboard | tenant root, lifecycle/status | stable tenant key; owner invariant; soft-delete policy | TASK-002, TASK-007 |
| Membership | org members/auth context | user ↔ organization ↔ role | unique active membership; tenant FK; invite acceptance rules | TASK-005, TASK-007 |
| Role / Permission / Grant | roles client/capability engine | built-in/custom role and versioned key | two incompatible vocabularies; deny unknown keys | TASK-004 |
| AuditEvent | admin/audit UI | actor, target, command, before/after, tenant | immutable append-only record and correlation ID | TASK-002, TASK-006 |

## Academic model

| Entity / relationship | Confirmed source | Tenant/data scope | Missing constraint or workflow field | Task |
| --- | --- | --- | --- | --- |
| StudentProfile | students clients/views | user and organization membership | identity/profile separation; unique org student identifier | TASK-008 |
| GuardianRelationship | guardian client/dashboard | guardian user ↔ student | status/consent/effective dates; unique pair | TASK-008 |
| Subject, Course, Class | academic clients/routes | organization; teacher assignments | stable slugs/codes; archive semantics; term boundaries | TASK-009 |
| TeacherAssignment | required by current roles/classes | teacher membership ↔ class/course | effective dates; uniqueness; assignment-derived scope | TASK-005, TASK-009 |
| Enrollment | enrollments client | student ↔ class/course/term | unique active enrollment; validated state transitions/transfer transaction | TASK-009 |
| Session | sessions client | class/teacher/organization | time-range validity; cancellation/version | TASK-010 |
| AttendanceRecord | attendance UI in sessions | session ↔ enrolled student | unique session/student; roster FK; correction audit | TASK-010 |
| Assignment | assignments client | class/teacher | publish/due/version state; audience | TASK-011 |
| Submission | assignments client | assignment ↔ enrolled student/team | unique attempt/version; late/revision policy | TASK-011 |
| Grade / GradeRelease | gradebook client | subject item ↔ student | author, version, release timestamp; unique grade target | TASK-011 |
| Exam / Question / Attempt | exam/question-bank clients | class + assigned/enrolled actors | publish snapshot; attempt uniqueness; timing; grading/release | TASK-012 |

## Communication, finance, and marketplace

| Entity / relationship | Confirmed source | Boundary | Missing constraint | Task |
| --- | --- | --- | --- | --- |
| DomainEvent / Outbox | needed by cross-role flows | tenant + aggregate | atomic write/outbox, dedupe key, delivery attempts | TASK-013 |
| Notification / Delivery / Preference | notifications client | recipient user | unique event/channel recipient; read/delivery timestamps | TASK-013 |
| Conversation / Participant / Message | messaging/chat clients | authorized relationship/thread | participant uniqueness, sender membership, retention | TASK-013 |
| TuitionCharge / Payment / LedgerEntry | tuition/billing clients | organization, payer, student | immutable balanced ledger; currency; idempotency; reconciliation | TASK-014 |
| Product / Variant | seller clients | seller ownership | SKU uniqueness, moderation/publish state, inventory version | TASK-015 |
| Cart / Order / OrderLine | marketplace clients | buyer ownership | price snapshot, idempotent checkout, transition constraints | TASK-015 |
| SellerBalance / Payout | balance client | seller ownership | ledger-derived balance, payout idempotency/status | TASK-015 |

## Tenant and object boundaries

Every tenant-owned row must carry or derive an immutable organization boundary, and every repository query must accept a server-derived policy scope rather than a browser-supplied organization/user ID. Student self, linked guardian, assigned teacher, finance, seller-owner, and platform-admin scope require different predicates. Foreign keys alone are insufficient; negative cross-tenant and unrelated-object tests are required (TASK-005).

## Nullable/lifecycle decisions that block implementation

- Membership, enrollment, guardian relationship, teacher assignment, publish/release, cancellation, and soft deletion need explicit states and effective timestamps.
- A person may exist before a persona is activated; nullable profile links must not imply authorization.
- Grades/results must distinguish draft from released state; absence/notification/payment events need durable timestamps.
- Money fields require integer minor units plus currency; no floating-point amount.
- Ownership transfer and tenant deletion require invariant-preserving transactions and immutable audit history.

No schema change should be implemented before TASK-002/003 freezes these boundaries and captures migrations plus constraint tests.
