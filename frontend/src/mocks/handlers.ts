import { http, HttpResponse, delay } from "msw";
import { z } from "zod";

import type { ApiError } from "@/services/api";
import { opaqueIdSchema } from "@/services/api";
import {
  deviceSessionSchema,
  maskPhoneE164,
  sessionSchema,
  twoFactorStatusSchema,
  type DeviceSession,
  type TwoFactorStatus,
} from "@/services/auth/client";
import { userProfileSchema, type UserProfile } from "@/services/profile";
import {
  availableContextSchema,
  availablePersonaSchema,
  teacherDashboardSchema,
  type AvailableContext,
} from "@/services/home";
import { organizationSchema, type Organization } from "@/services/organization";
import {
  ASSIGNABLE_ORG_ROLES,
  inviteStaffResultSchema,
  orgMemberSchema,
  orgRoleSchema,
  resolveOrgRoleForUser,
  seedOwnerMembership,
  type OrgMember,
  type OrgRole,
} from "@/services/organization/members";
import {
  studentDashboardSchema,
  studentRelationshipSchema,
  type StudentRelationship,
} from "@/services/student";
import {
  guardianDashboardSchema,
  guardianRelationshipSchema,
  type GuardianRelationship,
} from "@/services/guardian";
import { subjectSchema, type Subject } from "@/services/subjects";
import {
  managedStudentDetailSchema,
  managedStudentSchema,
  studentGuardianSchema,
  type ManagedStudentDetail,
} from "@/services/students";
import {
  classSchema,
  courseSchema,
  termSchema,
  type ClassRoom,
  type Course,
  type Term,
} from "@/services/courses";
import { enrollmentSchema, type Enrollment } from "@/services/enrollments";
import {
  attendanceReportSchema,
  classSessionSchema,
  sessionDetailSchema,
  type SessionDetail,
  type AttendanceRecord,
} from "@/services/sessions";
import {
  assignmentSchema,
  assignmentTeamSchema,
  canRequestRevision,
  type Assignment,
  type AssignmentTeam,
} from "@/services/assignments";
import { gradeEntrySchema, type GradeEntry } from "@/services/gradebook";
import {
  evaluationLevelSchema,
  evaluationTemplateSchema,
  gradeScaleSchema,
  progressMetricSchema,
  scaleBoundsForType,
  type EvaluationLevel,
  type EvaluationTemplate,
  type GradeScale,
  type GradeScaleType,
  type ProgressMetric,
} from "@/services/evaluations";
import {
  bankQuestionSchema,
  type BankQuestion,
  type QuestionType,
  type QuestionVisibility,
} from "@/services/question-bank";
import {
  antiCheatSignalSchema,
  examAttemptSchema,
  examGradeSchema,
  examSchema,
  type AntiCheatSignal,
  type Exam,
  type ExamAttempt,
  type ExamGrade,
} from "@/services/exams";
import {
  curriculumLessonSchema,
  curriculumModuleSchema,
  curriculumUnitSchema,
  type CurriculumLesson,
  type CurriculumModule,
  type CurriculumUnit,
} from "@/services/curriculum";
import { lessonPlanSchema, type LessonPlan } from "@/services/lesson-plans";
import { branchSchema, type Branch } from "@/services/branches";
import {
  equipmentSchema,
  roomSchema,
  type Equipment,
  type Room,
} from "@/services/facilities";
import {
  departmentSchema,
  teamSchema,
  type Department,
  type Team,
} from "@/services/departments";
import { positionSchema, type Position } from "@/services/positions";
import {
  directoryPersonSchema,
  presenceStatusSchema,
  type DirectoryPerson,
} from "@/services/people-directory";
import {
  orgRoleSchema as orgRoleDefinitionSchema,
  permissionsForTemplate,
  ROLE_TEMPLATE_KEYS,
  type OrgRoleDefinition,
} from "@/services/roles";
import { orgPolicySchema, type OrgPolicy } from "@/services/policies";
import { shiftSchema, type StaffShift } from "@/services/shifts";
import { leaveRequestSchema, type LeaveRequest } from "@/services/leave";
import {
  staffClockEventSchema,
  type StaffClockEvent,
} from "@/services/staff-attendance";
import {
  employeeDocumentSchema,
  type EmployeeDocument,
} from "@/services/employee-documents";
import {
  onboardingCaseSchema,
  nextOnboardingStep,
  type OnboardingCase,
} from "@/services/onboarding";
import {
  offboardingCaseSchema,
  nextOffboardingStep,
  type OffboardingCase,
} from "@/services/offboarding";
import {
  approvalRequestSchema,
  canActorDecide,
  type ApprovalRequest,
} from "@/services/approvals";
import {
  canTransitionTaskStatus,
  orgTaskSchema,
  type OrgTask,
} from "@/services/tasks";
import {
  canTransitionKbStatus,
  kbArticleSchema,
  type KbArticle,
} from "@/services/knowledge-base";
import {
  buildConsentSnapshot,
  canDecideSubmission,
  formSubmissionSchema,
  isValidPublicSlug,
  surveyFormSchema,
  type FormSubmission,
  type SurveyForm,
} from "@/services/forms";
import {
  contextTagSchema,
  customFieldSchema,
  customizationBundleSchema,
  customStatusSchema,
  selectFieldHasOptions,
  type CustomizationBundle,
} from "@/services/customization";
import {
  automationRuleSchema,
  requiresApprovalGate,
  type AutomationRule,
} from "@/services/automation";
import {
  dealSchema,
  pipelineSchema,
  type Deal,
  type Pipeline,
} from "@/services/crm";
import {
  dataJobSchema,
  nextDataJobStatus,
  type DataJob,
} from "@/services/data-ops";
import { canRsvp, orgEventSchema, type OrgEvent } from "@/services/events";
import {
  goalSchema,
  savedViewSchema,
  type Goal,
  type SavedView,
} from "@/services/analytics";
import {
  bulkJobSchema,
  requiresBulkApproval,
  type BulkJob,
} from "@/services/bulk-actions";
import {
  createMockPricingClient,
  plansForMarket,
  pricingCatalogSchema,
  type MarketCode,
} from "@/services/pricing";
import {
  canStartTrial,
  offersForMarket,
  teacherPlanCodeSchema,
  teacherSubscriptionSchema,
  type TeacherSubscription,
} from "@/services/teacher-plans";
import {
  organizationSubscriptionSchema,
  orgPlanCodeSchema,
  type OrganizationSubscription,
} from "@/services/subscription";
import {
  createMockPlanChangeClient,
  planChangePreviewSchema,
} from "@/services/plan-change";
import {
  billingSummarySchema,
  createMockBillingClient,
  invoiceSchema,
  type Invoice,
} from "@/services/billing";
import { createMockUsageClient, usageSnapshotSchema } from "@/services/usage";
import {
  addOnSchema,
  addOnsBundleSchema,
  createMockAddOnsClient,
} from "@/services/add-ons";
import {
  couponValidationSchema,
  createMockCouponsClient,
} from "@/services/coupons";
import {
  checkoutProviderSchema,
  checkoutSessionSchema,
  createMockCheckoutClient,
} from "@/services/checkout";
import {
  createMockTaxInvoicesClient,
  taxDocumentSchema,
} from "@/services/tax-invoices";
import {
  cancellationSnapshotSchema,
  createMockCancellationClient,
} from "@/services/cancellation";
import {
  createMockPlanVersionsClient,
  planVersionsSnapshotSchema,
} from "@/services/plan-versions";
import {
  createMockManualBillingClient,
  manualInvoiceSchema,
} from "@/services/manual-billing";

import { messageThreadSchema, type MessageThread } from "@/services/messaging";
import {
  chatMessageSchema,
  chatRoomSchema,
  type ChatMessage,
  type ChatRoom,
} from "@/services/chat";
import {
  notificationPreferencesSchema,
  notificationSchema,
  type AppNotification,
  type NotificationPreferences,
} from "@/services/notifications";
import { type CalendarEvent } from "@/services/calendar";
import { tuitionRecordSchema, type TuitionRecord } from "@/services/tuition";
import { resourceFileSchema, type ResourceFile } from "@/services/resources";
import { reportViewSchema, type ReportView } from "@/services/reports";
import { type SearchHit } from "@/services/search";

export type MockScenario =
  | "success"
  | "empty"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "server_error"
  | "offline";

let scenario: MockScenario = "success";
let latencyMs = 0;

type PendingChallenge = {
  phoneE164: string;
  purpose: "login" | "signup" | "reset" | "2fa_sms" | "2fa_totp";
  firstName?: string;
  lastName?: string;
  passwordHashStub?: string;
};

const challenges = new Map<string, PendingChallenge>();
let currentSession: z.infer<typeof sessionSchema> | null = null;
let twoFactorStatus: TwoFactorStatus = {
  enabled: false,
  smsEnabled: false,
  totpEnabled: false,
  recoveryCodesRemaining: 0,
  orgRequires2fa: false,
  adminMandatory: false,
};
let deviceSessions: DeviceSession[] = [];
let currentPhoneE164 = "+989121234567";
let mockProfile: UserProfile | null = null;
const mockOrgs = new Map<string, Organization>();
const mockMembersByOrg = new Map<
  string,
  Array<OrgMember & { phoneE164: string; userId: string | null }>
>();
let mockPersonas = [
  {
    persona: "teacher" as const,
    activated: true,
    labelKey: "home.persona.teacher",
  },
  {
    persona: "student" as const,
    activated: false,
    labelKey: "home.persona.student",
  },
  {
    persona: "guardian" as const,
    activated: false,
    labelKey: "home.persona.guardian",
  },
];
let mockContexts: AvailableContext[] = [
  {
    id: null,
    kind: "personal",
    label: "Personal",
    organizationId: null,
  },
];
let mockTeacherDash = {
  plan: "teacher_free" as const,
  studentsCount: 2,
  classesCount: 1,
  upcomingSessionsCount: 1,
};
let mockPendingStudentRels: StudentRelationship[] = [
  studentRelationshipSchema.parse({
    id: opaqueIdSchema.parse("rel_stu_pending_1"),
    organizationName: "Demo School",
    subjectLabel: "Mathematics",
    teacherDisplayName: "Ms. Rezaei",
    status: "pending",
  }),
];
let mockActiveStudentRels: StudentRelationship[] = [];
let mockStudentDash = {
  activeSubjectsCount: 0,
  upcomingSessionsCount: 0,
  openAssignmentsCount: 0,
  relationships: [] as StudentRelationship[],
};
let mockPendingGuardianRels: GuardianRelationship[] = [
  guardianRelationshipSchema.parse({
    id: opaqueIdSchema.parse("rel_grd_pending_1"),
    studentDisplayName: "Sara",
    relationshipLabel: "Parent",
    organizationName: "Demo School",
    status: "pending",
  }),
];
let mockActiveGuardianRels: GuardianRelationship[] = [];
let mockGuardianDash = {
  linkedStudentsCount: 0,
  upcomingSessionsCount: 0,
  unreadUpdatesCount: 0,
  relationships: [] as GuardianRelationship[],
};
const mockSubjects = new Map<string, Subject>([
  [
    "sub_math_personal",
    subjectSchema.parse({
      id: opaqueIdSchema.parse("sub_math_personal"),
      organizationId: null,
      name: "Mathematics",
      code: "MATH",
      levelLabel: "Grade 8",
      teacherDisplayName: "Ms. Rezaei",
      active: true,
    }),
  ],
]);
const mockManagedStudents = new Map<
  string,
  ManagedStudentDetail & { phoneE164: string }
>();
const mockCourses = new Map<string, Course>();
const mockClasses = new Map<string, ClassRoom[]>();
const mockTerms = new Map<string, Term[]>();
const mockEnrollments = new Map<string, Enrollment>();
const mockSessions = new Map<string, SessionDetail>();
const mockAttendance = new Map<string, AttendanceRecord[]>();
const mockAssignments = new Map<string, Assignment[]>();
const mockAssignmentTeams = new Map<string, AssignmentTeam[]>();
const mockGradebook = new Map<string, GradeEntry[]>();
const mockEvaluationTemplates = new Map<string, EvaluationTemplate[]>();
const mockGradeScales = new Map<string, GradeScale[]>();
const mockEvaluationLevels = new Map<string, EvaluationLevel[]>();
const mockProgressMetrics = new Map<string, ProgressMetric[]>();
const mockQuestionBank = new Map<string, BankQuestion[]>();
const mockExams = new Map<string, Exam[]>();
const mockExamAttempts = new Map<string, ExamAttempt[]>();
const mockExamGrades = new Map<string, ExamGrade[]>();
const mockCurriculumModules = new Map<string, CurriculumModule[]>();
const mockCurriculumUnits = new Map<string, CurriculumUnit[]>();
const mockCurriculumLessons = new Map<string, CurriculumLesson[]>();
const mockLessonPlans = new Map<string, LessonPlan[]>();
const mockBranches = new Map<string, Branch[]>();
const mockRooms = new Map<string, Room[]>();
const mockEquipment = new Map<string, Equipment[]>();
const mockDepartments = new Map<string, Department[]>();
const mockTeams = new Map<string, Team[]>();
const mockPositions = new Map<string, Position[]>();
const mockDirectory = new Map<string, DirectoryPerson[]>();
const mockRoleDefinitions = new Map<string, OrgRoleDefinition[]>();
const mockPolicies = new Map<string, OrgPolicy[]>();
const mockShifts = new Map<string, StaffShift[]>();
const mockLeaveRequests = new Map<string, LeaveRequest[]>();
const mockStaffClockEvents = new Map<string, StaffClockEvent[]>();
const mockEmployeeDocuments = new Map<string, EmployeeDocument[]>();
const mockOnboardingCases = new Map<string, OnboardingCase[]>();
const mockOffboardingCases = new Map<string, OffboardingCase[]>();
const mockApprovals = new Map<string, ApprovalRequest[]>();
const mockTasks = new Map<string, OrgTask[]>();
const mockKbArticles = new Map<string, KbArticle[]>();
const mockSurveyForms = new Map<string, SurveyForm[]>();
const mockFormSubmissions = new Map<string, FormSubmission[]>();
const mockPublicForms = new Map<string, SurveyForm>();
const mockCustomization = new Map<string, CustomizationBundle>();
const mockAutomation = new Map<string, AutomationRule[]>();
const mockCrmPipelines = new Map<string, Pipeline[]>();
const mockCrmDeals = new Map<string, Deal[]>();
const mockDataOps = new Map<string, DataJob[]>();
const mockEvents = new Map<string, OrgEvent[]>();
const mockAnalyticsViews = new Map<string, SavedView[]>();
const mockAnalyticsGoals = new Map<string, Goal[]>();
const mockBulkActions = new Map<string, BulkJob[]>();

const mockMessageThreads: MessageThread[] = [];
const mockChatRooms: ChatRoom[] = [];
const mockChatMessages = new Map<string, ChatMessage[]>();
let mockNotificationPrefs: NotificationPreferences = {
  inApp: true,
  sms: true,
  webPush: false,
  quietHoursEnabled: false,
};
const mockNotifications: AppNotification[] = [
  {
    id: opaqueIdSchema.parse("ntf_demo1"),
    category: "homework",
    title: "New homework published",
    unread: true,
    href: "/personal/messages",
  },
];
const mockCalendarEvents: CalendarEvent[] = [
  {
    id: opaqueIdSchema.parse("cal_demo1"),
    title: "Math session",
    startsAt: new Date(Date.now() + 86400000).toISOString(),
    endsAt: new Date(Date.now() + 90000000).toISOString(),
    kind: "session",
  },
];
const mockTuition = new Map<string, TuitionRecord[]>();
const mockTeacherSubscriptions = new Map<string, TeacherSubscription>();
const mockOrgSubscriptions = new Map<string, OrganizationSubscription>();
const mswPlanChangeClient = createMockPlanChangeClient();
const mswBillingClient = createMockBillingClient();
const mswUsageClient = createMockUsageClient();
const mswAddOnsClient = createMockAddOnsClient();
const mswCouponsClient = createMockCouponsClient();
const mswCheckoutClient = createMockCheckoutClient();
const mswTaxInvoicesClient = createMockTaxInvoicesClient();
const mswCancellationClient = createMockCancellationClient();
const mswPlanVersionsClient = createMockPlanVersionsClient();
const mswManualBillingClient = createMockManualBillingClient();
const mockBillingInvoices = new Map<string, Invoice[]>();
const mockResources = new Map<string, ResourceFile[]>();
const mockReports = new Map<string, ReportView[]>();
const mockSearchCatalog: SearchHit[] = [
  {
    id: opaqueIdSchema.parse("sr_stu1"),
    entityType: "student",
    title: "Sara Student",
    href: "/org/demo/students",
    allowed: true,
  },
  {
    id: opaqueIdSchema.parse("sr_crs1"),
    entityType: "course",
    title: "Algebra course",
    href: "/org/demo/courses",
    allowed: true,
  },
  {
    id: opaqueIdSchema.parse("sr_asg1"),
    entityType: "assignment",
    title: "Homework 1",
    href: "/org/demo/assignments",
    allowed: true,
  },
  {
    id: opaqueIdSchema.parse("sr_msg1"),
    entityType: "message",
    title: "Private message",
    href: "/personal/messages",
    allowed: false,
  },
];
let pendingPhoneChange: {
  currentChallengeId: string;
  newChallengeId: string;
  newPhoneE164: string;
} | null = null;

const DEMO_PHONE = "+989121234567";
const DEMO_PASSWORD = "Password1";
const DEMO_OTP = "123456";

export function setMockScenario(next: MockScenario): void {
  scenario = next;
}

export function setMockLatency(ms: number): void {
  latencyMs = Math.max(0, ms);
}

export function getMockScenario(): MockScenario {
  return scenario;
}

function errorBody(status: number, code: string, messageKey: string): ApiError {
  return {
    code,
    messageKey,
    status,
    fieldErrors: {},
    requestId: `req_${code.toLowerCase()}`,
  };
}

async function maybeFail() {
  await delay(latencyMs);
  if (scenario === "offline") {
    return HttpResponse.error();
  }
  if (scenario === "rate_limited") {
    return HttpResponse.json(
      errorBody(429, "RATE_LIMITED", "errors.rate_limited"),
      { status: 429 },
    );
  }
  if (scenario === "server_error") {
    return HttpResponse.json(errorBody(500, "SERVER", "errors.server"), {
      status: 500,
    });
  }
  return null;
}

function makeSession(displayName: string, phoneE164: string) {
  return sessionSchema.parse({
    userId: opaqueIdSchema.parse(`usr_${phoneE164.replace(/\D/g, "")}`),
    displayName,
    activePersona: "teacher",
    organizationId: null,
    subjectId: null,
    orgRole: null,
    expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
    requiresReauth: false,
  });
}

function resetTwoFactor(): void {
  twoFactorStatus = twoFactorStatusSchema.parse({
    enabled: false,
    smsEnabled: false,
    totpEnabled: false,
    recoveryCodesRemaining: 0,
    orgRequires2fa: false,
    adminMandatory: false,
  });
}

function seedSessions(userId: string): void {
  const now = Date.now();
  deviceSessions = [
    deviceSessionSchema.parse({
      id: opaqueIdSchema.parse(`ses_current_${userId}`),
      deviceLabel: "This browser",
      locationHint: "Tehran",
      userAgentSummary: "Chrome · macOS",
      lastActiveAt: new Date(now).toISOString(),
      createdAt: new Date(now - 86_400_000).toISOString(),
      expiresAt: new Date(now + 7 * 86_400_000).toISOString(),
      isCurrent: true,
    }),
    deviceSessionSchema.parse({
      id: opaqueIdSchema.parse(`ses_other_${userId}`),
      deviceLabel: "iPhone",
      locationHint: "Isfahan",
      userAgentSummary: "Safari · iOS",
      lastActiveAt: new Date(now - 3_600_000).toISOString(),
      createdAt: new Date(now - 7 * 86_400_000).toISOString(),
      expiresAt: new Date(now + 7 * 86_400_000).toISOString(),
      isCurrent: false,
    }),
  ];
}

function newChallengeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const MSW_PERSIST_KEY = "solo:msw:v1";

function canUseSessionStorage(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.sessionStorage !== "undefined"
  );
}

