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
import { getGuardianClient } from "@/services/guardian";

export function GuardianActivateForm() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const router = useRouter();

  const pendingQuery = useQuery({
    queryKey: ["guardian", "relationships", "pending"],
    queryFn: () => getGuardianClient().listPendingRelationships(),
  });

  return (
    <AuthShell
      namespace="guardian"
      titleKey="activateTitle"
      subtitleKey="activateSubtitle"
    >
      {pendingQuery.isLoading ? <Skeleton className="h-24 w-full" /> : null}
      {pendingQuery.isError ? (
        <ErrorState
          title={t(locale, "guardian", "loadError")}
          action={
            <Button type="button" onClick={() => void pendingQuery.refetch()}>
              {t(locale, "guardian", "retry")}
            </Button>
          }
        />
      ) : null}
      {pendingQuery.data && pendingQuery.data.length === 0 ? (
        <EmptyState
          title={t(locale, "guardian", "noPending")}
          description={t(locale, "guardian", "noPendingHint")}
        />
      ) : null}
      <ul className="space-y-3">
        {(pendingQuery.data ?? []).map((rel) => (
          <li
            key={rel.id}
            className="border-border space-y-2 rounded-md border p-3"
          >
            <p className="font-medium">{rel.studentDisplayName}</p>
            <p className="text-muted text-xs">
              {rel.relationshipLabel} · {rel.organizationName}
            </p>
            <Button
              type="button"
              onClick={async () => {
                await getGuardianClient().acceptRelationship(rel.id);
                await getAuthClient().switchPersona("guardian");
                pushFeedback({
                  tone: "success",
                  title: t(locale, "guardian", "activated"),
                });
                router.push(routes.guardian.home());
              }}
            >
              {t(locale, "guardian", "acceptRelationship")}
            </Button>
          </li>
        ))}
      </ul>
    </AuthShell>
  );
}
