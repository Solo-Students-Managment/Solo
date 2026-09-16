"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";

import { SoloFeedbackViewport } from "@/components/shared/SoloFeedback";
import { Skeleton } from "@/components/ui";
import { canEnableMocks } from "@/config";
import { AppQueryProvider } from "@/lib/query/provider";
import { createHttpAuthClient, setAuthClient } from "@/services/auth";
import { createHttpHomeClient, setHomeClient } from "@/services/home";
import {
  createHttpOrganizationClient,
  createHttpOrganizationMembersClient,
  setOrganizationClient,
  setOrganizationMembersClient,
} from "@/services/organization";
import { createHttpProfileClient, setProfileClient } from "@/services/profile";
import { createHttpStudentClient, setStudentClient } from "@/services/student";
import {
  createHttpGuardianClient,
  setGuardianClient,
} from "@/services/guardian";
import { createHttpSubjectClient, setSubjectClient } from "@/services/subjects";
import {
  createHttpStudentsManageClient,
  setStudentsManageClient,
} from "@/services/students";
import { createHttpCoursesClient, setCoursesClient } from "@/services/courses";
import {
  createHttpEnrollmentsClient,
  setEnrollmentsClient,
} from "@/services/enrollments";
import {
  createHttpSessionsClient,
  setSessionsClient,
} from "@/services/sessions";
import {
  createHttpAssignmentsClient,
  setAssignmentsClient,
} from "@/services/assignments";
import {
  createHttpGradebookClient,
  setGradebookClient,
} from "@/services/gradebook";
import {
  createHttpEvaluationsClient,
  setEvaluationsClient,
} from "@/services/evaluations";
import {
  createHttpQuestionBankClient,
  setQuestionBankClient,
} from "@/services/question-bank";
import { createHttpExamsClient, setExamsClient } from "@/services/exams";
import {
  createHttpCurriculumClient,
  setCurriculumClient,
} from "@/services/curriculum";
import {
  createHttpLessonPlansClient,
  setLessonPlansClient,
} from "@/services/lesson-plans";
import {
  createHttpBranchesClient,
  setBranchesClient,
} from "@/services/branches";
import {
  createHttpFacilitiesClient,
  setFacilitiesClient,
} from "@/services/facilities";
import {
  createHttpDepartmentsClient,
  setDepartmentsClient,
} from "@/services/departments";
import {
  createHttpPositionsClient,
  setPositionsClient,
} from "@/services/positions";
import {
  createHttpPeopleDirectoryClient,
  setPeopleDirectoryClient,
} from "@/services/people-directory";
import { createHttpRolesClient, setRolesClient } from "@/services/roles";
import {
  createHttpPoliciesClient,
  setPoliciesClient,
} from "@/services/policies";
import { createHttpShiftsClient, setShiftsClient } from "@/services/shifts";
import { createHttpLeaveClient, setLeaveClient } from "@/services/leave";
import {
  createHttpStaffAttendanceClient,
  setStaffAttendanceClient,
} from "@/services/staff-attendance";
import {
  createHttpEmployeeDocumentsClient,
  setEmployeeDocumentsClient,
} from "@/services/employee-documents";
import {
  createHttpOnboardingClient,
  setOnboardingClient,
} from "@/services/onboarding";
import {
  createHttpOffboardingClient,
  setOffboardingClient,
} from "@/services/offboarding";
import {
  createHttpApprovalsClient,
  setApprovalsClient,
} from "@/services/approvals";
import { createHttpTasksClient, setTasksClient } from "@/services/tasks";
import {
  createHttpKnowledgeBaseClient,
  setKnowledgeBaseClient,
} from "@/services/knowledge-base";
import { createHttpFormsClient, setFormsClient } from "@/services/forms";
import {
  createHttpCustomizationClient,
  setCustomizationClient,
} from "@/services/customization";
import {
  createHttpAutomationClient,
  setAutomationClient,
} from "@/services/automation";
import { createHttpCrmClient, setCrmClient } from "@/services/crm";
import { createHttpDataOpsClient, setDataOpsClient } from "@/services/data-ops";
import { createHttpEventsClient, setEventsClient } from "@/services/events";
import {
  createHttpAnalyticsClient,
  setAnalyticsClient,
} from "@/services/analytics";
import {
  createHttpBulkActionsClient,
  setBulkActionsClient,
} from "@/services/bulk-actions";
import { createHttpPricingClient, setPricingClient } from "@/services/pricing";
import {
  createHttpTeacherPlansClient,
  setTeacherPlansClient,
} from "@/services/teacher-plans";
import {
  createHttpSubscriptionClient,
  setSubscriptionClient,
} from "@/services/subscription";
import {
  createHttpPlanChangeClient,
  setPlanChangeClient,
} from "@/services/plan-change";
import { createHttpBillingClient, setBillingClient } from "@/services/billing";
import { createHttpUsageClient, setUsageClient } from "@/services/usage";
import { createHttpAddOnsClient, setAddOnsClient } from "@/services/add-ons";
import { createHttpCouponsClient, setCouponsClient } from "@/services/coupons";
import {
  createHttpCheckoutClient,
  setCheckoutClient,
} from "@/services/checkout";
import {
  createHttpTaxInvoicesClient,
  setTaxInvoicesClient,
} from "@/services/tax-invoices";
import {
  createHttpCancellationClient,
  setCancellationClient,
} from "@/services/cancellation";
import {
  createHttpPlanVersionsClient,
  setPlanVersionsClient,
} from "@/services/plan-versions";
import {
  createHttpManualBillingClient,
  setManualBillingClient,
} from "@/services/manual-billing";
import {
  createHttpAdminDashboardClient,
  setAdminDashboardClient,
} from "@/services/admin-dashboard";
import {
  createHttpAdminUsersClient,
  setAdminUsersClient,
} from "@/services/admin-users";
import { createHttpSupportClient, setSupportClient } from "@/services/support";
import {
  createHttpVerificationClient,
  setVerificationClient,
} from "@/services/verification";
import { createHttpAuditClient, setAuditClient } from "@/services/audit";
import {
  createHttpAnnouncementsClient,
  setAnnouncementsClient,
} from "@/services/announcements";
import {
  createHttpIncidentsClient,
  setIncidentsClient,
} from "@/services/incidents";
import { createHttpPrivacyClient, setPrivacyClient } from "@/services/privacy";
import { createHttpApiKeysClient, setApiKeysClient } from "@/services/api-keys";
import {
  createHttpFeatureFlagsClient,
  setFeatureFlagsClient,
} from "@/services/feature-flags";
import {
  createHttpStorageAdminClient,
  setStorageAdminClient,
} from "@/services/storage-admin";
import {
  createHttpOrgLifecycleClient,
  setOrgLifecycleClient,
} from "@/services/org-lifecycle";
import {
  createHttpMessagingClient,
  setMessagingClient,
} from "@/services/messaging";
import { createHttpChatClient, setChatClient } from "@/services/chat";
import {
  createHttpNotificationsClient,
  setNotificationsClient,
} from "@/services/notifications";
import {
  createHttpCalendarClient,
  setCalendarClient,
} from "@/services/calendar";
import { createHttpTuitionClient, setTuitionClient } from "@/services/tuition";
import {
  createHttpResourcesClient,
  setResourcesClient,
} from "@/services/resources";
import { createHttpReportsClient, setReportsClient } from "@/services/reports";
import { createHttpSearchClient, setSearchClient } from "@/services/search";