function persistMswState() {
  if (!canUseSessionStorage()) return;
  try {
    window.sessionStorage.setItem(
      MSW_PERSIST_KEY,
      JSON.stringify({
        currentSession,
        currentPhoneE164,
        twoFactorStatus,
        deviceSessions,
        mockProfile,
        mockOrgs: [...mockOrgs.entries()],
        mockMembersByOrg: [...mockMembersByOrg.entries()],
        mockAssignments: [...mockAssignments.entries()],
        mockAssignmentTeams: [...mockAssignmentTeams.entries()],
        mockGradebook: [...mockGradebook.entries()],
        mockEvaluationTemplates: [...mockEvaluationTemplates.entries()],
        mockGradeScales: [...mockGradeScales.entries()],
        mockEvaluationLevels: [...mockEvaluationLevels.entries()],
        mockProgressMetrics: [...mockProgressMetrics.entries()],
        mockQuestionBank: [...mockQuestionBank.entries()],
        mockExams: [...mockExams.entries()],
        mockExamAttempts: [...mockExamAttempts.entries()],
        mockExamGrades: [...mockExamGrades.entries()],
        mockCurriculumModules: [...mockCurriculumModules.entries()],
        mockCurriculumUnits: [...mockCurriculumUnits.entries()],
        mockCurriculumLessons: [...mockCurriculumLessons.entries()],
        mockLessonPlans: [...mockLessonPlans.entries()],
        mockBranches: [...mockBranches.entries()],
        mockRooms: [...mockRooms.entries()],
        mockEquipment: [...mockEquipment.entries()],
        mockDepartments: [...mockDepartments.entries()],
        mockTeams: [...mockTeams.entries()],
        mockPositions: [...mockPositions.entries()],
        mockDirectory: [...mockDirectory.entries()],
        mockRoleDefinitions: [...mockRoleDefinitions.entries()],
        mockPolicies: [...mockPolicies.entries()],
        mockShifts: [...mockShifts.entries()],
        mockLeaveRequests: [...mockLeaveRequests.entries()],
        mockStaffClockEvents: [...mockStaffClockEvents.entries()],
        mockEmployeeDocuments: [...mockEmployeeDocuments.entries()],
        mockOnboardingCases: [...mockOnboardingCases.entries()],
        mockOffboardingCases: [...mockOffboardingCases.entries()],
        mockApprovals: [...mockApprovals.entries()],
        mockTasks: [...mockTasks.entries()],
        mockKbArticles: [...mockKbArticles.entries()],
        mockSurveyForms: [...mockSurveyForms.entries()],
        mockFormSubmissions: [...mockFormSubmissions.entries()],
        mockPublicForms: [...mockPublicForms.entries()],
        mockCustomization: [...mockCustomization.entries()],
        mockAutomation: [...mockAutomation.entries()],
        mockCrmPipelines: [...mockCrmPipelines.entries()],
        mockCrmDeals: [...mockCrmDeals.entries()],
        mockDataOps: [...mockDataOps.entries()],
        mockEvents: [...mockEvents.entries()],
        mockAnalyticsViews: [...mockAnalyticsViews.entries()],
        mockAnalyticsGoals: [...mockAnalyticsGoals.entries()],
        mockBulkActions: [...mockBulkActions.entries()],
        mockTuition: [...mockTuition.entries()],
        mockTeacherSubscriptions: [...mockTeacherSubscriptions.entries()],
        mockOrgSubscriptions: [...mockOrgSubscriptions.entries()],
        mockResources: [...mockResources.entries()],
        mockReports: [...mockReports.entries()],
        mockMessageThreads,
        mockChatRooms,
        mockChatMessages: [...mockChatMessages.entries()],
        mockNotifications,
        mockNotificationPrefs,
        mockCalendarEvents,
        mockPersonas,
        mockContexts,
      }),
    );
  } catch {
    // Ignore quota/serialization failures in demo mocks.
  }
}

