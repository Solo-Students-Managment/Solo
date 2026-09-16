import type { Locale } from "@/lib/i18n/locales";
import { defaultLocale } from "@/lib/i18n/locales";

import enAccountPhone from "./messages/en/accountPhone.json";
import enProfile from "./messages/en/profile.json";
import enHome from "./messages/en/home.json";
import enTeacher from "./messages/en/teacher.json";
import enStudent from "./messages/en/student.json";
import enGuardian from "./messages/en/guardian.json";
import enOrganization from "./messages/en/organization.json";
import enSubjects from "./messages/en/subjects.json";
import enStudents from "./messages/en/students.json";
import enCourses from "./messages/en/courses.json";
import enEnrollments from "./messages/en/enrollments.json";
import enSessions from "./messages/en/sessions.json";
import enAttendance from "./messages/en/attendance.json";
import enAssignments from "./messages/en/assignments.json";
import enGradebook from "./messages/en/gradebook.json";
import enEvaluations from "./messages/en/evaluations.json";
import enQuestionBank from "./messages/en/questionBank.json";
import enExams from "./messages/en/exams.json";
import enCurriculum from "./messages/en/curriculum.json";
import enLessonPlans from "./messages/en/lessonPlans.json";
import enBranches from "./messages/en/branches.json";
import enFacilities from "./messages/en/facilities.json";
import enDepartments from "./messages/en/departments.json";
import enPositions from "./messages/en/positions.json";
import enPeopleDirectory from "./messages/en/peopleDirectory.json";
import enRoles from "./messages/en/roles.json";
import enPolicies from "./messages/en/policies.json";
import enShifts from "./messages/en/shifts.json";
import enLeave from "./messages/en/leave.json";
import enStaffAttendance from "./messages/en/staffAttendance.json";
import enEmployeeDocuments from "./messages/en/employeeDocuments.json";
import enOnboarding from "./messages/en/onboarding.json";
import enOffboarding from "./messages/en/offboarding.json";
import enApprovals from "./messages/en/approvals.json";
import enTasks from "./messages/en/tasks.json";
import enKnowledgeBase from "./messages/en/knowledgeBase.json";
import enForms from "./messages/en/forms.json";
import enFormSubmissions from "./messages/en/formSubmissions.json";
import enCustomization from "./messages/en/customization.json";
import enAutomation from "./messages/en/automation.json";
import enCrm from "./messages/en/crm.json";
import enDataOps from "./messages/en/dataOps.json";
import enEvents from "./messages/en/events.json";
import enAnalytics from "./messages/en/analytics.json";
import enBulkActions from "./messages/en/bulkActions.json";
import enPricing from "./messages/en/pricing.json";
import enTeacherPlans from "./messages/en/teacherPlans.json";
import enSubscription from "./messages/en/subscription.json";
import enPlanChange from "./messages/en/planChange.json";
import enBilling from "./messages/en/billing.json";
import enUsage from "./messages/en/usage.json";
import enAddOns from "./messages/en/addOns.json";
import enCoupons from "./messages/en/coupons.json";
import enCheckout from "./messages/en/checkout.json";
import enTaxInvoices from "./messages/en/taxInvoices.json";
import enCancel from "./messages/en/cancel.json";
import enPlanVersions from "./messages/en/planVersions.json";
import enManualBilling from "./messages/en/manualBilling.json";
import enMessaging from "./messages/en/messaging.json";
import enChat from "./messages/en/chat.json";
import enNotifications from "./messages/en/notifications.json";
import enCalendar from "./messages/en/calendar.json";
import enTuition from "./messages/en/tuition.json";
import enResources from "./messages/en/resources.json";
import enReports from "./messages/en/reports.json";
import enSearch from "./messages/en/search.json";
import enAuth from "./messages/en/auth.json";
import enCommon from "./messages/en/common.json";
import enFoundation from "./messages/en/foundation.json";
import enSecurity from "./messages/en/security.json";
import faAccountPhone from "./messages/fa/accountPhone.json";
import faProfile from "./messages/fa/profile.json";
import faHome from "./messages/fa/home.json";
import faTeacher from "./messages/fa/teacher.json";
import faStudent from "./messages/fa/student.json";
import faGuardian from "./messages/fa/guardian.json";
import faOrganization from "./messages/fa/organization.json";
import faSubjects from "./messages/fa/subjects.json";
import faStudents from "./messages/fa/students.json";
import faCourses from "./messages/fa/courses.json";
import faEnrollments from "./messages/fa/enrollments.json";
import faSessions from "./messages/fa/sessions.json";
import faAttendance from "./messages/fa/attendance.json";
import faAssignments from "./messages/fa/assignments.json";
import faGradebook from "./messages/fa/gradebook.json";
import faEvaluations from "./messages/fa/evaluations.json";
import faQuestionBank from "./messages/fa/questionBank.json";
import faExams from "./messages/fa/exams.json";
import faCurriculum from "./messages/fa/curriculum.json";
import faLessonPlans from "./messages/fa/lessonPlans.json";
import faBranches from "./messages/fa/branches.json";
import faFacilities from "./messages/fa/facilities.json";
import faDepartments from "./messages/fa/departments.json";
import faPositions from "./messages/fa/positions.json";
import faPeopleDirectory from "./messages/fa/peopleDirectory.json";
import faRoles from "./messages/fa/roles.json";
import faPolicies from "./messages/fa/policies.json";
import faShifts from "./messages/fa/shifts.json";
import faLeave from "./messages/fa/leave.json";
import faStaffAttendance from "./messages/fa/staffAttendance.json";
import faEmployeeDocuments from "./messages/fa/employeeDocuments.json";
import faOnboarding from "./messages/fa/onboarding.json";
import faOffboarding from "./messages/fa/offboarding.json";
import faApprovals from "./messages/fa/approvals.json";
import faTasks from "./messages/fa/tasks.json";
import faKnowledgeBase from "./messages/fa/knowledgeBase.json";
import faForms from "./messages/fa/forms.json";
import faFormSubmissions from "./messages/fa/formSubmissions.json";
import faCustomization from "./messages/fa/customization.json";
import faAutomation from "./messages/fa/automation.json";
import faCrm from "./messages/fa/crm.json";
import faDataOps from "./messages/fa/dataOps.json";
import faEvents from "./messages/fa/events.json";
import faAnalytics from "./messages/fa/analytics.json";
import faBulkActions from "./messages/fa/bulkActions.json";
import faPricing from "./messages/fa/pricing.json";
import faTeacherPlans from "./messages/fa/teacherPlans.json";
import faSubscription from "./messages/fa/subscription.json";
import faPlanChange from "./messages/fa/planChange.json";
import faBilling from "./messages/fa/billing.json";
import faUsage from "./messages/fa/usage.json";
import faAddOns from "./messages/fa/addOns.json";
import faCoupons from "./messages/fa/coupons.json";
import faCheckout from "./messages/fa/checkout.json";
import faTaxInvoices from "./messages/fa/taxInvoices.json";
import faCancel from "./messages/fa/cancel.json";
import faPlanVersions from "./messages/fa/planVersions.json";
import faManualBilling from "./messages/fa/manualBilling.json";
import faMessaging from "./messages/fa/messaging.json";
import faChat from "./messages/fa/chat.json";
import faNotifications from "./messages/fa/notifications.json";
import faCalendar from "./messages/fa/calendar.json";
import faTuition from "./messages/fa/tuition.json";
import faResources from "./messages/fa/resources.json";
import faReports from "./messages/fa/reports.json";
import faSearch from "./messages/fa/search.json";
import faAuth from "./messages/fa/auth.json";
import faCommon from "./messages/fa/common.json";
import faFoundation from "./messages/fa/foundation.json";
import faSecurity from "./messages/fa/security.json";