type AppProvidersProps = {
  children: ReactNode;
};

function MswBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(() => !canEnableMocks());

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!canEnableMocks()) {
        setReady(true);
        return;
      }
      try {
        const { worker } = await import("@/mocks/browser");
        await worker.start({
          onUnhandledRequest: "bypass",
          quiet: true,
        });
        if (!cancelled) {
          setAuthClient(createHttpAuthClient());
          setProfileClient(createHttpProfileClient());
          setHomeClient(createHttpHomeClient());
          setOrganizationClient(createHttpOrganizationClient());
          setOrganizationMembersClient(createHttpOrganizationMembersClient());
          setStudentClient(createHttpStudentClient());
          setGuardianClient(createHttpGuardianClient());
          setSubjectClient(createHttpSubjectClient());
          setStudentsManageClient(createHttpStudentsManageClient());
          setCoursesClient(createHttpCoursesClient());
          setEnrollmentsClient(createHttpEnrollmentsClient());
          setSessionsClient(createHttpSessionsClient());
          setAssignmentsClient(createHttpAssignmentsClient());
          setGradebookClient(createHttpGradebookClient());
          setEvaluationsClient(createHttpEvaluationsClient());
          setQuestionBankClient(createHttpQuestionBankClient());
          setExamsClient(createHttpExamsClient());
          setCurriculumClient(createHttpCurriculumClient());
          setLessonPlansClient(createHttpLessonPlansClient());
          setBranchesClient(createHttpBranchesClient());
          setFacilitiesClient(createHttpFacilitiesClient());
          setDepartmentsClient(createHttpDepartmentsClient());
          setPositionsClient(createHttpPositionsClient());
          setPeopleDirectoryClient(createHttpPeopleDirectoryClient());
          setRolesClient(createHttpRolesClient());
          setPoliciesClient(createHttpPoliciesClient());
          setShiftsClient(createHttpShiftsClient());
          setLeaveClient(createHttpLeaveClient());
          setStaffAttendanceClient(createHttpStaffAttendanceClient());
          setEmployeeDocumentsClient(createHttpEmployeeDocumentsClient());
          setOnboardingClient(createHttpOnboardingClient());
          setOffboardingClient(createHttpOffboardingClient());
          setApprovalsClient(createHttpApprovalsClient());
          setTasksClient(createHttpTasksClient());
          setKnowledgeBaseClient(createHttpKnowledgeBaseClient());
          setFormsClient(createHttpFormsClient());
          setCustomizationClient(createHttpCustomizationClient());
          setAutomationClient(createHttpAutomationClient());
          setCrmClient(createHttpCrmClient());
          setDataOpsClient(createHttpDataOpsClient());
          setEventsClient(createHttpEventsClient());
          setAnalyticsClient(createHttpAnalyticsClient());
          setBulkActionsClient(createHttpBulkActionsClient());
          setPricingClient(createHttpPricingClient());
          setTeacherPlansClient(createHttpTeacherPlansClient());
          setSubscriptionClient(createHttpSubscriptionClient());
          setPlanChangeClient(createHttpPlanChangeClient());
          setBillingClient(createHttpBillingClient());
          setUsageClient(createHttpUsageClient());
          setAddOnsClient(createHttpAddOnsClient());
          setCouponsClient(createHttpCouponsClient());
          setCheckoutClient(createHttpCheckoutClient());
          setTaxInvoicesClient(createHttpTaxInvoicesClient());
          setCancellationClient(createHttpCancellationClient());
          setPlanVersionsClient(createHttpPlanVersionsClient());
          setManualBillingClient(createHttpManualBillingClient());
          setAdminDashboardClient(createHttpAdminDashboardClient());
          setAdminUsersClient(createHttpAdminUsersClient());
          setSupportClient(createHttpSupportClient());
          setVerificationClient(createHttpVerificationClient());
          setAuditClient(createHttpAuditClient());
          setAnnouncementsClient(createHttpAnnouncementsClient());
          setIncidentsClient(createHttpIncidentsClient());
          setPrivacyClient(createHttpPrivacyClient());
          setApiKeysClient(createHttpApiKeysClient());
          setFeatureFlagsClient(createHttpFeatureFlagsClient());
          setStorageAdminClient(createHttpStorageAdminClient());
          setOrgLifecycleClient(createHttpOrgLifecycleClient());
          setMessagingClient(createHttpMessagingClient());
          setChatClient(createHttpChatClient());
          setNotificationsClient(createHttpNotificationsClient());
          setCalendarClient(createHttpCalendarClient());
          setTuitionClient(createHttpTuitionClient());
          setResourcesClient(createHttpResourcesClient());
          setReportsClient(createHttpReportsClient());
          setSearchClient(createHttpSearchClient());
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          // Fall back to in-memory mock clients already registered at module load.
          setReady(true);
        }
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <Skeleton className="h-10 w-48" aria-label="Loading application" />
      </div>
    );
  }

  return <>{children}</>;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AppQueryProvider>
      <MswBootstrap>
        <Suspense fallback={null}>{children}</Suspense>
        <SoloFeedbackViewport />
      </MswBootstrap>
    </AppQueryProvider>
  );
}
