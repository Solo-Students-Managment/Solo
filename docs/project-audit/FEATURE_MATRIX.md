# Feature Matrix

This is the intended least-privilege matrix reconciled from PRDs, personas, org-role templates and existing routes. Current implementation is shown in parentheses: **M** mock/partial, **X** missing, **!** unsafe/inconsistent.

| Feature | Admin Solo | Org Owner | Manager | Academic Manager | Org Teacher | Finance | Support Staff | Teacher Persona | Student | Guardian | Seller |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Platform users/support | Manage (M/!) | — | — | — | — | — | — | — | — | — | — |
| Tenant members/roles | Oversight (X) | Manage (M/!) | Manage limited (M/!) | View (M/!) | View limited (M/!) | View limited (M/!) | View limited (M/!) | — | — | — | — |
| Organization settings/lifecycle | Oversight (M) | Manage (M/!) | Limited (X) | — | — | — | — | — | — | — | — |
| Students/guardians | Oversight (X) | Manage (M/!) | Manage (M/!) | Manage (M/!) | Assigned view (X) | Financial identity only (X) | Safe directory only (X) | Assigned view (X) | Self (X) | Linked children (X) | — |
| Subjects/courses/classes | Oversight (X) | Manage (M/!) | Coordinate (M/!) | Manage (M/!) | Assigned (X) | — | — | Assigned (X) | Enrolled (X) | Child view (X) | — |
| Enrollments | Oversight (X) | Manage (M/!) | Manage (M/!) | Manage (M/!) | View assigned (X) | — | — | View assigned (X) | Self (X) | Child (X) | — |
| Sessions/calendar | Oversight (X) | Manage (M/!) | Coordinate (M/!) | Manage (M/!) | Run assigned (X) | — | Support only (X) | Run assigned (X) | Join/view (X) | Child view (X) | — |
| Attendance | Oversight (X) | Manage/report (M/!) | Report (M/!) | Manage/report (M/!) | Mark assigned (X) | — | — | Mark assigned (X) | Self (X) | Child (X) | — |
| Assignments/submissions | Oversight (X) | Manage/report (M/!) | View (M/!) | Manage (M/!) | Author/review (X) | — | — | Author/review (X) | Submit (X) | Approve/view (X) | — |
| Gradebook/evaluations | Oversight (X) | Manage/report (M/!) | View aggregate (X) | Manage/release (M/!) | Grade assigned (X) | — | — | Grade assigned (X) | Released self (X) | Released child (X) | — |
| Exams/question bank | Oversight (X) | Manage/report (M/!) | View aggregate (X) | Manage/publish (M/!) | Author/grade (X) | — | — | Author/grade (X) | Attempt/result (X) | Released child (X) | — |
| Messaging/chat | Support mode (X) | Scoped (M) | Scoped (M) | Scoped (M) | Assigned (X) | Scoped (X) | Scoped (X) | Assigned (X) | Assigned (X) | Assigned (X) | Buyer threads (X) |
| Notifications | Platform queues (X) | Tenant alerts (X) | Ops alerts (X) | Academic alerts (X) | Class alerts (X) | Finance alerts (X) | Task alerts (X) | Teaching alerts (X) | Learning alerts (X) | Child alerts (X) | Commerce alerts (X) |
| Tuition | Oversight/report (X) | Manage (M/!) | Limited (X) | View status (X) | — | Manage (M/!) | — | — | Self read (X) | Child/pay (X) | — |
| Subscription/billing | Manage catalog/report (M/!) | Manage (M) | — | — | — | Manage (M/!) | — | Own plan (M) | — | — | Fees/balance (M) |
| HR/operations | Oversight (X) | Manage (M/!) | Manage (M/!) | Academic subset (X) | Own records (X) | — | Tasks/directory (M/!) | — | — | — | — |
| Reports/exports | Platform (M/!) | Tenant (M/!) | Ops (M/!) | Academic (M/!) | Assigned classes (X) | Finance (X) | Task/SLA (X) | Assigned classes (X) | Self (X) | Child (X) | Sales (M) |
| Files/resources | Administer (M/!) | Manage (M/!) | Manage (M/!) | Academic manage (M/!) | Assigned (X) | Invoice docs (M) | Safe subset (M) | Assigned (X) | Download (X) | Child view (X) | Product assets (M) |
| Marketplace moderation | Manage (M/!) | — | — | — | — | — | — | — | Buyer (M) | Buyer (M) | Seller side (M/!) |
| Profile/security/settings | Own + platform (M) | Own + tenant (M/X) | Own + delegated (M/X) | Own + academic (M/X) | Own (M/X) | Own (M/X) | Own (M/X) | Own (M) | Own (M) | Own (M) | Own + seller (M/X) |

## Policy finding

The matrix cannot be implemented safely with the current 15 capability keys. The role-template service contains a second vocabulary (`courses.manage`, `exams.manage`, `directory.view`, `tasks.manage`, etc.) that the effective-capability engine does not evaluate. Unify this before building additional panels.