export type MessageNamespace =
  | "common"
  | "foundation"
  | "auth"
  | "security"
  | "accountPhone"
  | "profile"
  | "home"
  | "teacher"
  | "student"
  | "guardian"
  | "organization"
  | "subjects"
  | "students"
  | "courses"
  | "enrollments"
  | "sessions"
  | "attendance"
  | "assignments"
  | "gradebook"
  | "evaluations"
  | "questionBank"
  | "exams"
  | "curriculum"
  | "lessonPlans"
  | "branches"
  | "facilities"
  | "departments"
  | "positions"
  | "peopleDirectory"
  | "roles"
  | "policies"
  | "shifts"
  | "leave"
  | "staffAttendance"
  | "employeeDocuments"
  | "onboarding"
  | "offboarding"
  | "approvals"
  | "tasks"
  | "knowledgeBase"
  | "forms"
  | "formSubmissions"
  | "customization"
  | "automation"
  | "crm"
  | "dataOps"
  | "events"
  | "analytics"
  | "bulkActions"
  | "pricing"
  | "teacherPlans"
  | "subscription"
  | "planChange"
  | "billing"
  | "usage"
  | "addOns"
  | "coupons"
  | "checkout"
  | "taxInvoices"
  | "cancel"
  | "planVersions"
  | "manualBilling"
  | "messaging"
  | "chat"
  | "notifications"
  | "calendar"
  | "tuition"
  | "resources"
  | "reports"
  | "search";

