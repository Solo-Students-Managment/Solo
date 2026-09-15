"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { securityQueryKeys } from "@/lib/query/keys";
import { getAuthClient, type DeviceSession } from "@/services/auth";

import { isOnline } from "../schemas";
import { ReauthForm } from "./ReauthForm";

type SessionsPanelProps = {
  locale: Locale;
  personaId: string;
};

export function SessionsPanel({ locale, personaId }: SessionsPanelProps) {
  const queryClient = useQueryClient();
  const ctx = { personaId, organizationId: null, subjectId: null };
  const [pendingAction, setPendingAction] = useState<
    null | { type: "revoke"; sessionId: string } | { type: "revokeOthers" }
  >(null);

  const sessionsQuery = useQuery({
    queryKey: securityQueryKeys.list(ctx, { resource: "sessions" }),
    queryFn: () => getAuthClient().listSessions(),
  });

  const columns = useMemo<ColumnDef<DeviceSession, unknown>[]>(
    () => [
      {
        accessorKey: "deviceLabel",
        header: t(locale, "security", "sessionsTitle"),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.deviceLabel}</p>
            <p className="text-muted text-xs">
              {row.original.userAgentSummary} · {row.original.locationHint}
            </p>
          </div>
        ),
      },
      {
        id: "status",
        header: "",
        cell: ({ row }) =>
          row.original.isCurrent ? (
            <span className="text-brand text-xs font-medium">
              {t(locale, "security", "deviceCurrent")}
            </span>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={() =>
                setPendingAction({
                  type: "revoke",
                  sessionId: row.original.id,
                })
              }
            >
              {t(locale, "security", "deviceRevoke")}
            </Button>
          ),
      },
    ],
    [locale],
  );

  async function invalidate() {
    await queryClient.invalidateQueries({
      queryKey: securityQueryKeys.all(ctx),
    });
  }

  return (
    <section className="space-y-4" aria-labelledby="sessions-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="sessions-title" className="font-display text-xl font-medium">
            {t(locale, "security", "sessionsTitle")}
          </h2>
          <p className="text-muted mt-1 text-sm">
            {t(locale, "security", "sessionsSubtitle")}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setPendingAction({ type: "revokeOthers" })}
        >
          {t(locale, "security", "revokeOthers")}
        </Button>
      </div>

      {sessionsQuery.isLoading ? <Skeleton className="h-24 w-full" /> : null}
      {sessionsQuery.isError ? (
        <ErrorState
          title={t(locale, "security", "sessionsError")}
          action={
            <Button type="button" onClick={() => void sessionsQuery.refetch()}>
              {t(locale, "security", "retry")}
            </Button>
          }
        />
      ) : null}
      {sessionsQuery.isSuccess && sessionsQuery.data.length === 0 ? (
        <EmptyState title={t(locale, "security", "sessionsEmpty")} />
      ) : null}
      {sessionsQuery.isSuccess && sessionsQuery.data.length > 0 ? (
        <SoloDataTable
          data={sessionsQuery.data}
          columns={columns}
          emptyLabel={t(locale, "security", "sessionsEmpty")}
        />
      ) : null}

      {pendingAction ? (
        <ReauthForm
          locale={locale}
          onCancel={() => setPendingAction(null)}
          onSubmit={async ({ password }) => {
            if (!isOnline()) {
              pushFeedback({
                tone: "error",
                title: t(locale, "security", "offline"),
              });
              return;
            }
            try {
              if (pendingAction.type === "revoke") {
                await getAuthClient().revokeSession({
                  sessionId: pendingAction.sessionId,
                  password,
                });
                pushFeedback({
                  tone: "success",
                  title: t(locale, "security", "revokeSuccess"),
                });
              } else {
                await getAuthClient().revokeOtherSessions({ password });
                pushFeedback({
                  tone: "success",
                  title: t(locale, "security", "revokeOthersSuccess"),
                });
              }
              setPendingAction(null);
              await invalidate();
            } catch {
              pushFeedback({
                tone: "error",
                title: t(locale, "security", "invalidCredentials"),
              });
            }
          }}
        />
      ) : null}
    </section>
  );
}
