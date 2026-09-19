# Action Matrix

Legend: `R` read, `C` create, `U` update, `D` destructive/archive, `A` approve/publish, `S` self/linked/assigned scope, `—` prohibited. Values describe intended least privilege derived from existing workflows; current backend enforcement is absent for every row.

| Entity / action | Owner | Manager | Academic Mgr | Org Teacher | Finance | Support | Student | Guardian | Admin | Seller | UI status | Backend check | Task |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Organization settings / R,U | R,U | delegated | — | — | — | — | — | — | platform support only | — | Settings dead label | MISSING | TASK-007, TASK-016 |
| Membership / invite, role, offboard | C,R,U,D | delegated C,R,U | R | R assigned peers | — | R directory | — | — | support/audit only | — | Mock partial | MISSING | TASK-007 |
| Custom roles / CRUD | C,R,U,D | delegated | — | — | — | — | — | — | audit only | — | Mock editor, mismatched keys | MISSING | TASK-004, TASK-007 |
| Students / CRUD, guardian link | C,R,U,D | C,R,U | C,R,U | R assigned | — | limited directory | R self | R linked child | audited support | — | Org mock UI | MISSING | TASK-008 |
| Courses/classes / CRUD, assign | C,R,U,D | delegated | C,R,U,D | R assigned | — | — | R enrolled | R linked child | — | — | Mock partial | MISSING | TASK-009 |
| Enrollment / create, transition, transfer | A | delegated | C,R,U,A | R assigned | — | — | R self | R linked | — | — | Mock partial | MISSING | TASK-009 |
| Sessions / schedule, edit, cancel | A | delegated | C,R,U,D | C,R,U,D assigned | — | — | R enrolled | R linked | — | — | Mock create/list/detail | MISSING | TASK-010 |
| Attendance / mark, correct, view | A | delegated | C,R,U | C,R,U assigned | — | — | R self | R linked | — | — | Free-text mock form | MISSING | TASK-010 |
| Assignments / author, publish | A | delegated | C,R,U,A | C,R,U,A assigned | — | — | R enrolled | R linked | — | — | Staff mock only | MISSING | TASK-011 |
| Submission / submit, review, revise | R | — | R | R,U assigned | — | — | C,R,U self | R linked if allowed | — | — | Mock service, missing consumer panel | MISSING | TASK-011 |
| Grade / upsert, release, view | A | — | R,A | C,R,U,A assigned | — | — | R self after release | R linked after release | audit only | — | Staff mock, free-text student | MISSING | TASK-011 |
| Exam / author, publish, attempt, grade | A | delegated | C,R,U,A | C,R,U,A assigned | — | — | attempt self | R linked result | audit only | — | Staff mock only; wrong gate | MISSING | TASK-012 |
| Notification / read, preferences | S | S | S | S | S | S | S | S | S | S | Static mock center; bell dead | MISSING | TASK-013 |
| Message/chat / send, read | tenant scope | tenant scope | academic scope | assigned scope | finance threads | assigned cases | self threads | linked-child threads | abuse/support scope | order threads | Mock/off-nav | MISSING | TASK-013 |
| Tuition / record, reconcile, pay | R | delegated R | — | — | C,R,U,A | — | R self | pay/R linked | audit/support | — | Memory-only mocks | MISSING | TASK-014 |
| Product / author, moderate, publish | — | — | — | — | — | — | buyer R | buyer R | moderate A | C,R,U,D own | Mock; moderation session-only | MISSING | TASK-006, TASK-015 |
| Order / purchase, fulfill, refund | — | — | — | — | finance reports | support cases | buyer S | payer S | dispute/audit | fulfill own | Disconnected mocks | MISSING | TASK-015 |
| Report/export / read, export | tenant all | delegated | academic | assigned classes | finance | limited ops | self | linked | platform aggregates | seller own | Mock exports | MISSING | TASK-019 |

Unknown permission strings must deny. Browser visibility must be derived from the same policy decisions as direct API authorization (TASK-004 and TASK-005).