function hydrateMswState() {
  if (!canUseSessionStorage()) return;
  const raw = window.sessionStorage.getItem(MSW_PERSIST_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (data.currentSession) {
      currentSession = sessionSchema.parse(data.currentSession);
    }
    if (typeof data.currentPhoneE164 === "string") {
      currentPhoneE164 = data.currentPhoneE164;
    }
    if (data.twoFactorStatus) {
      twoFactorStatus = twoFactorStatusSchema.parse(data.twoFactorStatus);
    }
    if (Array.isArray(data.deviceSessions)) {
      deviceSessions = data.deviceSessions.map((row) =>
        deviceSessionSchema.parse(row),
      );
    }
    if (data.mockProfile) {
      mockProfile = userProfileSchema.parse(data.mockProfile);
    }
    if (Array.isArray(data.mockOrgs)) {
      mockOrgs.clear();
      for (const entry of data.mockOrgs as Array<[string, Organization]>) {
        mockOrgs.set(entry[0], organizationSchema.parse(entry[1]));
      }
    }
    if (Array.isArray(data.mockMembersByOrg)) {
      mockMembersByOrg.clear();
      for (const entry of data.mockMembersByOrg as Array<
        [
          string,
          Array<OrgMember & { phoneE164: string; userId: string | null }>,
        ]
      >) {
        mockMembersByOrg.set(entry[0], entry[1]);
      }
    }
    if (Array.isArray(data.mockAssignments)) {
      mockAssignments.clear();
      for (const entry of data.mockAssignments as Array<
        [string, Assignment[]]
      >) {
        mockAssignments.set(
          entry[0],
          entry[1].map((row) => assignmentSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockAssignmentTeams)) {
      mockAssignmentTeams.clear();
      for (const entry of data.mockAssignmentTeams as Array<
        [string, AssignmentTeam[]]
      >) {
        mockAssignmentTeams.set(
          entry[0],
          entry[1].map((row) => assignmentTeamSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockGradebook)) {
      mockGradebook.clear();
      for (const entry of data.mockGradebook as Array<[string, GradeEntry[]]>) {
        mockGradebook.set(
          entry[0],
          entry[1].map((row) => gradeEntrySchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockEvaluationTemplates)) {
      mockEvaluationTemplates.clear();
      for (const entry of data.mockEvaluationTemplates as Array<
        [string, EvaluationTemplate[]]
      >) {
        mockEvaluationTemplates.set(
          entry[0],
          entry[1].map((row) => evaluationTemplateSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockGradeScales)) {
      mockGradeScales.clear();
      for (const entry of data.mockGradeScales as Array<
        [string, GradeScale[]]
      >) {
        mockGradeScales.set(
          entry[0],
          entry[1].map((row) => gradeScaleSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockEvaluationLevels)) {
      mockEvaluationLevels.clear();
      for (const entry of data.mockEvaluationLevels as Array<
        [string, EvaluationLevel[]]
      >) {
        mockEvaluationLevels.set(
          entry[0],
          entry[1].map((row) => evaluationLevelSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockProgressMetrics)) {
      mockProgressMetrics.clear();
      for (const entry of data.mockProgressMetrics as Array<
        [string, ProgressMetric[]]
      >) {
        mockProgressMetrics.set(
          entry[0],
          entry[1].map((row) => progressMetricSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockQuestionBank)) {
      mockQuestionBank.clear();
      for (const entry of data.mockQuestionBank as Array<
        [string, BankQuestion[]]
      >) {
        mockQuestionBank.set(
          entry[0],
          entry[1].map((row) => bankQuestionSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockExams)) {
      mockExams.clear();
      for (const entry of data.mockExams as Array<[string, Exam[]]>) {
        mockExams.set(
          entry[0],
          entry[1].map((row) => examSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockExamAttempts)) {
      mockExamAttempts.clear();
      for (const entry of data.mockExamAttempts as Array<
        [string, ExamAttempt[]]
      >) {
        mockExamAttempts.set(
          entry[0],
          entry[1].map((row) => examAttemptSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockExamGrades)) {
      mockExamGrades.clear();
      for (const entry of data.mockExamGrades as Array<[string, ExamGrade[]]>) {
        mockExamGrades.set(
          entry[0],
          entry[1].map((row) => examGradeSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockCurriculumModules)) {
      mockCurriculumModules.clear();
      for (const entry of data.mockCurriculumModules as Array<
        [string, CurriculumModule[]]
      >) {
        mockCurriculumModules.set(
          entry[0],
          entry[1].map((row) => curriculumModuleSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockCurriculumUnits)) {
      mockCurriculumUnits.clear();
      for (const entry of data.mockCurriculumUnits as Array<
        [string, CurriculumUnit[]]
      >) {
        mockCurriculumUnits.set(
          entry[0],
          entry[1].map((row) => curriculumUnitSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockCurriculumLessons)) {
      mockCurriculumLessons.clear();
      for (const entry of data.mockCurriculumLessons as Array<
        [string, CurriculumLesson[]]
      >) {
        mockCurriculumLessons.set(
          entry[0],
          entry[1].map((row) => curriculumLessonSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockLessonPlans)) {
      mockLessonPlans.clear();
      for (const entry of data.mockLessonPlans as Array<
        [string, LessonPlan[]]
      >) {
        mockLessonPlans.set(
          entry[0],
          entry[1].map((row) => lessonPlanSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockBranches)) {
      mockBranches.clear();
      for (const entry of data.mockBranches as Array<[string, Branch[]]>) {
        mockBranches.set(
          entry[0],
          entry[1].map((row) => branchSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockRooms)) {
      mockRooms.clear();
      for (const entry of data.mockRooms as Array<[string, Room[]]>) {
        mockRooms.set(
          entry[0],
          entry[1].map((row) => roomSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockEquipment)) {
      mockEquipment.clear();
      for (const entry of data.mockEquipment as Array<[string, Equipment[]]>) {
        mockEquipment.set(
          entry[0],
          entry[1].map((row) => equipmentSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockDepartments)) {
      mockDepartments.clear();
      for (const entry of data.mockDepartments as Array<
        [string, Department[]]
      >) {
        mockDepartments.set(
          entry[0],
          entry[1].map((row) => departmentSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockTeams)) {
      mockTeams.clear();
      for (const entry of data.mockTeams as Array<[string, Team[]]>) {
        mockTeams.set(
          entry[0],
          entry[1].map((row) => teamSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockPositions)) {
      mockPositions.clear();
      for (const entry of data.mockPositions as Array<[string, Position[]]>) {
        mockPositions.set(
          entry[0],
          entry[1].map((row) => positionSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockDirectory)) {
      mockDirectory.clear();
      for (const entry of data.mockDirectory as Array<
        [string, DirectoryPerson[]]
      >) {
        mockDirectory.set(
          entry[0],
          entry[1].map((row) => directoryPersonSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockRoleDefinitions)) {
      mockRoleDefinitions.clear();
      for (const entry of data.mockRoleDefinitions as Array<
        [string, OrgRoleDefinition[]]
      >) {
        mockRoleDefinitions.set(
          entry[0],
          entry[1].map((row) => orgRoleDefinitionSchema.parse(row)),
        );
      }
    }

    if (Array.isArray(data.mockPolicies)) {
      mockPolicies.clear();
      for (const entry of data.mockPolicies as Array<[string, OrgPolicy[]]>) {
        mockPolicies.set(
          entry[0],
          entry[1].map((row) => orgPolicySchema.parse(row)),
        );
      }
    }

    if (Array.isArray(data.mockShifts)) {
      mockShifts.clear();
      for (const entry of data.mockShifts as Array<[string, StaffShift[]]>) {
        mockShifts.set(
          entry[0],
          entry[1].map((row) => shiftSchema.parse(row)),
        );
      }
    }

    if (Array.isArray(data.mockLeaveRequests)) {
      mockLeaveRequests.clear();
      for (const entry of data.mockLeaveRequests as Array<
        [string, LeaveRequest[]]
      >) {
        mockLeaveRequests.set(
          entry[0],
          entry[1].map((row) => leaveRequestSchema.parse(row)),
        );
      }
    }

    if (Array.isArray(data.mockStaffClockEvents)) {
      mockStaffClockEvents.clear();
      for (const entry of data.mockStaffClockEvents as Array<
        [string, StaffClockEvent[]]
      >) {
        mockStaffClockEvents.set(
          entry[0],
          entry[1].map((row) => staffClockEventSchema.parse(row)),
        );
      }
    }

    if (Array.isArray(data.mockEmployeeDocuments)) {
      mockEmployeeDocuments.clear();
      for (const entry of data.mockEmployeeDocuments as Array<
        [string, EmployeeDocument[]]
      >) {
        mockEmployeeDocuments.set(
          entry[0],
          entry[1].map((row) => employeeDocumentSchema.parse(row)),
        );
      }
    }

    if (Array.isArray(data.mockOnboardingCases)) {
      mockOnboardingCases.clear();
      for (const entry of data.mockOnboardingCases as Array<
        [string, OnboardingCase[]]
      >) {
        mockOnboardingCases.set(
          entry[0],
          entry[1].map((row) => onboardingCaseSchema.parse(row)),
        );
      }
    }

    if (Array.isArray(data.mockOffboardingCases)) {
      mockOffboardingCases.clear();
      for (const entry of data.mockOffboardingCases as Array<
        [string, OffboardingCase[]]
      >) {
        mockOffboardingCases.set(
          entry[0],
          entry[1].map((row) => offboardingCaseSchema.parse(row)),
        );
      }
    }

    if (Array.isArray(data.mockApprovals)) {
      mockApprovals.clear();
      for (const entry of data.mockApprovals as Array<
        [string, ApprovalRequest[]]
      >) {
        mockApprovals.set(
          entry[0],
          entry[1].map((row) => approvalRequestSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockTasks)) {
      mockTasks.clear();
      for (const entry of data.mockTasks as Array<[string, OrgTask[]]>) {
        mockTasks.set(
          entry[0],
          entry[1].map((row) => orgTaskSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockKbArticles)) {
      mockKbArticles.clear();
      for (const entry of data.mockKbArticles as Array<[string, KbArticle[]]>) {
        mockKbArticles.set(
          entry[0],
          entry[1].map((row) => kbArticleSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockSurveyForms)) {
      mockSurveyForms.clear();
      for (const entry of data.mockSurveyForms as Array<
        [string, SurveyForm[]]
      >) {
        mockSurveyForms.set(
          entry[0],
          entry[1].map((row) => surveyFormSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockFormSubmissions)) {
      mockFormSubmissions.clear();
      for (const entry of data.mockFormSubmissions as Array<
        [string, FormSubmission[]]
      >) {
        mockFormSubmissions.set(
          entry[0],
          entry[1].map((row) => formSubmissionSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockPublicForms)) {
      mockPublicForms.clear();
      for (const entry of data.mockPublicForms as Array<[string, SurveyForm]>) {
        mockPublicForms.set(entry[0], surveyFormSchema.parse(entry[1]));
      }
    }
    if (Array.isArray(data.mockCustomization)) {
      mockCustomization.clear();
      for (const entry of data.mockCustomization as Array<
        [string, CustomizationBundle]
      >) {
        mockCustomization.set(
          entry[0],
          customizationBundleSchema.parse(entry[1]),
        );
      }
    }
    if (Array.isArray(data.mockAutomation)) {
      mockAutomation.clear();
      for (const entry of data.mockAutomation as Array<
        [string, AutomationRule[]]
      >) {
        mockAutomation.set(
          entry[0],
          entry[1].map((row) => automationRuleSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockCrmPipelines)) {
      mockCrmPipelines.clear();
      for (const entry of data.mockCrmPipelines as Array<
        [string, Pipeline[]]
      >) {
        mockCrmPipelines.set(
          entry[0],
          entry[1].map((row) => pipelineSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockCrmDeals)) {
      mockCrmDeals.clear();
      for (const entry of data.mockCrmDeals as Array<[string, Deal[]]>) {
        mockCrmDeals.set(
          entry[0],
          entry[1].map((row) => dealSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockDataOps)) {
      mockDataOps.clear();
      for (const entry of data.mockDataOps as Array<[string, DataJob[]]>) {
        mockDataOps.set(
          entry[0],
          entry[1].map((row) => dataJobSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockEvents)) {
      mockEvents.clear();
      for (const entry of data.mockEvents as Array<[string, OrgEvent[]]>) {
        mockEvents.set(
          entry[0],
          entry[1].map((row) => orgEventSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockAnalyticsViews)) {
      mockAnalyticsViews.clear();
      for (const entry of data.mockAnalyticsViews as Array<
        [string, SavedView[]]
      >) {
        mockAnalyticsViews.set(
          entry[0],
          entry[1].map((row) => savedViewSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockAnalyticsGoals)) {
      mockAnalyticsGoals.clear();
      for (const entry of data.mockAnalyticsGoals as Array<[string, Goal[]]>) {
        mockAnalyticsGoals.set(
          entry[0],
          entry[1].map((row) => goalSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockBulkActions)) {
      mockBulkActions.clear();
      for (const entry of data.mockBulkActions as Array<[string, BulkJob[]]>) {
        mockBulkActions.set(
          entry[0],
          entry[1].map((row) => bulkJobSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockTuition)) {
      mockTuition.clear();
      for (const entry of data.mockTuition as Array<
        [string, TuitionRecord[]]
      >) {
        mockTuition.set(
          entry[0],
          entry[1].map((row) => tuitionRecordSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockTeacherSubscriptions)) {
      mockTeacherSubscriptions.clear();
      for (const entry of data.mockTeacherSubscriptions as Array<
        [string, TeacherSubscription]
      >) {
        mockTeacherSubscriptions.set(
          entry[0],
          teacherSubscriptionSchema.parse(entry[1]),
        );
      }
    }
    if (Array.isArray(data.mockOrgSubscriptions)) {
      mockOrgSubscriptions.clear();
      for (const entry of data.mockOrgSubscriptions as Array<
        [string, OrganizationSubscription]
      >) {
        mockOrgSubscriptions.set(
          entry[0],
          organizationSubscriptionSchema.parse(entry[1]),
        );
      }
    }
    if (Array.isArray(data.mockResources)) {
      mockResources.clear();
      for (const entry of data.mockResources as Array<
        [string, ResourceFile[]]
      >) {
        mockResources.set(
          entry[0],
          entry[1].map((row) => resourceFileSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockReports)) {
      mockReports.clear();
      for (const entry of data.mockReports as Array<[string, ReportView[]]>) {
        mockReports.set(
          entry[0],
          entry[1].map((row) => reportViewSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockMessageThreads)) {
      mockMessageThreads.length = 0;
      mockMessageThreads.push(
        ...(data.mockMessageThreads as MessageThread[]).map((row) =>
          messageThreadSchema.parse(row),
        ),
      );
    }
    if (Array.isArray(data.mockChatRooms)) {
      mockChatRooms.length = 0;
      mockChatRooms.push(
        ...(data.mockChatRooms as ChatRoom[]).map((row) =>
          chatRoomSchema.parse(row),
        ),
      );
    }
    if (Array.isArray(data.mockChatMessages)) {
      mockChatMessages.clear();
      for (const entry of data.mockChatMessages as Array<
        [string, ChatMessage[]]
      >) {
        mockChatMessages.set(
          entry[0],
          entry[1].map((row) => chatMessageSchema.parse(row)),
        );
      }
    }
    if (Array.isArray(data.mockNotifications)) {
      mockNotifications.length = 0;
      mockNotifications.push(
        ...(data.mockNotifications as AppNotification[]).map((row) =>
          notificationSchema.parse(row),
        ),
      );
    }
    if (data.mockNotificationPrefs) {
      mockNotificationPrefs = notificationPreferencesSchema.parse(
        data.mockNotificationPrefs,
      );
    }
    if (Array.isArray(data.mockCalendarEvents)) {
      mockCalendarEvents.length = 0;
      mockCalendarEvents.push(...(data.mockCalendarEvents as CalendarEvent[]));
    }
    if (Array.isArray(data.mockPersonas)) {
      mockPersonas = data.mockPersonas as typeof mockPersonas;
    }
    if (Array.isArray(data.mockContexts)) {
      mockContexts = data.mockContexts as typeof mockContexts;
    }
  } catch {
    // Ignore corrupt demo persistence.
  }
}

hydrateMswState();

function requireAuth() {
  if (!currentSession) {
    hydrateMswState();
  }
  if (!currentSession) {
    return HttpResponse.json(
      errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
      { status: 401 },
    );
  }
  return null;
}

const students = [
  { id: "stu_1", displayName: "Sara" },
  { id: "stu_2", displayName: "Ali" },
];

export const handlers = [
  http.get("/api/health", async () => {
    await delay(latencyMs);
    return HttpResponse.json({ ok: true, scenario });
  }),

  http.get("/api/students", async () => {
    await delay(latencyMs);

    if (scenario === "offline") {
      return HttpResponse.error();
    }
    if (scenario === "forbidden") {
      return HttpResponse.json(
        errorBody(403, "FORBIDDEN", "errors.forbidden"),
        { status: 403 },
      );
    }
    if (scenario === "not_found") {
      return HttpResponse.json(
        errorBody(404, "NOT_FOUND", "errors.not_found"),
        { status: 404 },
      );
    }
    if (scenario === "conflict") {
      return HttpResponse.json(
        errorBody(409, "CONFLICT", "errors.validation"),
        { status: 409 },
      );
    }
    if (scenario === "rate_limited") {
      return HttpResponse.json(
        errorBody(429, "RATE_LIMITED", "errors.rate_limited"),
        { status: 429 },
      );
    }
    if (scenario === "server_error") {
      return HttpResponse.json(errorBody(500, "SERVER", "errors.server"), {
        status: 500,
      });
    }
    if (scenario === "empty") {
      return HttpResponse.json({
        data: [],
        meta: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
      });
    }

    return HttpResponse.json({
      data: students,
      meta: {
        page: 1,
        pageSize: 20,
        totalItems: students.length,
        totalPages: 1,
      },
    });
  }),

  http.get("/api/auth/session", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    if (!currentSession) {
      hydrateMswState();
    }
    if (!currentSession) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    return HttpResponse.json(currentSession);
  }),

  http.post("/api/auth/login", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const body = (await request.json()) as {
      phoneE164?: string;
      password?: string;
    };
    if (body.phoneE164 !== DEMO_PHONE || body.password !== DEMO_PASSWORD) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    currentSession = makeSession("Demo User", body.phoneE164);
    currentPhoneE164 = body.phoneE164;
    pendingPhoneChange = null;
    resetTwoFactor();
    seedSessions(currentSession.userId);
    persistMswState();
    return HttpResponse.json(currentSession);
  }),

  http.post("/api/auth/logout", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    currentSession = null;
    persistMswState();
    deviceSessions = [];
    pendingPhoneChange = null;
    currentPhoneE164 = DEMO_PHONE;
    resetTwoFactor();
    return HttpResponse.json({ ok: true });
  }),

  http.post("/api/auth/signup", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const body = (await request.json()) as {
      firstName: string;
      lastName: string;
      phoneE164: string;
      password: string;
    };
    const challengeId = newChallengeId("otp_signup");
    challenges.set(challengeId, {
      phoneE164: body.phoneE164,
      purpose: "signup",
      firstName: body.firstName,
      lastName: body.lastName,
      passwordHashStub: body.password ? "set" : undefined,
    });
    return HttpResponse.json({ challengeId });
  }),

  http.post("/api/auth/signup/verify", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const body = (await request.json()) as {
      challengeId: string;
      code: string;
    };
    const challenge = challenges.get(body.challengeId);
    if (
      !challenge ||
      challenge.purpose !== "signup" ||
      body.code !== DEMO_OTP
    ) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    challenges.delete(body.challengeId);
    currentSession = makeSession(
      `${challenge.firstName ?? "New"} ${challenge.lastName ?? "User"}`,
      challenge.phoneE164,
    );
    seedSessions(currentSession.userId);
    return HttpResponse.json(currentSession);
  }),

  http.post("/api/auth/otp/request", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const body = (await request.json()) as { phoneE164: string };
    const challengeId = newChallengeId("otp_login");
    challenges.set(challengeId, {
      phoneE164: body.phoneE164,
      purpose: "login",
    });
    return HttpResponse.json({ challengeId });
  }),

  http.post("/api/auth/otp/verify", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const body = (await request.json()) as {
      challengeId: string;
      code: string;
    };
    const challenge = challenges.get(body.challengeId);
    if (!challenge || body.code !== DEMO_OTP) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    challenges.delete(body.challengeId);
    currentSession = makeSession("OTP User", challenge.phoneE164);
    seedSessions(currentSession.userId);
    return HttpResponse.json(currentSession);
  }),

  http.post("/api/auth/password/reset/request", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const body = (await request.json()) as { phoneE164: string };
    const challengeId = newChallengeId("otp_reset");
    challenges.set(challengeId, {
      phoneE164: body.phoneE164,
      purpose: "reset",
    });
    return HttpResponse.json({ challengeId });
  }),

  http.post("/api/auth/password/reset/confirm", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const body = (await request.json()) as {
      challengeId: string;
      code: string;
      newPassword: string;
    };
    const challenge = challenges.get(body.challengeId);
    if (
      !challenge ||
      challenge.purpose !== "reset" ||
      body.code !== DEMO_OTP ||
      !body.newPassword
    ) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    challenges.delete(body.challengeId);
    return HttpResponse.json({ ok: true });
  }),

  http.post("/api/auth/reauth", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as { password?: string };
    if (body.password !== DEMO_PASSWORD) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    currentSession = { ...currentSession!, requiresReauth: false };
    return HttpResponse.json({ ok: true });
  }),

  http.get("/api/auth/2fa", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    return HttpResponse.json(twoFactorStatus);
  }),

  http.post("/api/auth/2fa/enable/begin", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as {
      method?: "sms" | "totp";
      password?: string;
    };
    if (body.password !== DEMO_PASSWORD || !body.method) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    const challengeId = newChallengeId(`2fa_${body.method}`);
    challenges.set(challengeId, {
      phoneE164: DEMO_PHONE,
      purpose: body.method === "totp" ? "2fa_totp" : "2fa_sms",
    });
    currentSession = { ...currentSession!, requiresReauth: false };
    if (body.method === "totp") {
      return HttpResponse.json({
        challengeId,
        totpSecret: "SOLODEMOSECRET",
        totpUri: "otpauth://totp/Solo:demo?secret=SOLODEMOSECRET&issuer=Solo",
      });
    }
    return HttpResponse.json({ challengeId });
  }),

  http.post("/api/auth/2fa/enable/confirm", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as {
      challengeId?: string;
      code?: string;
    };
    const challenge = body.challengeId
      ? challenges.get(body.challengeId)
      : undefined;
    if (
      !challenge ||
      (challenge.purpose !== "2fa_sms" && challenge.purpose !== "2fa_totp") ||
      body.code !== DEMO_OTP
    ) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    challenges.delete(body.challengeId!);
    twoFactorStatus = twoFactorStatusSchema.parse({
      enabled: true,
      smsEnabled: challenge.purpose === "2fa_sms",
      totpEnabled: challenge.purpose === "2fa_totp",
      recoveryCodesRemaining: 8,
      orgRequires2fa: false,
      adminMandatory: false,
    });
    return HttpResponse.json({
      recoveryCodes: [
        "RCVR-1111",
        "RCVR-2222",
        "RCVR-3333",
        "RCVR-4444",
        "RCVR-5555",
        "RCVR-6666",
        "RCVR-7777",
        "RCVR-8888",
      ],
      status: twoFactorStatus,
    });
  }),

  http.post("/api/auth/2fa/disable", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as {
      password?: string;
      code?: string;
    };
    if (body.password !== DEMO_PASSWORD || body.code !== DEMO_OTP) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    resetTwoFactor();
    return HttpResponse.json(twoFactorStatus);
  }),

  http.post("/api/auth/2fa/recovery/regenerate", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as { password?: string };
    if (body.password !== DEMO_PASSWORD || !twoFactorStatus.enabled) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    twoFactorStatus = {
      ...twoFactorStatus,
      recoveryCodesRemaining: 8,
    };
    return HttpResponse.json({
      recoveryCodes: [
        "RCVR-AAAA",
        "RCVR-BBBB",
        "RCVR-CCCC",
        "RCVR-DDDD",
        "RCVR-EEEE",
        "RCVR-FFFF",
        "RCVR-GGGG",
        "RCVR-HHHH",
      ],
    });
  }),

  http.get("/api/auth/sessions", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    if (deviceSessions.length === 0 && currentSession) {
      seedSessions(currentSession.userId);
    }
    if (scenario === "empty") {
      return HttpResponse.json(deviceSessions.filter((s) => s.isCurrent));
    }
    return HttpResponse.json(deviceSessions);
  }),

  http.delete("/api/auth/sessions/:sessionId", async ({ params, request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as { password?: string };
    if (body.password !== DEMO_PASSWORD) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    const sessionId = String(params.sessionId);
    const target = deviceSessions.find((s) => s.id === sessionId);
    if (!target) {
      return HttpResponse.json(
        errorBody(404, "NOT_FOUND", "errors.not_found"),
        { status: 404 },
      );
    }
    if (target.isCurrent) {
      return HttpResponse.json(
        errorBody(409, "CONFLICT", "errors.validation"),
        { status: 409 },
      );
    }
    deviceSessions = deviceSessions.filter((s) => s.id !== sessionId);
    return HttpResponse.json({ ok: true });
  }),

  http.post("/api/auth/sessions/revoke-others", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as { password?: string };
    if (body.password !== DEMO_PASSWORD) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    deviceSessions = deviceSessions.filter((s) => s.isCurrent);
    return HttpResponse.json({ ok: true });
  }),

  http.post("/api/auth/phone/change/begin", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as {
      password?: string;
      newPhoneE164?: string;
    };
    if (body.password !== DEMO_PASSWORD || !body.newPhoneE164) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    if (body.newPhoneE164 === currentPhoneE164) {
      return HttpResponse.json(
        errorBody(409, "CONFLICT", "errors.validation"),
        { status: 409 },
      );
    }
    const currentChallengeId = newChallengeId("phone_cur");
    const newChallengeIdValue = newChallengeId("phone_new");
    pendingPhoneChange = {
      currentChallengeId,
      newChallengeId: newChallengeIdValue,
      newPhoneE164: body.newPhoneE164,
    };
    currentSession = { ...currentSession!, requiresReauth: false };
    return HttpResponse.json({
      currentChallengeId,
      newChallengeId: newChallengeIdValue,
      currentPhoneMasked: maskPhoneE164(currentPhoneE164),
    });
  }),

  http.post("/api/auth/phone/change/confirm", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as {
      currentChallengeId?: string;
      currentCode?: string;
      newChallengeId?: string;
      newCode?: string;
    };
    if (
      !pendingPhoneChange ||
      body.currentChallengeId !== pendingPhoneChange.currentChallengeId ||
      body.newChallengeId !== pendingPhoneChange.newChallengeId ||
      body.currentCode !== DEMO_OTP ||
      body.newCode !== DEMO_OTP
    ) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    currentPhoneE164 = pendingPhoneChange.newPhoneE164;
    const phoneMasked = maskPhoneE164(currentPhoneE164);
    pendingPhoneChange = null;
    return HttpResponse.json({ phoneMasked });
  }),

  http.post("/api/auth/recovery/support", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const body = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      previousPhoneE164?: string;
      contactPhoneE164?: string;
      details?: string;
    };
    if (
      !body.firstName ||
      !body.lastName ||
      !body.contactPhoneE164 ||
      !body.details?.trim()
    ) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "errors.validation"),
        { status: 400 },
      );
    }
    return HttpResponse.json({
      ticketId: newChallengeId("tkt"),
      status: "submitted",
    });
  }),

  http.get("/api/me/profile", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    if (!mockProfile) {
      mockProfile = userProfileSchema.parse({
        userId: currentSession!.userId,
        firstName: "Demo",
        lastName: "User",
        email: null,
        dateOfBirth: null,
        locale: "fa",
        timeZone: "Asia/Tehran",
        calendar: "jalali",
        digits: "arabext",
        hourCycle: "h23",
        theme: "system",
      });
    }
    return HttpResponse.json(mockProfile);
  }),

  http.patch("/api/me/profile", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as Partial<UserProfile>;
    if (!mockProfile) {
      mockProfile = userProfileSchema.parse({
        userId: currentSession!.userId,
        firstName: "Demo",
        lastName: "User",
        email: null,
        dateOfBirth: null,
        locale: "fa",
        timeZone: "Asia/Tehran",
        calendar: "jalali",
        digits: "arabext",
        hourCycle: "h23",
        theme: "system",
      });
    }
    mockProfile = userProfileSchema.parse({ ...mockProfile, ...body });
    return HttpResponse.json(mockProfile);
  }),

  http.get("/api/auth/personas", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    return HttpResponse.json(
      mockPersonas.map((p) => availablePersonaSchema.parse(p)),
    );
  }),

  http.get("/api/auth/contexts", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    return HttpResponse.json(
      mockContexts.map((c) => availableContextSchema.parse(c)),
    );
  }),

  http.post("/api/auth/personas/teacher/activate", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    mockPersonas = mockPersonas.map((p) =>
      p.persona === "teacher" ? { ...p, activated: true } : p,
    );
    mockTeacherDash = {
      plan: "teacher_free",
      studentsCount: 2,
      classesCount: 1,
      upcomingSessionsCount: 1,
    };
    return HttpResponse.json({ persona: "teacher" });
  }),

  http.get("/api/teacher/dashboard", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    return HttpResponse.json(teacherDashboardSchema.parse(mockTeacherDash));
  }),

  http.get("/api/student/relationships/pending", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    if (scenario === "empty") {
      return HttpResponse.json([]);
    }
    return HttpResponse.json(mockPendingStudentRels);
  }),

  http.post("/api/auth/personas/student/activate", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as { relationshipId?: string };
    const found = mockPendingStudentRels.find(
      (r) => String(r.id) === body.relationshipId,
    );
    if (!found) {
      return HttpResponse.json(
        errorBody(404, "NOT_FOUND", "student.relationship.notFound"),
        { status: 404 },
      );
    }
    const activated = studentRelationshipSchema.parse({
      ...found,
      status: "active",
    });
    mockPendingStudentRels = mockPendingStudentRels.filter(
      (r) => String(r.id) !== body.relationshipId,
    );
    mockActiveStudentRels = [...mockActiveStudentRels, activated];
    mockStudentDash = {
      activeSubjectsCount: mockActiveStudentRels.length,
      upcomingSessionsCount: 1,
      openAssignmentsCount: 2,
      relationships: mockActiveStudentRels,
    };
    mockPersonas = mockPersonas.map((p) =>
      p.persona === "student" ? { ...p, activated: true } : p,
    );
    return HttpResponse.json({ persona: "student" });
  }),

  http.get("/api/student/dashboard", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    return HttpResponse.json(studentDashboardSchema.parse(mockStudentDash));
  }),

  http.get("/api/guardian/relationships/pending", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    if (scenario === "empty") {
      return HttpResponse.json([]);
    }
    return HttpResponse.json(mockPendingGuardianRels);
  }),

  http.post("/api/auth/personas/guardian/activate", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as { relationshipId?: string };
    const found = mockPendingGuardianRels.find(
      (r) => String(r.id) === body.relationshipId,
    );
    if (!found) {
      return HttpResponse.json(
        errorBody(404, "NOT_FOUND", "guardian.relationship.notFound"),
        { status: 404 },
      );
    }
    const activated = guardianRelationshipSchema.parse({
      ...found,
      status: "active",
    });
    mockPendingGuardianRels = mockPendingGuardianRels.filter(
      (r) => String(r.id) !== body.relationshipId,
    );
    mockActiveGuardianRels = [...mockActiveGuardianRels, activated];
    mockGuardianDash = {
      linkedStudentsCount: mockActiveGuardianRels.length,
      upcomingSessionsCount: 1,
      unreadUpdatesCount: 3,
      relationships: mockActiveGuardianRels,
    };
    mockPersonas = mockPersonas.map((p) =>
      p.persona === "guardian" ? { ...p, activated: true } : p,
    );
    return HttpResponse.json({ persona: "guardian" });
  }),

  http.get("/api/guardian/dashboard", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    return HttpResponse.json(guardianDashboardSchema.parse(mockGuardianDash));
  }),

  http.post("/api/organizations", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as { name?: string; type?: string };
    if (!body.name || (body.type !== "school" && body.type !== "institute")) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "errors.validation"),
        { status: 400 },
      );
    }
    const id = opaqueIdSchema.parse(
      `org_${Math.random().toString(36).slice(2, 10)}`,
    );
    const mainBranchId = opaqueIdSchema.parse(`br_main_${id}`);
    const org = organizationSchema.parse({
      id,
      name: body.name,
      type: body.type,
      mainBranchId,
      mainBranchName: "Main Branch",
      ownerRole: "owner",
      trialDaysLeft: 14,
      branchesCount: 1,
      membersCount: 1,
      publicProfilePublished: false,
    });
    mockOrgs.set(id, org);
    mockBranches.set(id, [
      branchSchema.parse({
        id: mainBranchId,
        organizationId: id,
        name: "Main Branch",
        code: "MAIN",
        isMain: true,
        status: "active",
        effectiveFrom: new Date().toISOString().slice(0, 10),
        effectiveTo: null,
        address: "",
      }),
    ]);
    seedOwnerMembership({
      organizationId: id,
      userId: currentSession!.userId,
      displayName: currentSession!.displayName,
      phoneE164: currentPhoneE164,
      mainBranchId,
    });
    mockMembersByOrg.set(id, [
      {
        id: opaqueIdSchema.parse(`mem_owner_${id}`),
        organizationId: id,
        displayName: currentSession!.displayName,
        phoneMasked: maskPhoneE164(currentPhoneE164),
        phoneE164: currentPhoneE164,
        userId: currentSession!.userId,
        role: "owner",
        branchIds: [mainBranchId],
        status: "active",
        joinedAt: new Date().toISOString(),
      },
    ]);
    mockContexts = [
      ...mockContexts.filter((c) => c.organizationId !== id),
      {
        id,
        kind: "organization",
        label: org.name,
        organizationId: id,
      },
    ];
    persistMswState();
    return HttpResponse.json(org);
  }),

  http.get("/api/organizations/:orgId", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const org = mockOrgs.get(String(params.orgId));
    if (!org) {
      return HttpResponse.json(
        errorBody(404, "NOT_FOUND", "errors.not_found"),
        { status: 404 },
      );
    }
    return HttpResponse.json(org);
  }),

  http.get("/api/organizations/:orgId/members", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    if (scenario === "forbidden") {
      return HttpResponse.json(
        errorBody(403, "FORBIDDEN", "errors.forbidden"),
        { status: 403 },
      );
    }
    const orgId = String(params.orgId);
    if (!mockOrgs.get(orgId)) {
      return HttpResponse.json(
        errorBody(404, "NOT_FOUND", "errors.not_found"),
        { status: 404 },
      );
    }
    if (scenario === "empty") {
      return HttpResponse.json({
        data: [],
        meta: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
      });
    }
    const rows = mockMembersByOrg.get(orgId) ?? [];
    const data = rows.map((row) =>
      orgMemberSchema.parse({
        id: row.id,
        organizationId: row.organizationId,
        displayName: row.displayName,
        phoneMasked: row.phoneMasked,
        role: row.role,
        branchIds: row.branchIds,
        status: row.status,
        invitedAt: row.invitedAt,
        joinedAt: row.joinedAt,
      }),
    );
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/members/invite",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      if (scenario === "forbidden") {
        return HttpResponse.json(
          errorBody(403, "FORBIDDEN", "errors.forbidden"),
          { status: 403 },
        );
      }
      const orgId = String(params.orgId);
      const org = mockOrgs.get(orgId);
      if (!org) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const body = (await request.json()) as {
        phoneE164?: string;
        role?: string;
        displayName?: string;
      };
      const roleParsed = orgRoleSchema.safeParse(body.role);
      if (
        !body.phoneE164 ||
        !roleParsed.success ||
        !ASSIGNABLE_ORG_ROLES.includes(roleParsed.data) ||
        !body.displayName?.trim()
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const rows = mockMembersByOrg.get(orgId) ?? [];
      if (rows.some((row) => row.phoneE164 === body.phoneE164)) {
        return HttpResponse.json(
          errorBody(409, "CONFLICT", "organization.invite.duplicate"),
          { status: 409 },
        );
      }
      const id = opaqueIdSchema.parse(
        `mem_${Math.random().toString(36).slice(2, 10)}`,
      );
      const member = {
        id,
        organizationId: org.id,
        displayName: body.displayName.trim(),
        phoneMasked: maskPhoneE164(body.phoneE164),
        phoneE164: body.phoneE164,
        userId: null as string | null,
        role: roleParsed.data as OrgRole,
        branchIds: [org.mainBranchId],
        status: "invited" as const,
        invitedAt: new Date().toISOString(),
      };
      mockMembersByOrg.set(orgId, [...rows, member]);
      mockOrgs.set(orgId, {
        ...org,
        membersCount: org.membersCount + 1,
      });
      return HttpResponse.json(
        inviteStaffResultSchema.parse({
          inviteId: id,
          status: "sent",
          member: orgMemberSchema.parse({
            id: member.id,
            organizationId: member.organizationId,
            displayName: member.displayName,
            phoneMasked: member.phoneMasked,
            role: member.role,
            branchIds: member.branchIds,
            status: member.status,
            invitedAt: member.invitedAt,
          }),
        }),
      );
    },
  ),

  http.patch(
    "/api/organizations/:orgId/members/:memberId",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const memberId = String(params.memberId);
      const rows = mockMembersByOrg.get(orgId) ?? [];
      const index = rows.findIndex((row) => String(row.id) === memberId);
      if (index < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const body = (await request.json()) as { role?: string };
      const roleParsed = orgRoleSchema.safeParse(body.role);
      if (!roleParsed.success || roleParsed.data === "owner") {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const current = rows[index]!;
      if (current.role === "owner") {
        return HttpResponse.json(
          errorBody(409, "CONFLICT", "organization.roles.ownerImmutable"),
          { status: 409 },
        );
      }
      const next = { ...current, role: roleParsed.data };
      const updated = [...rows];
      updated[index] = next;
      mockMembersByOrg.set(orgId, updated);
      return HttpResponse.json(
        orgMemberSchema.parse({
          id: next.id,
          organizationId: next.organizationId,
          displayName: next.displayName,
          phoneMasked: next.phoneMasked,
          role: next.role,
          branchIds: next.branchIds,
          status: next.status,
          invitedAt: next.invitedAt,
          joinedAt: next.joinedAt,
        }),
      );
    },
  ),

  http.delete(
    "/api/organizations/:orgId/members/:memberId",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const memberId = String(params.memberId);
      const rows = mockMembersByOrg.get(orgId) ?? [];
      const target = rows.find((row) => String(row.id) === memberId);
      if (!target) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      if (target.role === "owner") {
        return HttpResponse.json(
          errorBody(409, "CONFLICT", "organization.member.ownerCannotRevoke"),
          { status: 409 },
        );
      }
      mockMembersByOrg.set(
        orgId,
        rows.filter((row) => String(row.id) !== memberId),
      );
      const org = mockOrgs.get(orgId);
      if (org) {
        mockOrgs.set(orgId, {
          ...org,
          membersCount: Math.max(1, org.membersCount - 1),
        });
      }
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.post("/api/auth/persona", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    if (!currentSession) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    const body = (await request.json()) as { persona: string };
    currentSession = sessionSchema.parse({
      ...currentSession,
      activePersona: body.persona,
    });
    persistMswState();
    return HttpResponse.json(currentSession);
  }),

  http.post("/api/auth/context", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    if (!currentSession) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    const body = (await request.json()) as {
      organizationId: string | null;
      subjectId?: string | null;
    };
    let orgRole = null as OrgRole | null;
    if (body.organizationId) {
      const fromSeed = resolveOrgRoleForUser(
        body.organizationId,
        currentSession.userId,
      );
      const fromHandler = (
        mockMembersByOrg.get(body.organizationId) ?? []
      ).find(
        (row) =>
          row.userId === currentSession!.userId && row.status === "active",
      )?.role;
      orgRole = fromSeed ?? fromHandler ?? "owner";
    }
    currentSession = sessionSchema.parse({
      ...currentSession,
      organizationId: body.organizationId,
      subjectId: body.subjectId ?? null,
      orgRole,
    });
    persistMswState();
    return HttpResponse.json(currentSession);
  }),

  http.get("/api/subjects", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const url = new URL(request.url);
    const organizationId = url.searchParams.get("organizationId");
    const data = [...mockSubjects.values()].filter((row) =>
      organizationId
        ? String(row.organizationId) === organizationId
        : row.organizationId === null,
    );
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/subjects",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      if (!mockOrgs.get(orgId)) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const body = (await request.json()) as {
        name?: string;
        code?: string;
        levelLabel?: string;
        teacherDisplayName?: string;
      };
      if (
        !body.name ||
        !body.code ||
        !body.levelLabel ||
        !body.teacherDisplayName
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const id = opaqueIdSchema.parse(
        `sub_${Math.random().toString(36).slice(2, 10)}`,
      );
      const subject = subjectSchema.parse({
        id,
        organizationId: opaqueIdSchema.parse(orgId),
        name: body.name,
        code: body.code.toUpperCase(),
        levelLabel: body.levelLabel,
        teacherDisplayName: body.teacherDisplayName,
        active: true,
      });
      mockSubjects.set(id, subject);
      return HttpResponse.json(subject);
    },
  ),

  http.patch("/api/subjects/:subjectId", async ({ params, request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const subjectId = String(params.subjectId);
    const current = mockSubjects.get(subjectId);
    if (!current) {
      return HttpResponse.json(
        errorBody(404, "NOT_FOUND", "errors.not_found"),
        { status: 404 },
      );
    }
    const body = (await request.json()) as { active?: boolean };
    const next = subjectSchema.parse({
      ...current,
      active: body.active ?? current.active,
    });
    mockSubjects.set(subjectId, next);
    return HttpResponse.json(next);
  }),

  http.get("/api/organizations/:orgId/students", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = [...mockManagedStudents.values()]
      .filter((row) => String(row.organizationId) === orgId)
      .map((row) =>
        managedStudentSchema.parse({
          id: row.id,
          organizationId: row.organizationId,
          displayName: row.displayName,
          phoneMasked: row.phoneMasked,
          status: row.status,
          guardiansCount: row.guardians.length,
        }),
      );
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/students",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        displayName?: string;
        phoneE164?: string;
      };
      if (!body.displayName || !body.phoneE164) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const id = opaqueIdSchema.parse(
        `stu_${Math.random().toString(36).slice(2, 10)}`,
      );
      const record = {
        id,
        organizationId: opaqueIdSchema.parse(orgId),
        displayName: body.displayName,
        phoneMasked: maskPhoneE164(body.phoneE164),
        phoneE164: body.phoneE164,
        status: "invited" as const,
        guardiansCount: 0,
        guardians: [],
        activeSubjectsCount: 0,
      };
      mockManagedStudents.set(id, record);
      return HttpResponse.json(
        managedStudentSchema.parse({
          id: record.id,
          organizationId: record.organizationId,
          displayName: record.displayName,
          phoneMasked: record.phoneMasked,
          status: record.status,
          guardiansCount: 0,
        }),
      );
    },
  ),

  http.get(
    "/api/organizations/:orgId/students/:studentId",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const row = mockManagedStudents.get(String(params.studentId));
      if (!row || String(row.organizationId) !== String(params.orgId)) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      return HttpResponse.json(
        managedStudentDetailSchema.parse({
          id: row.id,
          organizationId: row.organizationId,
          displayName: row.displayName,
          phoneMasked: row.phoneMasked,
          status: row.status,
          guardiansCount: row.guardians.length,
          guardians: row.guardians,
          activeSubjectsCount: row.activeSubjectsCount,
        }),
      );
    },
  ),

  http.post(
    "/api/organizations/:orgId/students/:studentId/guardians",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const studentId = String(params.studentId);
      const row = mockManagedStudents.get(studentId);
      if (!row || String(row.organizationId) !== String(params.orgId)) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const body = (await request.json()) as {
        displayName?: string;
        phoneE164?: string;
        relationshipLabel?: string;
      };
      if (!body.displayName || !body.phoneE164 || !body.relationshipLabel) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const guardian = studentGuardianSchema.parse({
        id: opaqueIdSchema.parse(
          `grd_${Math.random().toString(36).slice(2, 10)}`,
        ),
        displayName: body.displayName,
        phoneMasked: maskPhoneE164(body.phoneE164),
        relationshipLabel: body.relationshipLabel,
        status: "pending",
      });
      mockManagedStudents.set(studentId, {
        ...row,
        guardians: [...row.guardians, guardian],
        guardiansCount: row.guardians.length + 1,
      });
      return HttpResponse.json(guardian);
    },
  ),

  http.get("/api/organizations/:orgId/terms", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockTerms.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post("/api/organizations/:orgId/terms", async ({ params, request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const body = (await request.json()) as {
      name?: string;
      startsOn?: string;
      endsOn?: string;
    };
    if (!body.name?.trim() || !body.startsOn || !body.endsOn) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "courses.validation.term"),
        { status: 400 },
      );
    }
    const row = termSchema.parse({
      id: opaqueIdSchema.parse(
        `trm_${Math.random().toString(36).slice(2, 10)}`,
      ),
      organizationId: opaqueIdSchema.parse(orgId),
      name: body.name.trim(),
      startsOn: body.startsOn,
      endsOn: body.endsOn,
    });
    mockTerms.set(orgId, [...(mockTerms.get(orgId) ?? []), row]);
    persistMswState();
    return HttpResponse.json(row, { status: 201 });
  }),

  http.get("/api/organizations/:orgId/courses", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = [...mockCourses.values()].filter(
      (c) => String(c.organizationId) === orgId,
    );
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/courses",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const body = (await request.json()) as {
        name?: string;
        subjectId?: string;
        subjectName?: string;
        termId?: string | null;
      };
      if (!body.name || !body.subjectId || !body.subjectName) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const orgId = String(params.orgId);
      const term =
        body.termId != null
          ? (mockTerms.get(orgId) ?? []).find(
              (row) => String(row.id) === body.termId,
            )
          : null;
      const id = opaqueIdSchema.parse(
        `crs_${Math.random().toString(36).slice(2, 10)}`,
      );
      const course = courseSchema.parse({
        id,
        organizationId: opaqueIdSchema.parse(orgId),
        name: body.name,
        subjectId: opaqueIdSchema.parse(body.subjectId),
        subjectName: body.subjectName,
        status: "draft",
        termId: term?.id ?? null,
        termName: term?.name ?? null,
        clonedFromId: null,
        classesCount: 0,
      });
      mockCourses.set(id, course);
      mockClasses.set(id, []);
      return HttpResponse.json(course);
    },
  ),

  http.post(
    "/api/organizations/:orgId/courses/:courseId/clone",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const courseId = String(params.courseId);
      const source = mockCourses.get(courseId);
      if (!source) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const id = opaqueIdSchema.parse(
        `crs_${Math.random().toString(36).slice(2, 10)}`,
      );
      const cloned = courseSchema.parse({
        ...source,
        id,
        name: `${source.name} (clone)`,
        status: "draft",
        clonedFromId: source.id,
        classesCount: 0,
      });
      mockCourses.set(id, cloned);
      mockClasses.set(id, []);
      persistMswState();
      return HttpResponse.json(cloned, { status: 201 });
    },
  ),

  http.get(
    "/api/organizations/:orgId/courses/:courseId/classes",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const data = mockClasses.get(String(params.courseId)) ?? [];
      return HttpResponse.json({
        data,
        meta: {
          page: 1,
          pageSize: Math.max(data.length, 1),
          totalItems: data.length,
          totalPages: 1,
        },
      });
    },
  ),

  http.post(
    "/api/organizations/:orgId/courses/:courseId/classes",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const courseId = String(params.courseId);
      const course = mockCourses.get(courseId);
      if (!course) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const body = (await request.json()) as {
        name?: string;
        capacity?: number;
      };
      if (!body.name || !body.capacity) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const id = opaqueIdSchema.parse(
        `cls_${Math.random().toString(36).slice(2, 10)}`,
      );
      const room = classSchema.parse({
        id,
        courseId: opaqueIdSchema.parse(courseId),
        name: body.name,
        capacity: body.capacity,
        enrolledCount: 0,
        status: "draft",
        continuedFromId: null,
        midCourseEntry: false,
      });
      const next = [...(mockClasses.get(courseId) ?? []), room];
      mockClasses.set(courseId, next);
      mockCourses.set(courseId, {
        ...course,
        classesCount: next.length,
        status: course.status === "draft" ? "published" : course.status,
      });
      return HttpResponse.json(room);
    },
  ),

  http.post(
    "/api/organizations/:orgId/courses/:courseId/classes/:classId/continue",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const courseId = String(params.courseId);
      const classId = String(params.classId);
      const course = mockCourses.get(courseId);
      const source = (mockClasses.get(courseId) ?? []).find(
        (row) => String(row.id) === classId,
      );
      if (!course || !source) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const id = opaqueIdSchema.parse(
        `cls_${Math.random().toString(36).slice(2, 10)}`,
      );
      const continued = classSchema.parse({
        ...source,
        id,
        name: `${source.name} (continued)`,
        enrolledCount: 0,
        status: "draft",
        continuedFromId: source.id,
        midCourseEntry: false,
      });
      const next = [...(mockClasses.get(courseId) ?? []), continued];
      mockClasses.set(courseId, next);
      mockCourses.set(courseId, { ...course, classesCount: next.length });
      persistMswState();
      return HttpResponse.json(continued, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/courses/:courseId/classes/:classId/mid-course-entry",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const courseId = String(params.courseId);
      const classId = String(params.classId);
      const rows = mockClasses.get(courseId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === classId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const updated = classSchema.parse({
        ...rows[idx]!,
        midCourseEntry: true,
        status:
          rows[idx]!.status === "draft" ? "enrollment_open" : rows[idx]!.status,
      });
      mockClasses.set(
        courseId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/organizations/:orgId/enrollments", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = [...mockEnrollments.values()].filter(
      (row) => String(row.organizationId) === orgId,
    );
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/enrollments",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const body = (await request.json()) as {
        studentId?: string;
        studentDisplayName?: string;
        classId?: string;
        className?: string;
        courseName?: string;
      };
      if (
        !body.studentId ||
        !body.studentDisplayName ||
        !body.classId ||
        !body.className ||
        !body.courseName
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const id = opaqueIdSchema.parse(
        `enr_${Math.random().toString(36).slice(2, 10)}`,
      );
      const enrollment = enrollmentSchema.parse({
        id,
        organizationId: opaqueIdSchema.parse(String(params.orgId)),
        studentId: opaqueIdSchema.parse(body.studentId),
        studentDisplayName: body.studentDisplayName,
        classId: opaqueIdSchema.parse(body.classId),
        className: body.className,
        courseName: body.courseName,
        status: "active",
        enrolledAt: new Date().toISOString(),
      });
      mockEnrollments.set(id, enrollment);
      return HttpResponse.json(enrollment);
    },
  ),

  http.patch(
    "/api/organizations/:orgId/enrollments/:enrollmentId",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const current = mockEnrollments.get(String(params.enrollmentId));
      if (!current) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const body = (await request.json()) as { status?: string };
      const next = enrollmentSchema.parse({
        ...current,
        status: body.status ?? current.status,
      });
      mockEnrollments.set(String(params.enrollmentId), next);
      return HttpResponse.json(next);
    },
  ),

  http.get("/api/organizations/:orgId/sessions", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = [...mockSessions.values()]
      .filter((row) => String(row.organizationId) === orgId)
      .map((row) => classSessionSchema.parse(row));
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/sessions",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const body = (await request.json()) as {
        classId?: string;
        className?: string;
        startsAt?: string;
        endsAt?: string;
        recurrenceLabel?: string;
      };
      if (!body.classId || !body.className || !body.startsAt || !body.endsAt) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const id = opaqueIdSchema.parse(
        `ses_${Math.random().toString(36).slice(2, 10)}`,
      );
      const starts = new Date(body.startsAt);
      const ends = new Date(body.endsAt);
      const detail = sessionDetailSchema.parse({
        id,
        organizationId: opaqueIdSchema.parse(String(params.orgId)),
        classId: opaqueIdSchema.parse(body.classId),
        className: body.className,
        startsAt: body.startsAt,
        endsAt: body.endsAt,
        status: "scheduled",
        recurrenceLabel: body.recurrenceLabel,
        conflictWarning:
          ends.getTime() <= starts.getTime()
            ? "End time must be after start time"
            : undefined,
        reportStatus: "draft",
        evaluations: [
          {
            studentId: opaqueIdSchema.parse("stu_demo_1"),
            studentDisplayName: "Sara",
            score: null,
            comment: "",
          },
        ],
      });
      mockSessions.set(id, detail);
      mockAttendance.set(id, []);
      return HttpResponse.json(classSessionSchema.parse(detail));
    },
  ),

  http.get(
    "/api/organizations/:orgId/sessions/:sessionId",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const detail = mockSessions.get(String(params.sessionId));
      if (!detail) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      return HttpResponse.json(detail);
    },
  ),

  http.put(
    "/api/organizations/:orgId/sessions/:sessionId/evaluations",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const sessionId = String(params.sessionId);
      const detail = mockSessions.get(sessionId);
      if (!detail) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      if (detail.reportStatus === "published") {
        return HttpResponse.json(
          errorBody(409, "CONFLICT", "sessions.reportPublished"),
          { status: 409 },
        );
      }
      const body = (await request.json()) as {
        studentId: string;
        studentDisplayName: string;
        score: number | null;
        comment: string;
      };
      const evaluations = detail.evaluations.map((item) =>
        String(item.studentId) === body.studentId ? body : item,
      );
      const next = sessionDetailSchema.parse({ ...detail, evaluations });
      mockSessions.set(sessionId, next);
      return HttpResponse.json(next);
    },
  ),

  http.post(
    "/api/organizations/:orgId/sessions/:sessionId/publish",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const sessionId = String(params.sessionId);
      const detail = mockSessions.get(sessionId);
      if (!detail) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const next = sessionDetailSchema.parse({
        ...detail,
        reportStatus: "published",
        status: "completed",
      });
      mockSessions.set(sessionId, next);
      return HttpResponse.json(next);
    },
  ),

  http.get(
    "/api/organizations/:orgId/sessions/:sessionId/attendance",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const sessionId = String(params.sessionId);
      if (!mockSessions.has(sessionId)) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const records = mockAttendance.get(sessionId) ?? [];
      return HttpResponse.json(
        attendanceReportSchema.parse({
          present: records.filter((r) => r.status === "present").length,
          absent: records.filter((r) => r.status === "absent").length,
          late: records.filter((r) => r.status === "late").length,
          excused: records.filter((r) => r.status === "excused").length,
          records,
        }),
      );
    },
  ),

  http.post(
    "/api/organizations/:orgId/sessions/:sessionId/attendance",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const sessionId = String(params.sessionId);
      if (!mockSessions.has(sessionId)) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const body = (await request.json()) as {
        studentId?: string;
        studentDisplayName?: string;
        status?: "present" | "absent" | "late" | "excused";
      };
      if (!body.studentId || !body.studentDisplayName || !body.status) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const records = mockAttendance.get(sessionId) ?? [];
      const existing = records.findIndex(
        (row) => String(row.studentId) === body.studentId,
      );
      const record = {
        id:
          existing >= 0
            ? records[existing]!.id
            : opaqueIdSchema.parse(
                `att_${Math.random().toString(36).slice(2, 10)}`,
              ),
        sessionId: opaqueIdSchema.parse(sessionId),
        studentId: opaqueIdSchema.parse(body.studentId),
        studentDisplayName: body.studentDisplayName,
        status: body.status,
      };
      const next =
        existing >= 0
          ? records.map((row, index) => (index === existing ? record : row))
          : [...records, record];
      mockAttendance.set(sessionId, next);
      return HttpResponse.json(
        attendanceReportSchema.parse({
          present: next.filter((r) => r.status === "present").length,
          absent: next.filter((r) => r.status === "absent").length,
          late: next.filter((r) => r.status === "late").length,
          excused: next.filter((r) => r.status === "excused").length,
          records: next,
        }),
      );
    },
  ),

  http.get("/api/organizations/:orgId/assignments", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockAssignments.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/assignments",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        title?: string;
        type?: Assignment["type"];
        dueAt?: string;
        collaborationMode?: Assignment["collaborationMode"];
        peerReviewEnabled?: boolean;
        maxRevisions?: number;
      };
      if (!body.title || !body.type || !body.dueAt) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const item = assignmentSchema.parse({
        id: opaqueIdSchema.parse(
          `asg_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        title: body.title.trim(),
        type: body.type,
        dueAt: body.dueAt,
        status: "published",
        submissionsCount: 0,
        collaborationMode: body.collaborationMode ?? "individual",
        peerReviewEnabled: body.peerReviewEnabled ?? false,
        maxRevisions: body.maxRevisions ?? 1,
        gradeRelease: "hidden",
        teamsCount: 0,
        peerReviewsCount: 0,
        revisionsCount: 0,
      });
      mockAssignments.set(orgId, [...(mockAssignments.get(orgId) ?? []), item]);
      persistMswState();
      return HttpResponse.json(item, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/assignments/:assignmentId/submissions",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const assignmentId = String(params.assignmentId);
      const body = (await request.json()) as {
        studentDisplayName?: string;
        mimeHint?: "pdf" | "word" | "image" | "audio";
      };
      if (!body.studentDisplayName || !body.mimeHint) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      if (body.mimeHint === ("video" as string)) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const rows = mockAssignments.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === assignmentId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const current = rows[idx]!;
      const updated = assignmentSchema.parse({
        ...current,
        submissionsCount: current.submissionsCount + 1,
      });
      mockAssignments.set(
        orgId,
        rows.map((row, index) => (index === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated, { status: 201 });
    },
  ),

  http.get(
    "/api/organizations/:orgId/assignments/:assignmentId/teams",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const key = `${String(params.orgId)}:${String(params.assignmentId)}`;
      const data = mockAssignmentTeams.get(key) ?? [];
      return HttpResponse.json({
        data,
        meta: {
          page: 1,
          pageSize: Math.max(data.length, 1),
          totalItems: data.length,
          totalPages: 1,
        },
      });
    },
  ),

  http.post(
    "/api/organizations/:orgId/assignments/:assignmentId/teams",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const assignmentId = String(params.assignmentId);
      const body = (await request.json()) as {
        name?: string;
        memberNames?: string[];
      };
      const rows = mockAssignments.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === assignmentId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const current = rows[idx]!;
      if (current.collaborationMode !== "group") {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "assignments.teamNotGroup"),
          { status: 400 },
        );
      }
      if (!body.name?.trim() || !body.memberNames?.length) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const team = assignmentTeamSchema.parse({
        id: opaqueIdSchema.parse(
          `atm_${Math.random().toString(36).slice(2, 10)}`,
        ),
        assignmentId: current.id,
        name: body.name.trim(),
        memberNames: body.memberNames
          .map((name) => name.trim())
          .filter(Boolean),
      });
      const key = `${orgId}:${assignmentId}`;
      mockAssignmentTeams.set(key, [
        ...(mockAssignmentTeams.get(key) ?? []),
        team,
      ]);
      const updated = assignmentSchema.parse({
        ...current,
        teamsCount: current.teamsCount + 1,
      });
      mockAssignments.set(
        orgId,
        rows.map((row, index) => (index === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(team, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/assignments/:assignmentId/peer-reviews",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const assignmentId = String(params.assignmentId);
      const body = (await request.json()) as {
        reviewerName?: string;
        revieweeName?: string;
        score?: number;
      };
      if (!body.reviewerName || !body.revieweeName || body.score == null) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const rows = mockAssignments.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === assignmentId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const current = rows[idx]!;
      if (!current.peerReviewEnabled) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "assignments.peerDisabled"),
          { status: 400 },
        );
      }
      const updated = assignmentSchema.parse({
        ...current,
        peerReviewsCount: current.peerReviewsCount + 1,
      });
      mockAssignments.set(
        orgId,
        rows.map((row, index) => (index === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/assignments/:assignmentId/revisions",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const assignmentId = String(params.assignmentId);
      const body = (await request.json()) as {
        studentDisplayName?: string;
        note?: string;
      };
      if (!body.studentDisplayName) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const rows = mockAssignments.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === assignmentId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const current = rows[idx]!;
      if (!canRequestRevision(current)) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "assignments.revisionLimit"),
          { status: 400 },
        );
      }
      const updated = assignmentSchema.parse({
        ...current,
        revisionsCount: current.revisionsCount + 1,
      });
      mockAssignments.set(
        orgId,
        rows.map((row, index) => (index === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/assignments/:assignmentId/grade-release",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const assignmentId = String(params.assignmentId);
      const rows = mockAssignments.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === assignmentId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const current = rows[idx]!;
      const updated = assignmentSchema.parse({
        ...current,
        gradeRelease: "released",
      });
      mockAssignments.set(
        orgId,
        rows.map((row, index) => (index === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/organizations/:orgId/gradebook", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockGradebook.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/gradebook",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        studentDisplayName?: string;
        subjectName?: string;
        score?: number;
      };
      if (
        !body.studentDisplayName ||
        !body.subjectName ||
        typeof body.score !== "number"
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const rows = mockGradebook.get(orgId) ?? [];
      const existing = rows.findIndex(
        (row) =>
          row.studentDisplayName === body.studentDisplayName &&
          row.subjectName === body.subjectName,
      );
      const item = gradeEntrySchema.parse({
        id:
          existing >= 0
            ? rows[existing]!.id
            : opaqueIdSchema.parse(
                `grd_${Math.random().toString(36).slice(2, 10)}`,
              ),
        organizationId: opaqueIdSchema.parse(orgId),
        studentDisplayName: body.studentDisplayName.trim(),
        subjectName: body.subjectName.trim(),
        score: body.score,
        published: true,
      });
      const next =
        existing >= 0
          ? rows.map((row, index) => (index === existing ? item : row))
          : [...rows, item];
      mockGradebook.set(orgId, next);
      persistMswState();
      return HttpResponse.json(item, { status: existing >= 0 ? 200 : 201 });
    },
  ),

  http.get("/api/messaging/threads", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    return HttpResponse.json({
      data: mockMessageThreads,
      meta: {
        page: 1,
        pageSize: Math.max(mockMessageThreads.length, 1),
        totalItems: mockMessageThreads.length,
        totalPages: 1,
      },
    });
  }),

  http.post("/api/messaging/direct", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as {
      subjectScope?: string;
      participantLabel?: string;
      body?: string;
    };
    if (!body.subjectScope || !body.participantLabel || !body.body) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "errors.validation"),
        { status: 400 },
      );
    }
    const item = messageThreadSchema.parse({
      id: opaqueIdSchema.parse(
        `msg_${Math.random().toString(36).slice(2, 10)}`,
      ),
      subjectScope: body.subjectScope.trim(),
      participantLabel: body.participantLabel.trim(),
      lastPreview: body.body.trim().slice(0, 120),
      unreadCount: 0,
      kind: "direct",
    });
    mockMessageThreads.unshift(item);
    persistMswState();
    return HttpResponse.json(item, { status: 201 });
  }),

  http.post("/api/messaging/broadcast", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as {
      subjectScope?: string;
      body?: string;
    };
    if (!body.subjectScope || !body.body) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "errors.validation"),
        { status: 400 },
      );
    }
    const item = messageThreadSchema.parse({
      id: opaqueIdSchema.parse(
        `msg_${Math.random().toString(36).slice(2, 10)}`,
      ),
      subjectScope: body.subjectScope.trim(),
      participantLabel: "Broadcast",
      lastPreview: body.body.trim().slice(0, 120),
      unreadCount: 0,
      kind: "broadcast",
    });
    mockMessageThreads.unshift(item);
    persistMswState();
    return HttpResponse.json(item, { status: 201 });
  }),

  http.get("/api/chat/rooms", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    return HttpResponse.json({
      data: mockChatRooms,
      meta: {
        page: 1,
        pageSize: Math.max(mockChatRooms.length, 1),
        totalItems: mockChatRooms.length,
        totalPages: 1,
      },
    });
  }),

  http.post("/api/chat/rooms", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as {
      name?: string;
      scope?: ChatRoom["scope"];
    };
    if (!body.name || !body.scope) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "errors.validation"),
        { status: 400 },
      );
    }
    const item = chatRoomSchema.parse({
      id: opaqueIdSchema.parse(
        `room_${Math.random().toString(36).slice(2, 10)}`,
      ),
      name: body.name.trim(),
      scope: body.scope,
      visibility: body.scope === "organization" ? "organization" : "private",
      memberCount: 1,
    });
    mockChatRooms.unshift(item);
    mockChatMessages.set(String(item.id), []);
    persistMswState();
    return HttpResponse.json(item, { status: 201 });
  }),

  http.get("/api/chat/rooms/:roomId/messages", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const data = mockChatMessages.get(String(params.roomId)) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post("/api/chat/rooms/:roomId/messages", async ({ params, request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as { body?: string };
    if (!body.body) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "errors.validation"),
        { status: 400 },
      );
    }
    const roomId = String(params.roomId);
    const item = chatMessageSchema.parse({
      id: opaqueIdSchema.parse(
        `cmsg_${Math.random().toString(36).slice(2, 10)}`,
      ),
      roomId: opaqueIdSchema.parse(roomId),
      authorLabel: "You",
      body: body.body.trim(),
      createdAt: new Date().toISOString(),
    });
    mockChatMessages.set(roomId, [
      ...(mockChatMessages.get(roomId) ?? []),
      item,
    ]);
    return HttpResponse.json(item, { status: 201 });
  }),

  http.get("/api/notifications", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    return HttpResponse.json({
      data: mockNotifications,
      meta: {
        page: 1,
        pageSize: Math.max(mockNotifications.length, 1),
        totalItems: mockNotifications.length,
        totalPages: 1,
      },
    });
  }),

  http.get("/api/notifications/preferences", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    return HttpResponse.json(
      notificationPreferencesSchema.parse(mockNotificationPrefs),
    );
  }),

  http.put("/api/notifications/preferences", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    mockNotificationPrefs = notificationPreferencesSchema.parse(
      await request.json(),
    );
    return HttpResponse.json(mockNotificationPrefs);
  }),

  http.post("/api/notifications/:id/read", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const idx = mockNotifications.findIndex(
      (n) => String(n.id) === String(params.id),
    );
    if (idx < 0) {
      return HttpResponse.json(
        errorBody(404, "NOT_FOUND", "errors.not_found"),
        { status: 404 },
      );
    }
    mockNotifications[idx] = { ...mockNotifications[idx]!, unread: false };
    return HttpResponse.json(notificationSchema.parse(mockNotifications[idx]));
  }),

  http.get("/api/calendar/upcoming", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    return HttpResponse.json({
      data: mockCalendarEvents,
      meta: {
        page: 1,
        pageSize: Math.max(mockCalendarEvents.length, 1),
        totalItems: mockCalendarEvents.length,
        totalPages: 1,
      },
    });
  }),

  http.get("/api/organizations/:orgId/tuition", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const data = mockTuition.get(String(params.orgId)) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/tuition",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        studentDisplayName?: string;
        amountMinor?: number;
        dueAt?: string;
        status?: TuitionRecord["status"];
      };
      if (
        !body.studentDisplayName ||
        typeof body.amountMinor !== "number" ||
        !body.dueAt ||
        !body.status
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const item = tuitionRecordSchema.parse({
        id: opaqueIdSchema.parse(
          `tui_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        studentDisplayName: body.studentDisplayName.trim(),
        amountMinor: body.amountMinor,
        currency: "IRR",
        status: body.status,
        dueAt: body.dueAt,
      });
      mockTuition.set(orgId, [...(mockTuition.get(orgId) ?? []), item]);
      persistMswState();
      return HttpResponse.json(item, { status: 201 });
    },
  ),

  http.get("/api/organizations/:orgId/resources", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const data = mockResources.get(String(params.orgId)) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/resources",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        subjectName?: string;
        title?: string;
        mimeHint?: ResourceFile["mimeHint"];
      };
      if (!body.subjectName || !body.title || !body.mimeHint) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const existing = (mockResources.get(orgId) ?? []).filter(
        (row) =>
          row.subjectName === body.subjectName!.trim() &&
          row.title === body.title!.trim(),
      );
      const item = resourceFileSchema.parse({
        id: opaqueIdSchema.parse(
          `res_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        subjectName: body.subjectName.trim(),
        title: body.title.trim(),
        version: existing.length + 1,
        securityState: "safe",
        mimeHint: body.mimeHint,
      });
      mockResources.set(orgId, [...(mockResources.get(orgId) ?? []), item]);
      persistMswState();
      return HttpResponse.json(item, { status: 201 });
    },
  ),

  http.get("/api/organizations/:orgId/reports", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const data = mockReports.get(String(params.orgId)) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/reports",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        name?: string;
        kind?: ReportView["kind"];
        format?: ReportView["format"];
      };
      if (!body.name || !body.kind || !body.format) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const item = reportViewSchema.parse({
        id: opaqueIdSchema.parse(
          `rpt_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        name: body.name.trim(),
        kind: body.kind,
        format: body.format,
      });
      mockReports.set(orgId, [...(mockReports.get(orgId) ?? []), item]);
      persistMswState();
      return HttpResponse.json(item, { status: 201 });
    },
  ),

  http.get(
    "/api/organizations/:orgId/reports/:viewId/export",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const view = (mockReports.get(String(params.orgId)) ?? []).find(
        (row) => String(row.id) === String(params.viewId),
      );
      if (!view) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      if (view.format === "json") {
        return HttpResponse.json({
          content: JSON.stringify({ kind: view.kind, rows: [] }),
          format: "json",
        });
      }
      return HttpResponse.json({
        content: `kind,value\n${view.kind},0\n`,
        format: "csv",
      });
    },
  ),

  http.get("/api/search", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const data = mockSearchCatalog.filter(
      (hit) => !q || hit.title.toLowerCase().includes(q),
    );
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.get("/api/organizations/:orgId/grade-scales", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockGradeScales.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/grade-scales",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        name?: string;
        type?: GradeScaleType;
        minValue?: number | null;
        maxValue?: number | null;
        passLabel?: string | null;
        failLabel?: string | null;
      };
      if (!body.name?.trim() || !body.type) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "evaluations.validation.name"),
          { status: 400 },
        );
      }
      const defaults = scaleBoundsForType(body.type);
      const row = gradeScaleSchema.parse({
        id: opaqueIdSchema.parse(
          `esc_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        name: body.name.trim(),
        type: body.type,
        minValue:
          body.type === "custom" ? (body.minValue ?? 0) : defaults.minValue,
        maxValue:
          body.type === "custom" ? (body.maxValue ?? 100) : defaults.maxValue,
        passLabel:
          body.type === "pass_fail" ? body.passLabel?.trim() || "Pass" : null,
        failLabel:
          body.type === "pass_fail" ? body.failLabel?.trim() || "Fail" : null,
      });
      const rows = mockGradeScales.get(orgId) ?? [];
      rows.push(row);
      mockGradeScales.set(orgId, rows);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.get(
    "/api/organizations/:orgId/evaluation-levels",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const data = [...(mockEvaluationLevels.get(orgId) ?? [])].sort(
        (a, b) => a.rank - b.rank,
      );
      return HttpResponse.json({
        data,
        meta: {
          page: 1,
          pageSize: Math.max(data.length, 1),
          totalItems: data.length,
          totalPages: 1,
        },
      });
    },
  ),

  http.post(
    "/api/organizations/:orgId/evaluation-levels",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        name?: string;
        rank?: number;
        description?: string;
      };
      if (!body.name?.trim() || body.rank == null) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "evaluations.validation.name"),
          { status: 400 },
        );
      }
      const row = evaluationLevelSchema.parse({
        id: opaqueIdSchema.parse(
          `elv_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        name: body.name.trim(),
        rank: body.rank,
        description: (body.description ?? "").trim(),
      });
      const rows = mockEvaluationLevels.get(orgId) ?? [];
      rows.push(row);
      mockEvaluationLevels.set(orgId, rows);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.get("/api/organizations/:orgId/progress-metrics", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockProgressMetrics.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/progress-metrics",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        name?: string;
        kind?: "core" | "custom";
        unit?: string;
      };
      if (!body.name?.trim() || !body.kind || !body.unit?.trim()) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "evaluations.validation.name"),
          { status: 400 },
        );
      }
      const row = progressMetricSchema.parse({
        id: opaqueIdSchema.parse(
          `epm_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        name: body.name.trim(),
        kind: body.kind,
        unit: body.unit.trim(),
      });
      const rows = mockProgressMetrics.get(orgId) ?? [];
      rows.push(row);
      mockProgressMetrics.set(orgId, rows);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.get(
    "/api/organizations/:orgId/evaluation-templates",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const data = mockEvaluationTemplates.get(orgId) ?? [];
      return HttpResponse.json({
        data,
        meta: {
          page: 1,
          pageSize: Math.max(data.length, 1),
          totalItems: data.length,
          totalPages: 1,
        },
      });
    },
  ),

  http.post(
    "/api/organizations/:orgId/evaluation-templates",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        name?: string;
        domain?: string;
        scaleId?: string;
        levelId?: string | null;
        progressMetricIds?: string[];
        description?: string;
      };
      if (!body.name?.trim() || !body.domain?.trim() || !body.scaleId) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "evaluations.validation.name"),
          { status: 400 },
        );
      }
      const scale = (mockGradeScales.get(orgId) ?? []).find(
        (row) => String(row.id) === body.scaleId,
      );
      if (!scale) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "evaluations.validation.scale"),
          { status: 400 },
        );
      }
      const level =
        body.levelId != null && body.levelId !== ""
          ? (mockEvaluationLevels.get(orgId) ?? []).find(
              (row) => String(row.id) === body.levelId,
            )
          : null;
      const metricIds = (body.progressMetricIds ?? []).filter((id) =>
        (mockProgressMetrics.get(orgId) ?? []).some(
          (row) => String(row.id) === id,
        ),
      );
      const row = evaluationTemplateSchema.parse({
        id: opaqueIdSchema.parse(
          `evt_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        name: body.name.trim(),
        domain: body.domain.trim(),
        scaleId: scale.id,
        scaleName: scale.name,
        levelId: level?.id ?? null,
        levelName: level?.name ?? null,
        progressMetricIds: metricIds,
        description: (body.description ?? "").trim(),
      });
      const rows = mockEvaluationTemplates.get(orgId) ?? [];
      rows.push(row);
      mockEvaluationTemplates.set(orgId, rows);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.get("/api/organizations/:orgId/question-bank", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockQuestionBank.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/question-bank",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        promptHtml?: string;
        type?: QuestionType;
        visibility?: QuestionVisibility;
        tags?: string[];
      };
      if (!body.promptHtml?.trim() || !body.type || !body.visibility) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "questionBank.validation.prompt"),
          { status: 400 },
        );
      }
      const row = bankQuestionSchema.parse({
        id: opaqueIdSchema.parse(
          `qbq_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        promptHtml: body.promptHtml,
        type: body.type,
        visibility: body.visibility,
        tags: body.tags ?? [],
        version: 1,
        forkedFromId: null,
      });
      mockQuestionBank.set(orgId, [
        ...(mockQuestionBank.get(orgId) ?? []),
        row,
      ]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/question-bank/:questionId/fork",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const questionId = String(params.questionId);
      const rows = mockQuestionBank.get(orgId) ?? [];
      const source = rows.find((row) => String(row.id) === questionId);
      if (!source) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const forked = bankQuestionSchema.parse({
        ...source,
        id: opaqueIdSchema.parse(
          `qbq_${Math.random().toString(36).slice(2, 10)}`,
        ),
        version: 1,
        forkedFromId: source.id,
        visibility: "private",
      });
      mockQuestionBank.set(orgId, [...rows, forked]);
      persistMswState();
      return HttpResponse.json(forked, { status: 201 });
    },
  ),

  http.get("/api/organizations/:orgId/exams", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockExams.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post("/api/organizations/:orgId/exams", async ({ params, request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const body = (await request.json()) as {
      title?: string;
      poolSize?: number;
      randomize?: boolean;
      maxAttempts?: number;
      timeLimitMinutes?: number | null;
    };
    if (!body.title?.trim() || !body.poolSize || !body.maxAttempts) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "exams.validation.title"),
        { status: 400 },
      );
    }
    const row = examSchema.parse({
      id: opaqueIdSchema.parse(
        `exm_${Math.random().toString(36).slice(2, 10)}`,
      ),
      organizationId: opaqueIdSchema.parse(orgId),
      title: body.title.trim(),
      poolSize: body.poolSize,
      randomize: Boolean(body.randomize),
      maxAttempts: body.maxAttempts,
      timeLimitMinutes: body.timeLimitMinutes ?? null,
      status: "draft",
    });
    mockExams.set(orgId, [...(mockExams.get(orgId) ?? []), row]);
    persistMswState();
    return HttpResponse.json(row, { status: 201 });
  }),

  http.post(
    "/api/organizations/:orgId/exams/:examId/publish",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const examId = String(params.examId);
      const rows = mockExams.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === examId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const updated = examSchema.parse({
        ...rows[idx]!,
        status: "published",
      });
      mockExams.set(
        orgId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get(
    "/api/organizations/:orgId/exams/:examId/attempts",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const examId = String(params.examId);
      const data = (mockExamAttempts.get(orgId) ?? []).filter(
        (row) => String(row.examId) === examId,
      );
      return HttpResponse.json({
        data,
        meta: {
          page: 1,
          pageSize: Math.max(data.length, 1),
          totalItems: data.length,
          totalPages: 1,
        },
      });
    },
  ),

  http.post(
    "/api/organizations/:orgId/exams/:examId/attempts",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const examId = String(params.examId);
      const body = (await request.json()) as { studentDisplayName?: string };
      const exams = mockExams.get(orgId) ?? [];
      const exam = exams.find((row) => String(row.id) === examId);
      if (!exam) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      if (exam.status !== "published") {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "exams.examNotPublished"),
          { status: 400 },
        );
      }
      if (!body.studentDisplayName?.trim()) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "exams.validation.student"),
          { status: 400 },
        );
      }
      const studentDisplayName = body.studentDisplayName.trim();
      const prior = (mockExamAttempts.get(orgId) ?? []).filter(
        (row) =>
          String(row.examId) === examId &&
          row.studentDisplayName === studentDisplayName,
      );
      if (prior.length >= exam.maxAttempts) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "exams.attemptLimit"),
          { status: 400 },
        );
      }
      const attempt = examAttemptSchema.parse({
        id: opaqueIdSchema.parse(
          `exa_${Math.random().toString(36).slice(2, 10)}`,
        ),
        examId: exam.id,
        organizationId: opaqueIdSchema.parse(orgId),
        studentDisplayName,
        startedAt: new Date().toISOString(),
        submittedAt: null,
        remainingSeconds:
          exam.timeLimitMinutes == null ? null : exam.timeLimitMinutes * 60,
        signals: [],
        status: "in_progress",
      });
      mockExamAttempts.set(orgId, [
        ...(mockExamAttempts.get(orgId) ?? []),
        attempt,
      ]);
      persistMswState();
      return HttpResponse.json(attempt, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/exam-attempts/:attemptId/signals",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const attemptId = String(params.attemptId);
      const body = (await request.json()) as { signal?: AntiCheatSignal };
      const parsed = antiCheatSignalSchema.safeParse(body.signal);
      if (!parsed.success) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const rows = mockExamAttempts.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === attemptId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const updated = examAttemptSchema.parse({
        ...rows[idx]!,
        signals: [...rows[idx]!.signals, parsed.data],
      });
      mockExamAttempts.set(
        orgId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.post(
    "/api/organizations/:orgId/exam-attempts/:attemptId/submit",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const attemptId = String(params.attemptId);
      const rows = mockExamAttempts.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === attemptId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const updated = examAttemptSchema.parse({
        ...rows[idx]!,
        submittedAt: new Date().toISOString(),
        remainingSeconds: 0,
        status: "submitted",
      });
      mockExamAttempts.set(
        orgId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/organizations/:orgId/exam-grades", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockExamGrades.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/exam-grades",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        attemptId?: string;
        score?: number;
        rubricNotes?: string;
        placementRecommendation?: string | null;
        humanOverride?: boolean;
      };
      const attemptId = String(body.attemptId ?? "").trim();
      const score = Number(body.score);
      if (!attemptId || Number.isNaN(score)) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const attempts = mockExamAttempts.get(orgId) ?? [];
      if (!attempts.some((row) => String(row.id) === attemptId)) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const now = new Date().toISOString();
      const created = examGradeSchema.parse({
        id: opaqueIdSchema.parse(
          `exg_${Math.random().toString(36).slice(2, 10)}`,
        ),
        attemptId: opaqueIdSchema.parse(attemptId),
        organizationId: opaqueIdSchema.parse(orgId),
        score,
        rubricNotes: String(body.rubricNotes ?? ""),
        placementRecommendation: body.placementRecommendation ?? null,
        humanOverride: Boolean(body.humanOverride),
        history: [
          {
            score,
            rubricNotes: String(body.rubricNotes ?? ""),
            changedAt: now,
          },
        ],
      });
      mockExamGrades.set(orgId, [
        ...(mockExamGrades.get(orgId) ?? []),
        created,
      ]);
      persistMswState();
      return HttpResponse.json(created, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/exam-grades/:gradeId/regrade",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const gradeId = String(params.gradeId);
      const body = (await request.json()) as {
        score?: number;
        rubricNotes?: string;
        placementRecommendation?: string | null;
        humanOverride?: boolean;
      };
      const score = Number(body.score);
      if (Number.isNaN(score)) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const rows = mockExamGrades.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === gradeId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const existing = rows[idx]!;
      const now = new Date().toISOString();
      const updated = examGradeSchema.parse({
        ...existing,
        score,
        rubricNotes: String(body.rubricNotes ?? existing.rubricNotes),
        placementRecommendation:
          body.placementRecommendation ?? existing.placementRecommendation,
        humanOverride: body.humanOverride ?? true,
        history: [
          ...existing.history,
          {
            score,
            rubricNotes: String(body.rubricNotes ?? existing.rubricNotes),
            changedAt: now,
          },
        ],
      });
      mockExamGrades.set(
        orgId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get(
    "/api/organizations/:orgId/curriculum-modules",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const data = mockCurriculumModules.get(orgId) ?? [];
      return HttpResponse.json({
        data,
        meta: {
          page: 1,
          pageSize: Math.max(data.length, 1),
          totalItems: data.length,
          totalPages: 1,
        },
      });
    },
  ),

  http.post(
    "/api/organizations/:orgId/curriculum-modules",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        title?: string;
        description?: string;
        sortOrder?: number;
      };
      if (!body.title?.trim() || body.sortOrder == null) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "curriculum.validation.title"),
          { status: 400 },
        );
      }
      const row = curriculumModuleSchema.parse({
        id: opaqueIdSchema.parse(
          `cmod_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        title: body.title.trim(),
        description: String(body.description ?? "").trim(),
        sortOrder: Number(body.sortOrder),
      });
      mockCurriculumModules.set(orgId, [
        ...(mockCurriculumModules.get(orgId) ?? []),
        row,
      ]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.get("/api/organizations/:orgId/curriculum-units", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockCurriculumUnits.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/curriculum-units",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        moduleId?: string;
        title?: string;
        description?: string;
        sortOrder?: number;
        prerequisiteUnitId?: string | null;
      };
      const moduleId = String(body.moduleId ?? "").trim();
      const modules = mockCurriculumModules.get(orgId) ?? [];
      const mod = modules.find((row) => String(row.id) === moduleId);
      if (!mod || !body.title?.trim() || body.sortOrder == null) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "curriculum.validation.module"),
          { status: 400 },
        );
      }
      const row = curriculumUnitSchema.parse({
        id: opaqueIdSchema.parse(
          `cunit_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        moduleId: mod.id,
        moduleTitle: mod.title,
        title: body.title.trim(),
        description: String(body.description ?? "").trim(),
        sortOrder: Number(body.sortOrder),
        prerequisiteUnitId: body.prerequisiteUnitId
          ? opaqueIdSchema.parse(body.prerequisiteUnitId)
          : null,
      });
      mockCurriculumUnits.set(orgId, [
        ...(mockCurriculumUnits.get(orgId) ?? []),
        row,
      ]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.get(
    "/api/organizations/:orgId/curriculum-lessons",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const data = mockCurriculumLessons.get(orgId) ?? [];
      return HttpResponse.json({
        data,
        meta: {
          page: 1,
          pageSize: Math.max(data.length, 1),
          totalItems: data.length,
          totalPages: 1,
        },
      });
    },
  ),

  http.post(
    "/api/organizations/:orgId/curriculum-lessons",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        unitId?: string;
        title?: string;
        kind?: "lesson" | "topic";
        objectives?: string;
        resources?: string;
        homework?: string;
        examRef?: string | null;
        durationMinutes?: number;
        prerequisiteLessonId?: string | null;
        progressPercent?: number;
      };
      const unitId = String(body.unitId ?? "").trim();
      const units = mockCurriculumUnits.get(orgId) ?? [];
      const unit = units.find((row) => String(row.id) === unitId);
      if (
        !unit ||
        !body.title?.trim() ||
        !body.kind ||
        body.durationMinutes == null
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "curriculum.validation.unit"),
          { status: 400 },
        );
      }
      const row = curriculumLessonSchema.parse({
        id: opaqueIdSchema.parse(
          `cles_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        unitId: unit.id,
        unitTitle: unit.title,
        title: body.title.trim(),
        kind: body.kind,
        objectives: String(body.objectives ?? "").trim(),
        resources: String(body.resources ?? "").trim(),
        homework: String(body.homework ?? "").trim(),
        examRef: body.examRef?.trim() || null,
        durationMinutes: Number(body.durationMinutes),
        prerequisiteLessonId: body.prerequisiteLessonId
          ? opaqueIdSchema.parse(body.prerequisiteLessonId)
          : null,
        progressPercent: Number(body.progressPercent ?? 0),
      });
      mockCurriculumLessons.set(orgId, [
        ...(mockCurriculumLessons.get(orgId) ?? []),
        row,
      ]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.get("/api/organizations/:orgId/lesson-plans", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockLessonPlans.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/lesson-plans",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        title?: string;
        bodyHtml?: string;
        visibility?: "personal" | "school" | "specific" | "public";
        moduleRef?: string | null;
      };
      if (!body.title?.trim() || !body.bodyHtml?.trim() || !body.visibility) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "lessonPlans.validation.title"),
          { status: 400 },
        );
      }
      const row = lessonPlanSchema.parse({
        id: opaqueIdSchema.parse(
          `lplan_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        title: body.title.trim(),
        bodyHtml: body.bodyHtml,
        visibility: body.visibility,
        moduleRef: body.moduleRef?.trim() || null,
        version: 1,
        snapshotOfId: null,
        clonedFromId: null,
      });
      mockLessonPlans.set(orgId, [...(mockLessonPlans.get(orgId) ?? []), row]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/lesson-plans/:planId/clone",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const planId = String(params.planId);
      const rows = mockLessonPlans.get(orgId) ?? [];
      const source = rows.find((row) => String(row.id) === planId);
      if (!source) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const cloned = lessonPlanSchema.parse({
        ...source,
        id: opaqueIdSchema.parse(
          `lplan_${Math.random().toString(36).slice(2, 10)}`,
        ),
        version: source.version + 1,
        snapshotOfId: null,
        clonedFromId: source.id,
      });
      mockLessonPlans.set(orgId, [...rows, cloned]);
      persistMswState();
      return HttpResponse.json(cloned, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/lesson-plans/:planId/snapshot",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const planId = String(params.planId);
      const rows = mockLessonPlans.get(orgId) ?? [];
      const source = rows.find((row) => String(row.id) === planId);
      if (!source) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const snap = lessonPlanSchema.parse({
        ...source,
        id: opaqueIdSchema.parse(
          `lplan_${Math.random().toString(36).slice(2, 10)}`,
        ),
        title: `${source.title} (snapshot)`,
        version: source.version,
        snapshotOfId: source.id,
        clonedFromId: null,
      });
      mockLessonPlans.set(orgId, [...rows, snap]);
      persistMswState();
      return HttpResponse.json(snap, { status: 201 });
    },
  ),

  http.get("/api/organizations/:orgId/branches", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    let data = mockBranches.get(orgId) ?? [];
    if (data.length === 0) {
      const org = mockOrgs.get(orgId);
      if (org) {
        data = [
          branchSchema.parse({
            id: org.mainBranchId,
            organizationId: org.id,
            name: org.mainBranchName,
            code: "MAIN",
            isMain: true,
            status: "active",
            effectiveFrom: new Date().toISOString().slice(0, 10),
            effectiveTo: null,
            address: "",
          }),
        ];
        mockBranches.set(orgId, data);
        persistMswState();
      }
    }
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/branches",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        name?: string;
        code?: string;
        effectiveFrom?: string;
        address?: string;
      };
      if (!body.name?.trim() || !body.code?.trim() || !body.effectiveFrom) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "branches.validation.name"),
          { status: 400 },
        );
      }
      const row = branchSchema.parse({
        id: opaqueIdSchema.parse(
          `br_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        name: body.name.trim(),
        code: body.code.trim().toUpperCase(),
        isMain: false,
        status: "active",
        effectiveFrom: body.effectiveFrom,
        effectiveTo: null,
        address: String(body.address ?? "").trim(),
      });
      const next = [...(mockBranches.get(orgId) ?? []), row];
      mockBranches.set(orgId, next);
      const org = mockOrgs.get(orgId);
      if (org) {
        mockOrgs.set(orgId, {
          ...org,
          branchesCount: next.length,
        });
      }
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/branches/:branchId/set-main",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const branchId = String(params.branchId);
      const rows = mockBranches.get(orgId) ?? [];
      const target = rows.find((row) => String(row.id) === branchId);
      if (!target || target.status === "archived") {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const next = rows.map((row) =>
        branchSchema.parse({
          ...row,
          isMain: String(row.id) === branchId,
        }),
      );
      mockBranches.set(orgId, next);
      const org = mockOrgs.get(orgId);
      if (org) {
        mockOrgs.set(orgId, {
          ...org,
          mainBranchId: target.id,
          mainBranchName: target.name,
        });
      }
      persistMswState();
      return HttpResponse.json(
        next.find((row) => String(row.id) === branchId)!,
      );
    },
  ),

  http.post(
    "/api/organizations/:orgId/branches/:branchId/archive",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const branchId = String(params.branchId);
      const rows = mockBranches.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === branchId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const current = rows[idx]!;
      if (current.isMain) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "branches.archiveBlocked"),
          { status: 400 },
        );
      }
      const updated = branchSchema.parse({
        ...current,
        status: "archived",
        effectiveTo: new Date().toISOString().slice(0, 10),
        isMain: false,
      });
      mockBranches.set(
        orgId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/organizations/:orgId/rooms", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockRooms.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post("/api/organizations/:orgId/rooms", async ({ params, request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const body = (await request.json()) as {
      branchId?: string;
      name?: string;
      capacity?: number;
    };
    const branch = (mockBranches.get(orgId) ?? []).find(
      (row) => String(row.id) === String(body.branchId ?? ""),
    );
    if (!branch || !body.name?.trim() || !body.capacity) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "facilities.validation.branch"),
        { status: 400 },
      );
    }
    const row = roomSchema.parse({
      id: opaqueIdSchema.parse(
        `room_${Math.random().toString(36).slice(2, 10)}`,
      ),
      organizationId: opaqueIdSchema.parse(orgId),
      branchId: branch.id,
      branchName: branch.name,
      name: body.name.trim(),
      capacity: Number(body.capacity),
      status: "available",
    });
    mockRooms.set(orgId, [...(mockRooms.get(orgId) ?? []), row]);
    persistMswState();
    return HttpResponse.json(row, { status: 201 });
  }),

  http.get("/api/organizations/:orgId/equipment", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockEquipment.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/equipment",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        branchId?: string;
        name?: string;
        assetTag?: string;
      };
      const branch = (mockBranches.get(orgId) ?? []).find(
        (row) => String(row.id) === String(body.branchId ?? ""),
      );
      if (!branch || !body.name?.trim() || !body.assetTag?.trim()) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "facilities.validation.branch"),
          { status: 400 },
        );
      }
      const row = equipmentSchema.parse({
        id: opaqueIdSchema.parse(
          `eq_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        branchId: branch.id,
        branchName: branch.name,
        name: body.name.trim(),
        assetTag: body.assetTag.trim().toUpperCase(),
        status: "available",
      });
      mockEquipment.set(orgId, [...(mockEquipment.get(orgId) ?? []), row]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.get("/api/organizations/:orgId/departments", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockDepartments.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/departments",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        name?: string;
        code?: string;
        effectiveFrom?: string;
      };
      if (!body.name?.trim() || !body.code?.trim() || !body.effectiveFrom) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "departments.validation.deptName"),
          { status: 400 },
        );
      }
      const row = departmentSchema.parse({
        id: opaqueIdSchema.parse(
          `dept_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        name: body.name.trim(),
        code: body.code.trim().toUpperCase(),
        status: "active",
        effectiveFrom: body.effectiveFrom,
      });
      mockDepartments.set(orgId, [...(mockDepartments.get(orgId) ?? []), row]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.get("/api/organizations/:orgId/teams", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockTeams.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post("/api/organizations/:orgId/teams", async ({ params, request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const body = (await request.json()) as {
      departmentId?: string;
      name?: string;
      code?: string;
    };
    const dept = (mockDepartments.get(orgId) ?? []).find(
      (row) => String(row.id) === String(body.departmentId ?? ""),
    );
    if (!dept || !body.name?.trim() || !body.code?.trim()) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "departments.validation.department"),
        { status: 400 },
      );
    }
    const row = teamSchema.parse({
      id: opaqueIdSchema.parse(
        `team_${Math.random().toString(36).slice(2, 10)}`,
      ),
      organizationId: opaqueIdSchema.parse(orgId),
      departmentId: dept.id,
      departmentName: dept.name,
      name: body.name.trim(),
      code: body.code.trim().toUpperCase(),
      status: "active",
    });
    mockTeams.set(orgId, [...(mockTeams.get(orgId) ?? []), row]);
    persistMswState();
    return HttpResponse.json(row, { status: 201 });
  }),

  http.get("/api/organizations/:orgId/positions", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockPositions.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/positions",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        title?: string;
        departmentId?: string | null;
        reportsToPositionId?: string | null;
        holderDisplayName?: string | null;
      };
      if (!body.title?.trim()) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "positions.validation.title"),
          { status: 400 },
        );
      }
      const deptId = body.departmentId ? String(body.departmentId) : "";
      const dept = deptId
        ? (mockDepartments.get(orgId) ?? []).find(
            (row) => String(row.id) === deptId,
          )
        : undefined;
      const reportsToId = body.reportsToPositionId
        ? String(body.reportsToPositionId)
        : "";
      const reportsTo = reportsToId
        ? (mockPositions.get(orgId) ?? []).find(
            (row) => String(row.id) === reportsToId,
          )
        : undefined;
      const holder = body.holderDisplayName?.trim() || null;
      const row = positionSchema.parse({
        id: opaqueIdSchema.parse(
          `pos_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        title: body.title.trim(),
        departmentId: dept?.id ?? null,
        departmentName: dept?.name ?? null,
        reportsToPositionId: reportsTo?.id ?? null,
        holderDisplayName: holder,
        status: holder ? "filled" : "vacant",
      });
      mockPositions.set(orgId, [...(mockPositions.get(orgId) ?? []), row]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.get("/api/organizations/:orgId/directory", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    let data = mockDirectory.get(orgId);
    if (!data) {
      data = [
        directoryPersonSchema.parse({
          id: opaqueIdSchema.parse("dir_owner1"),
          organizationId: opaqueIdSchema.parse(orgId),
          displayName: "Org Owner",
          roleLabel: "Owner",
          departmentName: "Academics",
          teamNames: ["Leadership"],
          presenceStatus: "available",
          presenceVisible: true,
        }),
        directoryPersonSchema.parse({
          id: opaqueIdSchema.parse("dir_staff1"),
          organizationId: opaqueIdSchema.parse(orgId),
          displayName: "Sam Staff",
          roleLabel: "Teacher",
          departmentName: "Academics",
          teamNames: ["Curriculum Leads"],
          presenceStatus: "in_class",
          presenceVisible: true,
        }),
        directoryPersonSchema.parse({
          id: opaqueIdSchema.parse("dir_priv1"),
          organizationId: opaqueIdSchema.parse(orgId),
          displayName: "Private Person",
          roleLabel: "Support",
          departmentName: null,
          teamNames: [],
          presenceStatus: "busy",
          presenceVisible: false,
        }),
      ];
      mockDirectory.set(orgId, data);
      persistMswState();
    }
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/directory/:personId/presence",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const personId = String(params.personId);
      const body = (await request.json()) as { status?: string };
      const parsed = presenceStatusSchema.safeParse(body.status);
      if (!parsed.success) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "peopleDirectory.presence.busy"),
          { status: 400 },
        );
      }
      let rows = mockDirectory.get(orgId) ?? [];
      if (rows.length === 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "peopleDirectory.empty"),
          { status: 404 },
        );
      }
      const idx = rows.findIndex((row) => String(row.id) === personId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "peopleDirectory.empty"),
          { status: 404 },
        );
      }
      const updated = directoryPersonSchema.parse({
        ...rows[idx],
        presenceStatus: parsed.data,
      });
      rows = rows.map((row, i) => (i === idx ? updated : row));
      mockDirectory.set(orgId, rows);
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/organizations/:orgId/roles", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    let data = mockRoleDefinitions.get(orgId);
    if (!data) {
      const seeded: OrgRoleDefinition[] = ROLE_TEMPLATE_KEYS.map((key) =>
        orgRoleDefinitionSchema.parse({
          id: opaqueIdSchema.parse(`role_${key}`),
          organizationId: opaqueIdSchema.parse(orgId),
          name: key
            .split("_")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" "),
          templateKey: key,
          branchScoped: key !== "owner",
          permissions: permissionsForTemplate(key),
          isSystem: true,
        }),
      );
      data = seeded;
      mockRoleDefinitions.set(orgId, seeded);
      persistMswState();
    }
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post("/api/organizations/:orgId/roles", async ({ params, request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const body = (await request.json()) as {
      name?: string;
      templateKey?: string;
      branchScoped?: boolean;
      permissions?: string[];
    };
    if (!body.name?.trim() || !body.templateKey) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "roles.validation.name"),
        { status: 400 },
      );
    }
    const templateKey = body.templateKey as
      (typeof ROLE_TEMPLATE_KEYS)[number] | "custom";
    const permissions =
      templateKey === "custom"
        ? (body.permissions ?? []).filter(Boolean)
        : permissionsForTemplate(templateKey);
    if (permissions.length === 0) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "roles.validation.permissions"),
        { status: 400 },
      );
    }
    const rows = mockRoleDefinitions.get(orgId) ?? [];
    const row = orgRoleDefinitionSchema.parse({
      id: opaqueIdSchema.parse(
        `role_${Math.random().toString(36).slice(2, 10)}`,
      ),
      organizationId: opaqueIdSchema.parse(orgId),
      name: body.name.trim(),
      templateKey: templateKey === "custom" ? "custom" : templateKey,
      branchScoped: Boolean(body.branchScoped),
      permissions,
      isSystem: false,
    });
    mockRoleDefinitions.set(orgId, [...rows, row]);
    persistMswState();
    return HttpResponse.json(row, { status: 201 });
  }),

  http.get("/api/organizations/:orgId/policies", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockPolicies.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/policies",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        title?: string;
        category?: string;
        inheritsFromParent?: boolean;
        sensitive?: boolean;
        effectiveFrom?: string;
        summary?: string;
      };
      if (
        !body.title?.trim() ||
        !body.category?.trim() ||
        !body.effectiveFrom ||
        !body.summary?.trim()
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "policies.validation.title"),
          { status: 400 },
        );
      }
      const row = orgPolicySchema.parse({
        id: opaqueIdSchema.parse(
          `pol_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        title: body.title.trim(),
        category: body.category.trim(),
        status: "draft",
        version: 1,
        inheritsFromParent: Boolean(body.inheritsFromParent),
        sensitive: Boolean(body.sensitive),
        effectiveFrom: body.effectiveFrom,
        summary: body.summary.trim(),
      });
      mockPolicies.set(orgId, [...(mockPolicies.get(orgId) ?? []), row]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/policies/:policyId/publish",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const policyId = String(params.policyId);
      const rows = mockPolicies.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === policyId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "policies.loadError"),
          { status: 404 },
        );
      }
      const current = rows[idx]!;
      if (current.status !== "draft") {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "policies.status.published"),
          { status: 400 },
        );
      }
      const updated = orgPolicySchema.parse({
        ...current,
        status: "published",
        version: current.version + 1,
      });
      mockPolicies.set(
        orgId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/organizations/:orgId/shifts", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockShifts.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post("/api/organizations/:orgId/shifts", async ({ params, request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const body = (await request.json()) as {
      name?: string;
      weekday?: number;
      startTime?: string;
      endTime?: string;
      branchName?: string;
    };
    if (
      !body.name?.trim() ||
      body.weekday === undefined ||
      !body.startTime ||
      !body.endTime ||
      !body.branchName?.trim() ||
      body.startTime >= body.endTime
    ) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "shifts.validation.window"),
        { status: 400 },
      );
    }
    const row = shiftSchema.parse({
      id: opaqueIdSchema.parse(
        `shf_${Math.random().toString(36).slice(2, 10)}`,
      ),
      organizationId: opaqueIdSchema.parse(orgId),
      name: body.name.trim(),
      weekday: Number(body.weekday),
      startTime: body.startTime,
      endTime: body.endTime,
      branchName: body.branchName.trim(),
    });
    mockShifts.set(orgId, [...(mockShifts.get(orgId) ?? []), row]);
    persistMswState();
    return HttpResponse.json(row, { status: 201 });
  }),

  http.get("/api/organizations/:orgId/leave-requests", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockLeaveRequests.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/leave-requests",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        staffDisplayName?: string;
        leaveType?: string;
        startDate?: string;
        endDate?: string;
        reason?: string;
      };
      if (
        !body.staffDisplayName?.trim() ||
        !body.leaveType ||
        !body.startDate ||
        !body.endDate ||
        body.startDate > body.endDate ||
        !body.reason?.trim()
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "leave.validation.range"),
          { status: 400 },
        );
      }
      const row = leaveRequestSchema.parse({
        id: opaqueIdSchema.parse(
          `lv_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        staffDisplayName: body.staffDisplayName.trim(),
        leaveType: body.leaveType,
        status: "pending",
        startDate: body.startDate,
        endDate: body.endDate,
        reason: body.reason.trim(),
      });
      mockLeaveRequests.set(orgId, [
        ...(mockLeaveRequests.get(orgId) ?? []),
        row,
      ]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/leave-requests/:leaveId/approve",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const leaveId = String(params.leaveId);
      const rows = mockLeaveRequests.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === leaveId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "leave.loadError"),
          { status: 404 },
        );
      }
      const updated = leaveRequestSchema.parse({
        ...rows[idx],
        status: "approved",
      });
      mockLeaveRequests.set(
        orgId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/organizations/:orgId/staff-attendance", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockStaffClockEvents.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/staff-attendance",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        staffDisplayName?: string;
        eventType?: string;
        branchName?: string;
      };
      if (
        !body.staffDisplayName?.trim() ||
        !body.eventType ||
        !body.branchName?.trim()
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "staffAttendance.validation.staff"),
          { status: 400 },
        );
      }
      const row = staffClockEventSchema.parse({
        id: opaqueIdSchema.parse(
          `clk_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        staffDisplayName: body.staffDisplayName.trim(),
        eventType: body.eventType,
        recordedAt: new Date().toISOString(),
        branchName: body.branchName.trim(),
      });
      mockStaffClockEvents.set(orgId, [
        ...(mockStaffClockEvents.get(orgId) ?? []),
        row,
      ]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.get(
    "/api/organizations/:orgId/employee-documents",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const data = mockEmployeeDocuments.get(orgId) ?? [];
      return HttpResponse.json({
        data,
        meta: {
          page: 1,
          pageSize: Math.max(data.length, 1),
          totalItems: data.length,
          totalPages: 1,
        },
      });
    },
  ),

  http.post(
    "/api/organizations/:orgId/employee-documents",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        staffDisplayName?: string;
        title?: string;
        category?: string;
        expiresOn?: string | null;
      };
      if (
        !body.staffDisplayName?.trim() ||
        !body.title?.trim() ||
        !body.category?.trim()
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "employeeDocuments.validation.title"),
          { status: 400 },
        );
      }
      const row = employeeDocumentSchema.parse({
        id: opaqueIdSchema.parse(
          `edoc_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        staffDisplayName: body.staffDisplayName.trim(),
        title: body.title.trim(),
        category: body.category.trim(),
        status: "active",
        expiresOn: body.expiresOn?.trim() || null,
      });
      mockEmployeeDocuments.set(orgId, [
        ...(mockEmployeeDocuments.get(orgId) ?? []),
        row,
      ]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.get("/api/organizations/:orgId/onboarding", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockOnboardingCases.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/onboarding",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        staffDisplayName?: string;
        roleTemplate?: string;
      };
      if (!body.staffDisplayName?.trim() || !body.roleTemplate?.trim()) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "onboarding.validation.staff"),
          { status: 400 },
        );
      }
      const row = onboardingCaseSchema.parse({
        id: opaqueIdSchema.parse(
          `onb_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        staffDisplayName: body.staffDisplayName.trim(),
        roleTemplate: body.roleTemplate.trim(),
        status: "in_progress",
        currentStep: "invite",
      });
      mockOnboardingCases.set(orgId, [
        ...(mockOnboardingCases.get(orgId) ?? []),
        row,
      ]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/onboarding/:caseId/advance",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const caseId = String(params.caseId);
      const rows = mockOnboardingCases.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === caseId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "onboarding.loadError"),
          { status: 404 },
        );
      }
      const current = rows[idx]!;
      const next = nextOnboardingStep(current.currentStep);
      const updated = onboardingCaseSchema.parse({
        ...current,
        currentStep: next === "done" ? "activate" : next,
        status: next === "done" ? "completed" : "in_progress",
      });
      mockOnboardingCases.set(
        orgId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/organizations/:orgId/offboarding", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockOffboardingCases.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/offboarding",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        staffDisplayName?: string;
        lastWorkingDay?: string;
      };
      if (!body.staffDisplayName?.trim() || !body.lastWorkingDay) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "offboarding.validation.staff"),
          { status: 400 },
        );
      }
      const row = offboardingCaseSchema.parse({
        id: opaqueIdSchema.parse(
          `off_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        staffDisplayName: body.staffDisplayName.trim(),
        status: "in_progress",
        currentStep: "access_review",
        lastWorkingDay: body.lastWorkingDay,
      });
      mockOffboardingCases.set(orgId, [
        ...(mockOffboardingCases.get(orgId) ?? []),
        row,
      ]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/offboarding/:caseId/advance",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const caseId = String(params.caseId);
      const rows = mockOffboardingCases.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === caseId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "offboarding.loadError"),
          { status: 404 },
        );
      }
      const current = rows[idx]!;
      const next = nextOffboardingStep(current.currentStep);
      const updated = offboardingCaseSchema.parse({
        ...current,
        currentStep: next === "done" ? "deactivate" : next,
        status: next === "done" ? "completed" : "in_progress",
      });
      mockOffboardingCases.set(
        orgId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/organizations/:orgId/approvals", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockApprovals.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/approvals",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        title?: string;
        requesterDisplayName?: string;
        mode?: string;
        summary?: string;
      };
      if (
        !body.title?.trim() ||
        !body.requesterDisplayName?.trim() ||
        !body.mode ||
        !body.summary?.trim()
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "approvals.validation.title"),
          { status: 400 },
        );
      }
      const row = approvalRequestSchema.parse({
        id: opaqueIdSchema.parse(
          `apr_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        title: body.title.trim(),
        requesterDisplayName: body.requesterDisplayName.trim(),
        mode: body.mode,
        status: "pending",
        summary: body.summary.trim(),
      });
      mockApprovals.set(orgId, [...(mockApprovals.get(orgId) ?? []), row]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/approvals/:approvalId/decide",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const approvalId = String(params.approvalId);
      const body = (await request.json()) as {
        decision?: string;
        actorDisplayName?: string;
      };
      const rows = mockApprovals.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === approvalId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "approvals.loadError"),
          { status: 404 },
        );
      }
      const current = rows[idx]!;
      if (
        !body.actorDisplayName ||
        !canActorDecide(current, body.actorDisplayName)
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "approvals.selfBlocked"),
          { status: 400 },
        );
      }
      if (
        !body.decision ||
        !["approved", "rejected", "changes_requested"].includes(body.decision)
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "approvals.validation.title"),
          { status: 400 },
        );
      }
      const updated = approvalRequestSchema.parse({
        ...current,
        status: body.decision,
      });
      mockApprovals.set(
        orgId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/organizations/:orgId/tasks", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockTasks.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post("/api/organizations/:orgId/tasks", async ({ params, request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      assigneeDisplayName?: string;
      departmentName?: string;
      priority?: string;
      dueDate?: string;
    };
    if (
      !body.title?.trim() ||
      !body.description?.trim() ||
      !body.assigneeDisplayName?.trim() ||
      !body.departmentName?.trim() ||
      !body.priority ||
      !body.dueDate?.trim()
    ) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "tasks.validation.title"),
        { status: 400 },
      );
    }
    const row = orgTaskSchema.parse({
      id: opaqueIdSchema.parse(
        `tsk_${Math.random().toString(36).slice(2, 10)}`,
      ),
      organizationId: opaqueIdSchema.parse(orgId),
      title: body.title.trim(),
      description: body.description.trim(),
      assigneeDisplayName: body.assigneeDisplayName.trim(),
      departmentName: body.departmentName.trim(),
      priority: body.priority,
      status: "todo",
      dueDate: body.dueDate.trim(),
    });
    mockTasks.set(orgId, [...(mockTasks.get(orgId) ?? []), row]);
    persistMswState();
    return HttpResponse.json(row, { status: 201 });
  }),

  http.post(
    "/api/organizations/:orgId/tasks/:taskId/status",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const taskId = String(params.taskId);
      const body = (await request.json()) as { status?: string };
      const rows = mockTasks.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === taskId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "tasks.loadError"),
          { status: 404 },
        );
      }
      const current = rows[idx]!;
      if (
        !body.status ||
        !["todo", "in_progress", "blocked", "done"].includes(body.status)
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "tasks.validation.title"),
          { status: 400 },
        );
      }
      const nextStatus = body.status as
        "todo" | "in_progress" | "blocked" | "done";
      if (!canTransitionTaskStatus(current.status, nextStatus)) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "tasks.invalidTransition"),
          { status: 400 },
        );
      }
      const updated = orgTaskSchema.parse({
        ...current,
        status: nextStatus,
      });
      mockTasks.set(
        orgId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/organizations/:orgId/knowledge-base", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockKbArticles.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/knowledge-base",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        title?: string;
        spaceName?: string;
        bodyHtml?: string;
        tags?: string;
      };
      if (
        !body.title?.trim() ||
        !body.spaceName?.trim() ||
        !body.bodyHtml?.trim()
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "knowledgeBase.validation.title"),
          { status: 400 },
        );
      }
      const row = kbArticleSchema.parse({
        id: opaqueIdSchema.parse(
          `kb_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        title: body.title.trim(),
        spaceName: body.spaceName.trim(),
        bodyHtml: body.bodyHtml,
        tags: (body.tags ?? "").trim(),
        status: "draft",
        version: 1,
      });
      mockKbArticles.set(orgId, [...(mockKbArticles.get(orgId) ?? []), row]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/knowledge-base/:articleId/status",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const articleId = String(params.articleId);
      const body = (await request.json()) as { status?: string };
      const rows = mockKbArticles.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === articleId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "knowledgeBase.loadError"),
          { status: 404 },
        );
      }
      const current = rows[idx]!;
      if (
        !body.status ||
        !["draft", "in_review", "published"].includes(body.status)
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "knowledgeBase.validation.title"),
          { status: 400 },
        );
      }
      const nextStatus = body.status as "draft" | "in_review" | "published";
      if (!canTransitionKbStatus(current.status, nextStatus)) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "knowledgeBase.invalidTransition"),
          { status: 400 },
        );
      }
      const updated = kbArticleSchema.parse({
        ...current,
        status: nextStatus,
        version:
          nextStatus === "published" ? current.version + 1 : current.version,
      });
      mockKbArticles.set(
        orgId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/organizations/:orgId/forms", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockSurveyForms.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post("/api/organizations/:orgId/forms", async ({ params, request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      questionText?: string;
      slug?: string;
    };
    if (
      !body.title?.trim() ||
      !body.description?.trim() ||
      !body.questionText?.trim() ||
      !body.slug?.trim() ||
      !isValidPublicSlug(body.slug)
    ) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "forms.validation.slug"),
        { status: 400 },
      );
    }
    const row = surveyFormSchema.parse({
      id: opaqueIdSchema.parse(
        `frm_${Math.random().toString(36).slice(2, 10)}`,
      ),
      organizationId: opaqueIdSchema.parse(orgId),
      title: body.title.trim(),
      description: body.description.trim(),
      questionText: body.questionText.trim(),
      slug: body.slug.trim(),
      status: "draft",
    });
    mockSurveyForms.set(orgId, [...(mockSurveyForms.get(orgId) ?? []), row]);
    persistMswState();
    return HttpResponse.json(row, { status: 201 });
  }),

  http.post(
    "/api/organizations/:orgId/forms/:formId/publish",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const formId = String(params.formId);
      const rows = mockSurveyForms.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === formId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "forms.loadError"),
          { status: 404 },
        );
      }
      const updated = surveyFormSchema.parse({
        ...rows[idx]!,
        status: "published",
      });
      mockSurveyForms.set(
        orgId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      mockPublicForms.set(updated.slug, updated);
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/public/forms/:slug", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const slug = String(params.slug);
    const form = mockPublicForms.get(slug);
    if (!form || form.status !== "published") {
      return HttpResponse.json(
        errorBody(404, "NOT_FOUND", "forms.publicNotFound"),
        { status: 404 },
      );
    }
    return HttpResponse.json(form);
  }),

  http.post(
    "/api/public/forms/:slug/submissions",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const slug = String(params.slug);
      const form = mockPublicForms.get(slug);
      if (!form || form.status !== "published") {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "forms.publicNotFound"),
          { status: 404 },
        );
      }
      const body = (await request.json()) as {
        answerText?: string;
        consentName?: string;
        consentAccepted?: boolean;
      };
      if (
        !body.answerText?.trim() ||
        !body.consentName?.trim() ||
        !body.consentAccepted
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "forms.validation.consent"),
          { status: 400 },
        );
      }
      const row = formSubmissionSchema.parse({
        id: opaqueIdSchema.parse(
          `sub_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: form.organizationId,
        formId: form.id,
        formTitle: form.title,
        answerText: body.answerText.trim(),
        consentName: body.consentName.trim(),
        consentedAt: new Date().toISOString(),
        consentSnapshot: buildConsentSnapshot(form),
        reviewStatus: "pending",
        internalComment: "",
      });
      const orgId = String(form.organizationId);
      mockFormSubmissions.set(orgId, [
        ...(mockFormSubmissions.get(orgId) ?? []),
        row,
      ]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.get("/api/organizations/:orgId/form-submissions", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockFormSubmissions.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/form-submissions/:submissionId/comment",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const submissionId = String(params.submissionId);
      const body = (await request.json()) as { comment?: string };
      const rows = mockFormSubmissions.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === submissionId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "formSubmissions.loadError"),
          { status: 404 },
        );
      }
      if (!body.comment?.trim()) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "formSubmissions.validation.comment"),
          { status: 400 },
        );
      }
      const updated = formSubmissionSchema.parse({
        ...rows[idx]!,
        internalComment: body.comment.trim(),
      });
      mockFormSubmissions.set(
        orgId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.post(
    "/api/organizations/:orgId/form-submissions/:submissionId/decide",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const submissionId = String(params.submissionId);
      const body = (await request.json()) as { decision?: string };
      const rows = mockFormSubmissions.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === submissionId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "formSubmissions.loadError"),
          { status: 404 },
        );
      }
      const current = rows[idx]!;
      if (
        !body.decision ||
        !["approved", "rejected"].includes(body.decision) ||
        !canDecideSubmission(current.reviewStatus)
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "formSubmissions.alreadyDecided"),
          { status: 400 },
        );
      }
      const updated = formSubmissionSchema.parse({
        ...current,
        reviewStatus: body.decision,
      });
      mockFormSubmissions.set(
        orgId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/organizations/:orgId/customization", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    return HttpResponse.json(
      mockCustomization.get(orgId) ?? { fields: [], statuses: [], tags: [] },
    );
  }),

  http.post(
    "/api/organizations/:orgId/customization/fields",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        name?: string;
        fieldType?: string;
        entityTarget?: string;
        options?: string;
        required?: boolean;
      };
      if (
        !body.name?.trim() ||
        !body.fieldType ||
        !body.entityTarget ||
        !selectFieldHasOptions(
          body.fieldType as "text" | "number" | "select",
          body.options ?? "",
        )
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "customization.validation.options"),
          { status: 400 },
        );
      }
      const row = customFieldSchema.parse({
        id: opaqueIdSchema.parse(
          `cf_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        name: body.name.trim(),
        fieldType: body.fieldType,
        entityTarget: body.entityTarget,
        options: (body.options ?? "").trim(),
        required: Boolean(body.required),
      });
      const current = mockCustomization.get(orgId) ?? {
        fields: [],
        statuses: [],
        tags: [],
      };
      mockCustomization.set(orgId, {
        ...current,
        fields: [...current.fields, row],
      });
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/customization/statuses",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        name?: string;
        entityTarget?: string;
        colorKey?: string;
      };
      if (!body.name?.trim() || !body.entityTarget || !body.colorKey?.trim()) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "customization.validation.name"),
          { status: 400 },
        );
      }
      const row = customStatusSchema.parse({
        id: opaqueIdSchema.parse(
          `cs_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        name: body.name.trim(),
        entityTarget: body.entityTarget,
        colorKey: body.colorKey.trim(),
      });
      const current = mockCustomization.get(orgId) ?? {
        fields: [],
        statuses: [],
        tags: [],
      };
      mockCustomization.set(orgId, {
        ...current,
        statuses: [...current.statuses, row],
      });
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/customization/tags",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        name?: string;
        colorKey?: string;
      };
      if (!body.name?.trim() || !body.colorKey?.trim()) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "customization.validation.name"),
          { status: 400 },
        );
      }
      const row = contextTagSchema.parse({
        id: opaqueIdSchema.parse(
          `tg_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        name: body.name.trim(),
        colorKey: body.colorKey.trim(),
      });
      const current = mockCustomization.get(orgId) ?? {
        fields: [],
        statuses: [],
        tags: [],
      };
      mockCustomization.set(orgId, {
        ...current,
        tags: [...current.tags, row],
      });
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.get("/api/organizations/:orgId/automation", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockAutomation.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/automation",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        name?: string;
        triggerType?: string;
        riskLevel?: string;
        stepsSummary?: string;
      };
      if (
        !body.name?.trim() ||
        !body.triggerType ||
        !body.riskLevel ||
        !body.stepsSummary?.trim()
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "automation.validation.name"),
          { status: 400 },
        );
      }
      const row = automationRuleSchema.parse({
        id: opaqueIdSchema.parse(
          `aut_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        name: body.name.trim(),
        triggerType: body.triggerType,
        riskLevel: body.riskLevel,
        status: "draft",
        stepsSummary: body.stepsSummary.trim(),
      });
      mockAutomation.set(orgId, [...(mockAutomation.get(orgId) ?? []), row]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/automation/:ruleId/activate",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const ruleId = String(params.ruleId);
      const body = (await request.json()) as { approvalGranted?: boolean };
      const rows = mockAutomation.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === ruleId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          {
            status: 404,
          },
        );
      }
      const current = rows[idx]!;
      if (current.status === "active") {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "automation.validation.alreadyActive"),
          { status: 400 },
        );
      }
      if (requiresApprovalGate(current.riskLevel) && !body.approvalGranted) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "automation.approvalRequired"),
          { status: 400 },
        );
      }
      const updated = automationRuleSchema.parse({
        ...current,
        status: "active",
      });
      const next = [...rows];
      next[idx] = updated;
      mockAutomation.set(orgId, next);
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/organizations/:orgId/crm/pipelines", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockCrmPipelines.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.get("/api/organizations/:orgId/crm/deals", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockCrmDeals.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/crm/pipelines",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        name?: string;
        isPrivate?: boolean;
        stageLabels?: string[];
      };
      if (
        !body.name?.trim() ||
        !Array.isArray(body.stageLabels) ||
        body.stageLabels.length === 0
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "crm.validation.pipelineName"),
          { status: 400 },
        );
      }
      const row = pipelineSchema.parse({
        id: opaqueIdSchema.parse(
          `pip_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        name: body.name.trim(),
        isPrivate: Boolean(body.isPrivate),
        stageLabels: body.stageLabels
          .map((label) => label.trim())
          .filter(Boolean),
      });
      mockCrmPipelines.set(orgId, [
        ...(mockCrmPipelines.get(orgId) ?? []),
        row,
      ]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/crm/deals",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        title?: string;
        pipelineName?: string;
        stage?: string;
        valueMinor?: number;
      };
      if (
        !body.title?.trim() ||
        !body.pipelineName?.trim() ||
        !body.stage?.trim() ||
        typeof body.valueMinor !== "number" ||
        body.valueMinor < 0
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "crm.validation.dealTitle"),
          { status: 400 },
        );
      }
      const row = dealSchema.parse({
        id: opaqueIdSchema.parse(
          `deal_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        title: body.title.trim(),
        pipelineName: body.pipelineName.trim(),
        stage: body.stage.trim(),
        valueMinor: body.valueMinor,
      });
      mockCrmDeals.set(orgId, [...(mockCrmDeals.get(orgId) ?? []), row]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.get("/api/organizations/:orgId/data-ops", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockDataOps.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/data-ops",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        jobType?: string;
        resourceKey?: string;
      };
      if (!body.jobType || !body.resourceKey?.trim()) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "dataOps.validation.resourceKey"),
          { status: 400 },
        );
      }
      const row = dataJobSchema.parse({
        id: opaqueIdSchema.parse(
          `djob_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        jobType: body.jobType,
        resourceKey: body.resourceKey.trim(),
        status: "queued",
      });
      mockDataOps.set(orgId, [...(mockDataOps.get(orgId) ?? []), row]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/data-ops/:jobId/advance",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const jobId = String(params.jobId);
      const rows = mockDataOps.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === jobId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          {
            status: 404,
          },
        );
      }
      const current = rows[idx]!;
      const next = nextDataJobStatus(current.status);
      if (!next) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "dataOps.validation.terminal"),
          { status: 400 },
        );
      }
      const updated = dataJobSchema.parse({ ...current, status: next });
      const copy = [...rows];
      copy[idx] = updated;
      mockDataOps.set(orgId, copy);
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/organizations/:orgId/events", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockEvents.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post("/api/organizations/:orgId/events", async ({ params, request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const body = (await request.json()) as {
      title?: string;
      startsAt?: string;
      capacity?: number;
      waitlistEnabled?: boolean;
    };
    if (
      !body.title?.trim() ||
      !body.startsAt?.trim() ||
      typeof body.capacity !== "number" ||
      body.capacity < 1
    ) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "events.validation.title"),
        { status: 400 },
      );
    }
    const row = orgEventSchema.parse({
      id: opaqueIdSchema.parse(
        `evt_${Math.random().toString(36).slice(2, 10)}`,
      ),
      organizationId: opaqueIdSchema.parse(orgId),
      title: body.title.trim(),
      startsAt: body.startsAt,
      capacity: body.capacity,
      rsvpCount: 0,
      checkedInCount: 0,
      waitlistEnabled: Boolean(body.waitlistEnabled),
    });
    mockEvents.set(orgId, [...(mockEvents.get(orgId) ?? []), row]);
    persistMswState();
    return HttpResponse.json(row, { status: 201 });
  }),

  http.post(
    "/api/organizations/:orgId/events/:eventId/rsvp",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const eventId = String(params.eventId);
      const rows = mockEvents.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === eventId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          {
            status: 404,
          },
        );
      }
      const current = rows[idx]!;
      if (!canRsvp(current)) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "events.rsvpBlocked"),
          { status: 400 },
        );
      }
      const updated = orgEventSchema.parse({
        ...current,
        rsvpCount: current.rsvpCount + 1,
      });
      const next = [...rows];
      next[idx] = updated;
      mockEvents.set(orgId, next);
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.post(
    "/api/organizations/:orgId/events/:eventId/check-in",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const eventId = String(params.eventId);
      const rows = mockEvents.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === eventId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          {
            status: 404,
          },
        );
      }
      const current = rows[idx]!;
      if (current.checkedInCount >= current.rsvpCount) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "events.checkInBlocked"),
          { status: 400 },
        );
      }
      const updated = orgEventSchema.parse({
        ...current,
        checkedInCount: current.checkedInCount + 1,
      });
      const next = [...rows];
      next[idx] = updated;
      mockEvents.set(orgId, next);
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/organizations/:orgId/analytics/views", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockAnalyticsViews.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.get("/api/organizations/:orgId/analytics/goals", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockAnalyticsGoals.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/analytics/views",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        name?: string;
        metricKey?: string;
        alertThreshold?: number;
      };
      if (
        !body.name?.trim() ||
        !body.metricKey?.trim() ||
        typeof body.alertThreshold !== "number"
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "analytics.validation.viewName"),
          { status: 400 },
        );
      }
      const row = savedViewSchema.parse({
        id: opaqueIdSchema.parse(
          `view_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        name: body.name.trim(),
        metricKey: body.metricKey.trim(),
        alertThreshold: body.alertThreshold,
      });
      mockAnalyticsViews.set(orgId, [
        ...(mockAnalyticsViews.get(orgId) ?? []),
        row,
      ]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/analytics/goals",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        name?: string;
        targetValue?: number;
      };
      if (!body.name?.trim() || typeof body.targetValue !== "number") {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "analytics.validation.goalName"),
          { status: 400 },
        );
      }
      const row = goalSchema.parse({
        id: opaqueIdSchema.parse(
          `goal_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        name: body.name.trim(),
        targetValue: body.targetValue,
        currentValue: 0,
      });
      mockAnalyticsGoals.set(orgId, [
        ...(mockAnalyticsGoals.get(orgId) ?? []),
        row,
      ]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/analytics/goals/:goalId/progress",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const goalId = String(params.goalId);
      const body = (await request.json()) as { currentValue?: number };
      const rows = mockAnalyticsGoals.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === goalId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          {
            status: 404,
          },
        );
      }
      if (typeof body.currentValue !== "number" || body.currentValue < 0) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "analytics.validation.currentValue"),
          { status: 400 },
        );
      }
      const updated = goalSchema.parse({
        ...rows[idx]!,
        currentValue: body.currentValue,
      });
      const next = [...rows];
      next[idx] = updated;
      mockAnalyticsGoals.set(orgId, next);
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/organizations/:orgId/bulk-actions", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const data = mockBulkActions.get(orgId) ?? [];
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/bulk-actions",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as {
        moduleKey?: string;
        actionKey?: string;
        itemCount?: number;
      };
      if (
        !body.moduleKey?.trim() ||
        !body.actionKey?.trim() ||
        typeof body.itemCount !== "number" ||
        body.itemCount < 1
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "bulkActions.validation.moduleKey"),
          { status: 400 },
        );
      }
      const requiresApproval = requiresBulkApproval(
        body.itemCount,
        body.actionKey,
      );
      const row = bulkJobSchema.parse({
        id: opaqueIdSchema.parse(
          `bulk_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(orgId),
        moduleKey: body.moduleKey.trim(),
        actionKey: body.actionKey.trim(),
        itemCount: body.itemCount,
        status: requiresApproval ? "blocked" : "pending",
        requiresApproval,
      });
      mockBulkActions.set(orgId, [...(mockBulkActions.get(orgId) ?? []), row]);
      persistMswState();
      return HttpResponse.json(row, { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/bulk-actions/:jobId/run",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const jobId = String(params.jobId);
      const body = (await request.json()) as { approvalGranted?: boolean };
      const rows = mockBulkActions.get(orgId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === jobId);
      if (idx < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          {
            status: 404,
          },
        );
      }
      const current = rows[idx]!;
      if (current.status === "completed") {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "bulkActions.validation.done"),
          { status: 400 },
        );
      }
      if (current.requiresApproval && !body.approvalGranted) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "bulkActions.approvalRequired"),
          { status: 400 },
        );
      }
      const updated = bulkJobSchema.parse({
        ...current,
        status: "completed",
      });
      const next = [...rows];
      next[idx] = updated;
      mockBulkActions.set(orgId, next);
      persistMswState();
      return HttpResponse.json(updated);
    },
  ),

  http.get("/api/pricing/catalog", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const catalog = await createMockPricingClient().getCatalog();
    return HttpResponse.json(pricingCatalogSchema.parse(catalog));
  }),

  http.get("/api/pricing/plans", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const url = new URL(request.url);
    const market = (url.searchParams.get("market") ?? "IR") as MarketCode;
    const catalog = await createMockPricingClient().getCatalog();
    const data = plansForMarket(catalog, market);
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.get("/api/teacher/plans/subscription", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const userId = currentSession?.userId ?? "usr_demo";
    const sub =
      mockTeacherSubscriptions.get(userId) ??
      teacherSubscriptionSchema.parse({
        userId,
        planCode: "teacher_free",
        status: "active",
        trialDaysLeft: null,
        trialEndsAt: null,
        marketCode: "IR",
      });
    return HttpResponse.json(sub);
  }),

  http.get("/api/teacher/plans/offers", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const url = new URL(request.url);
    const market = (url.searchParams.get("market") ?? "IR") as MarketCode;
    return HttpResponse.json(offersForMarket(market));
  }),

  http.post(
    "/api/organizations/:orgId/coupons/validate",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const body = (await request.json()) as { code?: string };
      const result = await mswCouponsClient.validate(
        String(params.orgId),
        body.code ?? "",
      );
      return HttpResponse.json(couponValidationSchema.parse(result));
    },
  ),

  http.post(
    "/api/organizations/:orgId/coupons/apply",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const body = (await request.json()) as { code?: string };
      const result = await mswCouponsClient.apply(
        String(params.orgId),
        body.code ?? "",
      );
      persistMswState();
      return HttpResponse.json(couponValidationSchema.parse(result));
    },
  ),

  http.get("/api/organizations/:orgId/add-ons", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const bundle = await mswAddOnsClient.get(orgId);
    return HttpResponse.json(addOnsBundleSchema.parse(bundle));
  }),

  http.patch(
    "/api/organizations/:orgId/add-ons/overage",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as { enabled?: boolean };
      const bundle = await mswAddOnsClient.setOverageOptIn(
        orgId,
        Boolean(body.enabled),
      );
      persistMswState();
      return HttpResponse.json(addOnsBundleSchema.parse(bundle));
    },
  ),

  http.patch(
    "/api/organizations/:orgId/add-ons/:addOnId",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as { active?: boolean };
      const addon = await mswAddOnsClient.toggleAddOn(
        orgId,
        String(params.addOnId),
        Boolean(body.active),
      );
      persistMswState();
      return HttpResponse.json(addOnSchema.parse(addon));
    },
  ),

  http.get("/api/organizations/:orgId/usage", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const snap = await mswUsageClient.get(orgId);
    return HttpResponse.json(usageSnapshotSchema.parse(snap));
  }),

  http.get("/api/organizations/:orgId/billing/invoices", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const result = await mswBillingClient.listInvoices(orgId);
    mockBillingInvoices.set(orgId, result.data);
    return HttpResponse.json({
      data: result.data.map((row) => invoiceSchema.parse(row)),
      meta: result.meta,
    });
  }),

  http.get("/api/organizations/:orgId/billing/summary", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const summary = await mswBillingClient.getSummary(orgId);
    return HttpResponse.json(billingSummarySchema.parse(summary));
  }),

  http.post(
    "/api/organizations/:orgId/plan-change/preview",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as { targetPlanCode?: string };
      const targetPlanCode = orgPlanCodeSchema.parse(body.targetPlanCode);
      const preview = await mswPlanChangeClient.preview(orgId, targetPlanCode);
      return HttpResponse.json(planChangePreviewSchema.parse(preview));
    },
  ),

  http.post(
    "/api/organizations/:orgId/plan-change",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const body = (await request.json()) as { targetPlanCode?: string };
      const targetPlanCode = orgPlanCodeSchema.parse(body.targetPlanCode);
      const result = await mswPlanChangeClient.apply(orgId, targetPlanCode);
      const existing = mockOrgSubscriptions.get(orgId);
      if (existing) {
        mockOrgSubscriptions.set(orgId, {
          ...existing,
          planCode: targetPlanCode,
          state: "active",
          trialDaysLeft: null,
        });
      }
      persistMswState();
      return HttpResponse.json(planChangePreviewSchema.parse(result));
    },
  ),

  http.get("/api/organizations/:orgId/subscription", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const orgId = String(params.orgId);
    const sub =
      mockOrgSubscriptions.get(orgId) ??
      organizationSubscriptionSchema.parse({
        organizationId: orgId,
        planCode: "org_starter",
        state: "trial",
        trialDaysLeft: 14,
        graceDaysLeft: null,
        limitedReason: null,
        renewsAt: null,
      });
    return HttpResponse.json(sub);
  }),

  http.post("/api/teacher/plans/trial", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const userId = currentSession?.userId ?? "usr_demo";
    const body = (await request.json()) as { planCode?: string };
    const planCode = teacherPlanCodeSchema.parse(body.planCode);
    const current =
      mockTeacherSubscriptions.get(userId) ??
      teacherSubscriptionSchema.parse({
        userId,
        planCode: "teacher_free",
        status: "active",
        trialDaysLeft: null,
        trialEndsAt: null,
        marketCode: "IR",
      });
    if (!canStartTrial(current, planCode)) {
      return HttpResponse.json(
        errorBody(409, "TRIAL_NOT_ALLOWED", "errors.conflict"),
        { status: 409 },
      );
    }
    const trialDaysLeft = 14;
    const trialEndsAt = new Date(
      Date.now() + trialDaysLeft * 86_400_000,
    ).toISOString();
    const next = teacherSubscriptionSchema.parse({
      userId,
      planCode,
      status: "trial",
      trialDaysLeft,
      trialEndsAt,
      marketCode: current.marketCode,
    });
    mockTeacherSubscriptions.set(userId, next);
    persistMswState();
    return HttpResponse.json(next);
  }),

  http.get(
    "/api/organizations/:orgId/checkout/providers",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const providers = await mswCheckoutClient.listProviders(
        String(params.orgId),
      );
      return HttpResponse.json(
        providers.map((p) => checkoutProviderSchema.parse(p)),
      );
    },
  ),

  http.get(
    "/api/organizations/:orgId/checkout/sessions",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const sessions = await mswCheckoutClient.listSessions(
        String(params.orgId),
      );
      return HttpResponse.json(
        sessions.map((s) => checkoutSessionSchema.parse(s)),
      );
    },
  ),

  http.post(
    "/api/organizations/:orgId/checkout/sessions",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const body = (await request.json()) as {
        provider?: string;
        amount?: number;
      };
      const session = await mswCheckoutClient.createSession(
        String(params.orgId),
        {
          provider: (body.provider ?? "mock") as "mock" | "stripe" | "zarinpal",
          amount: body.amount,
        },
      );
      persistMswState();
      return HttpResponse.json(checkoutSessionSchema.parse(session));
    },
  ),

  http.post(
    "/api/organizations/:orgId/checkout/sessions/:sessionId/complete",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const session = await mswCheckoutClient.completeSession(
        String(params.orgId),
        String(params.sessionId),
      );
      persistMswState();
      return HttpResponse.json(checkoutSessionSchema.parse(session));
    },
  ),

  http.post(
    "/api/organizations/:orgId/checkout/sessions/:sessionId/cancel",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const session = await mswCheckoutClient.cancelSession(
        String(params.orgId),
        String(params.sessionId),
      );
      persistMswState();
      return HttpResponse.json(checkoutSessionSchema.parse(session));
    },
  ),

  http.get("/api/organizations/:orgId/tax-invoices", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const rows = await mswTaxInvoicesClient.list(String(params.orgId));
    return HttpResponse.json(rows.map((row) => taxDocumentSchema.parse(row)));
  }),

  http.post(
    "/api/organizations/:orgId/tax-invoices",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const body = (await request.json()) as {
        type: "invoice" | "credit_note";
        locale: "en" | "fa";
        vatRatePercent: number;
        subtotalAmount: number;
        currency: "IRR" | "USD";
      };
      const row = await mswTaxInvoicesClient.issue(String(params.orgId), body);
      persistMswState();
      return HttpResponse.json(taxDocumentSchema.parse(row), { status: 201 });
    },
  ),

  http.get("/api/organizations/:orgId/cancellation", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const snap = await mswCancellationClient.get(String(params.orgId));
    return HttpResponse.json(cancellationSnapshotSchema.parse(snap));
  }),

  http.post(
    "/api/organizations/:orgId/cancellation/request",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const body = (await request.json()) as { reason: string };
      const snap = await mswCancellationClient.requestCancel(
        String(params.orgId),
        body,
      );
      persistMswState();
      return HttpResponse.json(cancellationSnapshotSchema.parse(snap));
    },
  ),

  http.post(
    "/api/organizations/:orgId/cancellation/refund",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const snap = await mswCancellationClient.requestRefund(
        String(params.orgId),
      );
      persistMswState();
      return HttpResponse.json(cancellationSnapshotSchema.parse(snap));
    },
  ),

  http.post(
    "/api/organizations/:orgId/cancellation/offers/:offerId/accept",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const snap = await mswCancellationClient.acceptOffer(
        String(params.orgId),
        String(params.offerId),
      );
      persistMswState();
      return HttpResponse.json(cancellationSnapshotSchema.parse(snap));
    },
  ),

  http.get("/api/organizations/:orgId/plan-versions", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const snap = await mswPlanVersionsClient.get(String(params.orgId));
    return HttpResponse.json(planVersionsSnapshotSchema.parse(snap));
  }),

  http.post(
    "/api/organizations/:orgId/plan-versions/migrations",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const body = (await request.json()) as {
        fromVersionId: string;
        toVersionId: string;
      };
      const snap = await mswPlanVersionsClient.startMigration(
        String(params.orgId),
        body,
      );
      persistMswState();
      return HttpResponse.json(planVersionsSnapshotSchema.parse(snap), {
        status: 201,
      });
    },
  ),

  http.post(
    "/api/organizations/:orgId/plan-versions/migrations/:campaignId/enroll",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const snap = await mswPlanVersionsClient.enroll(
        String(params.orgId),
        String(params.campaignId),
      );
      persistMswState();
      return HttpResponse.json(planVersionsSnapshotSchema.parse(snap));
    },
  ),

  http.get("/api/organizations/:orgId/manual-billing", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const rows = await mswManualBillingClient.list(String(params.orgId));
    return HttpResponse.json(rows.map((row) => manualInvoiceSchema.parse(row)));
  }),

  http.post(
    "/api/organizations/:orgId/manual-billing",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const body = (await request.json()) as {
        amount: number;
        currency: "IRR" | "USD";
        dueDays?: number;
      };
      const row = await mswManualBillingClient.create(
        String(params.orgId),
        body,
      );
      persistMswState();
      return HttpResponse.json(manualInvoiceSchema.parse(row), { status: 201 });
    },
  ),

  http.post(
    "/api/organizations/:orgId/manual-billing/:invoiceId/send",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const row = await mswManualBillingClient.send(
        String(params.orgId),
        String(params.invoiceId),
      );
      persistMswState();
      return HttpResponse.json(manualInvoiceSchema.parse(row));
    },
  ),

  http.post(
    "/api/organizations/:orgId/manual-billing/:invoiceId/escalate",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const row = await mswManualBillingClient.escalate(
        String(params.orgId),
        String(params.invoiceId),
      );
      persistMswState();
      return HttpResponse.json(manualInvoiceSchema.parse(row));
    },
  ),

  http.post(
    "/api/organizations/:orgId/manual-billing/:invoiceId/pay",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const row = await mswManualBillingClient.markPaid(
        String(params.orgId),
        String(params.invoiceId),
      );
      persistMswState();
      return HttpResponse.json(manualInvoiceSchema.parse(row));
    },
  ),
];