type Dictionaries = Record<
  Locale,
  Record<MessageNamespace, Record<string, string>>
>;

const dictionaries: Dictionaries = {
  en: {
    common: enCommon,
    foundation: enFoundation,
    auth: enAuth,
    security: enSecurity,
    accountPhone: enAccountPhone,
    profile: enProfile,
    home: enHome,
    teacher: enTeacher,
    student: enStudent,
    guardian: enGuardian,
    organization: enOrganization,
    subjects: enSubjects,
    students: enStudents,
    courses: enCourses,
    enrollments: enEnrollments,
    sessions: enSessions,
    attendance: enAttendance,
    assignments: enAssignments,
    gradebook: enGradebook,
    evaluations: enEvaluations,
    questionBank: enQuestionBank,
    exams: enExams,
    curriculum: enCurriculum,
    lessonPlans: enLessonPlans,
    branches: enBranches,
    facilities: enFacilities,
    departments: enDepartments,
    positions: enPositions,
    peopleDirectory: enPeopleDirectory,
    roles: enRoles,
    policies: enPolicies,
    shifts: enShifts,
    leave: enLeave,
    staffAttendance: enStaffAttendance,
    employeeDocuments: enEmployeeDocuments,
    onboarding: enOnboarding,
    offboarding: enOffboarding,
    approvals: enApprovals,
    tasks: enTasks,
    knowledgeBase: enKnowledgeBase,
    forms: enForms,
    formSubmissions: enFormSubmissions,
    customization: enCustomization,
    automation: enAutomation,
    crm: enCrm,
    dataOps: enDataOps,
    events: enEvents,
    analytics: enAnalytics,
    bulkActions: enBulkActions,
    pricing: enPricing,
    teacherPlans: enTeacherPlans,
    subscription: enSubscription,
    planChange: enPlanChange,
    billing: enBilling,
    usage: enUsage,
    addOns: enAddOns,
    coupons: enCoupons,
    checkout: enCheckout,
    taxInvoices: enTaxInvoices,
    cancel: enCancel,
    planVersions: enPlanVersions,
    manualBilling: enManualBilling,
    messaging: enMessaging,
    chat: enChat,
    notifications: enNotifications,
    calendar: enCalendar,
    tuition: enTuition,
    resources: enResources,
    reports: enReports,
    search: enSearch,
  },
  fa: {
    common: faCommon,
    foundation: faFoundation,
    auth: faAuth,
    security: faSecurity,
    accountPhone: faAccountPhone,
    profile: faProfile,
    home: faHome,
    teacher: faTeacher,
    student: faStudent,
    guardian: faGuardian,
    organization: faOrganization,
    subjects: faSubjects,
    students: faStudents,
    courses: faCourses,
    enrollments: faEnrollments,
    sessions: faSessions,
    attendance: faAttendance,
    assignments: faAssignments,
    gradebook: faGradebook,
    evaluations: faEvaluations,
    questionBank: faQuestionBank,
    exams: faExams,
    curriculum: faCurriculum,
    lessonPlans: faLessonPlans,
    branches: faBranches,
    facilities: faFacilities,
    departments: faDepartments,
    positions: faPositions,
    peopleDirectory: faPeopleDirectory,
    roles: faRoles,
    policies: faPolicies,
    shifts: faShifts,
    leave: faLeave,
    staffAttendance: faStaffAttendance,
    employeeDocuments: faEmployeeDocuments,
    onboarding: faOnboarding,
    offboarding: faOffboarding,
    approvals: faApprovals,
    tasks: faTasks,
    knowledgeBase: faKnowledgeBase,
    forms: faForms,
    formSubmissions: faFormSubmissions,
    customization: faCustomization,
    automation: faAutomation,
    crm: faCrm,
    dataOps: faDataOps,
    events: faEvents,
    analytics: faAnalytics,
    bulkActions: faBulkActions,
    pricing: faPricing,
    teacherPlans: faTeacherPlans,
    subscription: faSubscription,
    planChange: faPlanChange,
    billing: faBilling,
    usage: faUsage,
    addOns: faAddOns,
    coupons: faCoupons,
    checkout: faCheckout,
    taxInvoices: faTaxInvoices,
    cancel: faCancel,
    planVersions: faPlanVersions,
    manualBilling: faManualBilling,
    messaging: faMessaging,
    chat: faChat,
    notifications: faNotifications,
    calendar: faCalendar,
    tuition: faTuition,
    resources: faResources,
    reports: faReports,
    search: faSearch,
  },
};

