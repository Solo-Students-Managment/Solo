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
