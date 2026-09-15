"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

import { Button, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { AuthShell } from "@/features/auth";
import { resolveLocale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { routes } from "@/lib/routes";
import { getAuthClient } from "@/services/auth";
import { getStudentClient } from "@/services/student";

export function StudentActivateForm() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const router = useRouter();

  const pendingQuery = useQuery({
    queryKey: ["student", "relationships", "pending"],
    queryFn: () => getStudentClient().listPendingRelationships(),
  });

  return (
    <AuthShell
      namespace="student"
      titleKey="activateTitle"
      subtitleKey="activateSubtitle"
    >
      {pendingQuery.isLoading ? <Skeleton className="h-24 w-full" /> : null}
      {pendingQuery.isError ? (
        <ErrorState
          title={t(locale, "student", "loadError")}
          action={
            <Button type="button" onClick={() => void pendingQuery.refetch()}>
              {t(locale, "student", "retry")}
            </Button>
          }
        />
      ) : null}
      {pendingQuery.data && pendingQuery.data.length === 0 ? (
        <EmptyState
          title={t(locale, "student", "noPending")}
          description={t(locale, "student", "noPendingHint")}
        />
      ) : null}
      <ul className="space-y-3">
        {(pendingQuery.data ?? []).map((rel) => (
          <li
            key={rel.id}
            className="border-border space-y-2 rounded-md border p-3"
          >
            <p className="font-medium">{rel.subjectLabel}</p>
            <p className="text-muted text-xs">
              {rel.organizationName} · {rel.teacherDisplayName}
            </p>
            <Button
              type="button"
              onClick={async () => {
                await getStudentClient().acceptRelationship(rel.id);
                await getAuthClient().switchPersona("student");
                pushFeedback({
                  tone: "success",
                  title: t(locale, "student", "activated"),
                });
                router.push(routes.student.home());
              }}
            >
              {t(locale, "student", "acceptRelationship")}
            </Button>
          </li>
        ))}
      </ul>
    </AuthShell>
  );
}