const missingKeys = new Set<string>();

export type TranslateParams = Record<string, string | number>;

function formatPlural(template: string, count: number): string {
  const match = template.match(
    /\{(\w+),\s*plural,\s*=0\s*\{([^}]*)\}\s*one\s*\{([^}]*)\}\s*other\s*\{([^}]*)\}\}/,
  );
  if (!match) {
    return template.replaceAll("{count}", String(count));
  }
  const [, , zero, one, other] = match;
  const branch = count === 0 ? zero : count === 1 ? one : other;
  return (branch ?? other ?? "")
    .replaceAll("#", String(count))
    .replaceAll("{count}", String(count));
}

export function t(
  locale: Locale,
  namespace: MessageNamespace,
  key: string,
  params?: TranslateParams,
): string {
  const primary = dictionaries[locale][namespace][key];
  const fallback = dictionaries[defaultLocale][namespace][key];
  let value = primary ?? fallback;

  if (!value) {
    const miss = `${locale}.${namespace}.${key}`;
    if (process.env.NODE_ENV !== "production" && !missingKeys.has(miss)) {
      missingKeys.add(miss);
      console.warn(`[i18n] Missing translation: ${miss}`);
    }
    return key;
  }

  if (params && "count" in params && typeof params.count === "number") {
    value = formatPlural(value, params.count);
  }

  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      value = value.replaceAll(`{${paramKey}}`, String(paramValue));
    }
  }

  return value;
}

export function getNamespaceKeys(
  locale: Locale,
  namespace: MessageNamespace,
): string[] {
  return Object.keys(dictionaries[locale][namespace]).sort();
}

export function assertNamespaceParity(namespace: MessageNamespace): string[] {
  const enKeys = new Set(getNamespaceKeys("en", namespace));
  const faKeys = new Set(getNamespaceKeys("fa", namespace));
  const missingInFa = [...enKeys].filter((key) => !faKeys.has(key));
  const missingInEn = [...faKeys].filter((key) => !enKeys.has(key));
  return [
    ...missingInFa.map((k) => `fa.${namespace}.${k}`),
    ...missingInEn.map((k) => `en.${namespace}.${k}`),
  ];
}

export function getMissingTranslationKeys(): string[] {
  return [...missingKeys];
}
