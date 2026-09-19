# Routes Matrix

Audit snapshot: 2026-09-19. Canonical inventory is every `frontend/src/app/**/page.tsx` file. “Permission” describes the implemented browser check, not production authorization; no route has a backend guard or middleware. All user-facing routes are mock-backed.

| Route | Page/View | Role | Permission | Sidebar | Status |
| --- | --- | --- | --- | --- | --- |
| `/admin/announcements` | AdminAnnouncementsView | Admin Solo | `students.manage` (client) | Yes | ⚠️ Problem |
| `/admin/audit` | AdminAuditView | Admin Solo | `students.manage` (client) | Yes | ⚠️ Problem |
| `/admin/feature-flags` | AdminFeatureFlagsView | Admin Solo | `students.manage` (client) | Yes | ⚠️ Problem |
| `/admin/incidents` | AdminIncidentsView | Admin Solo | `students.manage` (client) | Yes | ⚠️ Problem |
| `/admin/marketplace-moderation` | MarketplaceModerationView | Admin Solo | Session only (client) | No | ⚠️ Problem |
| `/admin` | AdminDashboardView | Admin Solo | `students.manage` (client) | Yes | ⚠️ Problem |
| `/admin/privacy` | AdminPrivacyView | Admin Solo | `students.manage` (client) | Yes | ⚠️ Problem |
| `/admin/storage` | AdminStorageView | Admin Solo | `students.manage` (client) | Yes | ⚠️ Problem |
| `/admin/support` | AdminSupportView | Admin Solo | `students.manage` (client) | Yes | ⚠️ Problem |
| `/admin/users` | AdminUsersView | Admin Solo | `students.manage` (client) | Yes | ⚠️ Problem |
| `/admin/verification` | AdminVerificationView | Admin Solo | `students.manage` (client) | Yes | ⚠️ Problem |
| `/auth/login` | Suspense | Public | Public/mock | N/A | 🟡 Partial |
| `/auth/otp` | Suspense | Public | Public/mock | N/A | 🟡 Partial |
| `/auth/recover` | Suspense | Public | Public/mock | N/A | 🟡 Partial |
| `/auth/reset` | Suspense | Public | Public/mock | N/A | 🟡 Partial |
| `/auth/signup` | Suspense | Public | Public/mock | N/A | 🟡 Partial |
| `/guardian/activate` | GuardianActivateForm | Guardian persona | `nav.guardian` on dashboard; inconsistent elsewhere | Global Home only | 🔴 Incomplete panel |
| `/guardian` | GuardianDashboardView | Guardian persona | `nav.guardian` on dashboard; inconsistent elsewhere | Global Home only | 🔴 Incomplete panel |
| `/org/[orgId]/add-ons` | Suspense | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/analytics` | OrganizationAnalyticsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/api-keys` | OrganizationApiKeysView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/approvals` | OrganizationApprovalsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/assignments` | OrganizationAssignmentsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/attendance` | OrganizationAttendanceView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/audit` | OrganizationAuditView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/automation` | OrganizationAutomationView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/billing` | Suspense | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/branches` | OrganizationBranchesView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/bulk-actions` | OrganizationBulkActionsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/cancel` | OrganizationCancellationView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/checkout` | Suspense | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/coupons` | Suspense | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/courses` | OrganizationCoursesView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/crm` | OrganizationCrmView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/curriculum` | OrganizationCurriculumView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/customization` | OrganizationCustomizationView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/data-ops` | OrganizationDataOpsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/departments` | OrganizationDepartmentsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/directory` | OrganizationPeopleDirectoryView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/employee-documents` | OrganizationEmployeeDocumentsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/enrollments` | OrganizationEnrollmentsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/evaluations` | OrganizationEvaluationsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/events` | OrganizationEventsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/exams` | OrganizationExamsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/facilities` | OrganizationFacilitiesView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/form-submissions` | OrganizationFormSubmissionsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/forms` | OrganizationFormsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/gradebook` | OrganizationGradebookView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/knowledge-base` | OrganizationKnowledgeBaseView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/leave` | OrganizationLeaveView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/lesson-plans` | OrganizationLessonPlansView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/lifecycle` | OrganizationLifecycleView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/manual-billing` | OrganizationManualBillingView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/members` | OrganizationMembersView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/offboarding` | OrganizationOffboardingView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/onboarding` | OrganizationOnboardingView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]` | Suspense | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/plan-change` | Suspense | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/plan-versions` | OrganizationPlanVersionsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/policies` | OrganizationPoliciesView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/positions` | OrganizationPositionsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/pricing` | OrganizationPricingView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/public-profile` | OrganizationPublicProfileSettingsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/question-bank` | OrganizationQuestionBankView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/reports` | OrganizationReportsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/resources` | OrganizationResourcesView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/roles` | OrganizationRolesView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/sessions/[sessionId]` | OrganizationSessionDetailView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Contextual | ⚠️ Problem |
| `/org/[orgId]/sessions` | OrganizationSessionsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/shifts` | OrganizationShiftsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/staff-attendance` | OrganizationStaffAttendanceView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/students/[studentId]` | OrganizationStudentDetailView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Contextual | ⚠️ Problem |
| `/org/[orgId]/students` | OrganizationStudentsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/subjects` | OrganizationSubjectsView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/subscription` | Suspense | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/tasks` | OrganizationTasksView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/tax-invoices` | OrganizationTaxInvoicesView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/tuition` | OrganizationTuitionView | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/[orgId]/usage` | Suspense | Organization roles | Mixed `students.manage`/`billing.manage`/org.* (client) | Yes | ⚠️ Problem |
| `/org/new` | Suspense | Organization roles | Session (client) | Global Home | ⚠️ Problem |
| `/personal/accessibility` | A11yAccommodationsView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/advanced-automation` | AdvancedAutomationView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/ai/drafts` | AiDraftsView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/ai/grading` | AiGradingView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/ai` | AiAssistantView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/ai/privacy` | AiPrivacyView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/calendar` | UpcomingCalendarView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/chat` | ChatRoomsView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/collab` | CollabEditingView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/gamification` | GamificationView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/integrations` | IntegrationCenterView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/legacy-closure` | LegacyClosureView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/messages` | MessagingInboxView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/notifications` | NotificationCenterView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/offline-sync` | OfflineSyncView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal` | AppShell | All personas / seller capability | Mostly session; selected account capabilities (client) | Yes | ⚠️ Off-nav / mock |
| `/personal/phone` | Suspense | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/presence` | PresenceCalendarView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/profile` | Suspense | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/pwa-status` | PwaHardeningView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/release-readiness` | ReleaseReadinessView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/search` | GlobalSearchView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/security-review` | SecurityHardeningView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/security` | Suspense | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/seller/analytics` | SellerAnalyticsView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/seller/balance` | SellerBalanceView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/seller/orders` | SellerOrdersView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/seller` | SellerOnboardingView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/seller/products` | ProductAuthoringView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/seller/taxonomy` | MarketplaceTaxonomyView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/seller/variants` | ProductVariantsView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/shipping` | ShippingReturnsView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/personal/wallet` | WalletView | All personas / seller capability | Mostly session; selected account capabilities (client) | No | ⚠️ Off-nav / mock |
| `/articles/[slug]` | ArticlesFeedDetailView | Public / buyer | Public or mock session | Public links | 🟡 Partial |
| `/articles` | ArticlesFeedListView | Public / buyer | Public or mock session | Public links | 🟡 Partial |
| `/cart` | MarketplaceCartView | Public / buyer | Public or mock session | Public links | 🟡 Partial |
| `/catalog/[slug]` | PublicCatalogDetailView | Public / buyer | Public or mock session | Public links | 🟡 Partial |
| `/catalog` | PublicCatalogListView | Public / buyer | Public or mock session | Public links | 🟡 Partial |
| `/discover` | MarketplaceDiscoveryView | Public / buyer | Public or mock session | Public links | 🟡 Partial |
| `/f/[slug]` | PublicFormView | Public / buyer | Public or mock session | Public links | 🟡 Partial |
| `/orders` | MarketplaceOrdersView | Public / buyer | Public or mock session | Public links | 🟡 Partial |
| `/p/[slug]` | PublicProfileDispatchView | Public / buyer | Public or mock session | Public links | 🟡 Partial |
| `/promos` | MarketplacePromosView | Public / buyer | Public or mock session | Public links | 🟡 Partial |
| `/reviews` | VerifiedReviewsView | Public / buyer | Public or mock session | Public links | 🟡 Partial |
| `/trials` | TrialBookingView | Public / buyer | Public or mock session | Public links | 🟡 Partial |
| `/student/activate` | StudentActivateForm | Student persona | `nav.student` on dashboard; inconsistent elsewhere | Global Home only | 🔴 Incomplete panel |
| `/student` | StudentDashboardView | Student persona | `nav.student` on dashboard; inconsistent elsewhere | Global Home only | 🔴 Incomplete panel |
| `/student/public-portfolio` | StudentPortfolioSettingsView | Student persona | `nav.student` on dashboard; inconsistent elsewhere | Global Home only | 🔴 Incomplete panel |
| `/teacher/activate` | Suspense | Teacher persona | `nav.teacher` on dashboard/plans; inconsistent elsewhere | Partial | 🔴 Incomplete panel |
| `/teacher` | Suspense | Teacher persona | `nav.teacher` on dashboard/plans; inconsistent elsewhere | Partial | 🔴 Incomplete panel |
| `/teacher/plans` | Suspense | Teacher persona | `nav.teacher` on dashboard/plans; inconsistent elsewhere | Partial | 🔴 Incomplete panel |
| `/teacher/public-profile` | TeacherPublicProfileSettingsView | Teacher persona | `nav.teacher` on dashboard/plans; inconsistent elsewhere | Partial | 🔴 Incomplete panel |
| `/dev/design-system` | canEnableDevTools | Developer | Environment flag | Hidden | Internal |
| `/dev/foundation` | Suspense | Developer | Environment flag | Hidden | Internal |
| `/dev/scenarios` | canEnableDevTools | Developer | Environment flag | Hidden | Internal |
| `/` | Suspense | All | Public/session-aware | N/A | 🟡 Partial |
| `/state/not-found` | Static state page | All | Public | N/A | 🟡 Partial |

## Missing route targets

- `/state/forbidden`, `/state/deleted`, and `/state/archived` are declared in `lib/routes.ts` but have no page.
- Organization Settings is rendered as text and has no route.
- Core teacher/student/guardian destinations listed in `PANEL_STRUCTURE.md` have no pages.

## Audit conclusions

- Page files: **137**; nested `layout.tsx`: **0**; route `loading.tsx`/`error.tsx`: **0**; middleware: **0**.
- Organization navigation links to nearly every organization page but does not filter by role.
- Personal and seller pages are overwhelmingly off-navigation; admin marketplace moderation is orphaned.
- A route existing in this table does not make it complete: every feature still lacks a real backend/database and server policy enforcement.

