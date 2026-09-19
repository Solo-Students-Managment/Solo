# Traceability Matrix

Status is end-to-end, not page existence.

| Capability | Navigation | Page | API | Service | DB | Permission | Tests | Status | Task |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Login/session/persona switch | Public + home | Exists | Contract/MSW | Auth client | None | Browser/mock grant | Unit/E2E mock | MOCKED / unsafe | TASK-001, TASK-003 |
| Organization membership/roles | Flat org nav | Exists | Contract/MSW | Members/roles clients | None | Two vocabularies | Mock slice tests | BROKEN | TASK-004, TASK-007 |
| Student + guardian linking | Org nav; guardian dashboard | Staff pages + counters | Contract/MSW | Students/guardian | None | Broad `students.manage` | Mock tests | PARTIAL | TASK-005, TASK-008 |
| Course/class/enrollment | Flat org nav | Staff pages | Contract/MSW | Academic clients | None | Broad/wrong gate | Mock E2E | PARTIAL | TASK-009 |
| Session + attendance | Flat org nav | Staff pages | Contract/MSW | Sessions client | None | Broad gate; no assignment scope | Mock E2E | PARTIAL | TASK-010 |
| Assignment → submission → grade | Staff only | Consumer pages missing | Contract/MSW | Assignments/gradebook | None | Broad gate; no release scope | Slice tests only | BROKEN | TASK-011 |
| Exam → attempt → result | Staff only | Student attempt missing | Contract/MSW | Exams/question bank | None | `exams.publish` unused | Slice tests only | BROKEN | TASK-012 |
| Notification deep link | Bell has no action | Center exists/off-nav | Contract/MSW | Notifications | None | Recipient policy absent | Static mock tests | BROKEN | TASK-013 |
| Messaging/chat | Not in primary nav | Exists | Contract/MSW/socket contract | Messaging/chat | None | Relationship policy absent | Mock tests | PARTIAL | TASK-013 |
| Tuition/payment | Flat org nav | Finance-like pages | Contract/MSW | Tuition/billing | None | Mixed broad gates | Mock tests | MOCKED / unsafe for money | TASK-014 |
| Marketplace seller → moderation → order → payout | Off-nav/orphan | Multiple disconnected pages | Contract/MSW | Marketplace clients | None | Seller key absent; moderation session-only | Mock slices | BROKEN | TASK-006, TASK-015 |
| Admin operations | Admin sidebar | 11 pages | Contract/MSW | Admin clients | None | `students.manage` browser gate | Mock smoke tests | PERMISSION_RISK | TASK-006 |
| Policy-derived role navigation | Hardcoded/flat | Routes exist unevenly | Session contract only | Capability engine + role templates | None | Inconsistent | No matrix test | BROKEN | TASK-004, TASK-016 |
| Role dashboards | Shell links | Counters/generic dashboard | Contract/MSW | Role/org clients | None | Client-only/incomplete | Smoke tests | MOCKED | TASK-017–TASK-020 |
| Reports/export | Org/admin links | Exists | Contract/MSW | Reports/analytics | None | Scope incomplete | Mock tests | MOCKED | TASK-019 |
| Route loading/error/state | N/A | 1 of 4 state pages | N/A | N/A | N/A | No middleware | Limited a11y smoke | MISSING | TASK-022 |

No row is `COMPLETE`; every important capability stops before an authoritative API/database/permission column.
