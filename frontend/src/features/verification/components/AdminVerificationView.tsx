"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { AdminShell } from "@/features/admin";
import { Button, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import {
  getVerificationClient,
  type VerificationRequest,
} from "@/services/verification";

const keys = createQueryKeyFactory("verification");

export function AdminVerificationView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );
  const ctx = {
    personaId: sessionQuery.data?.userId,
    organizationId: null,
    subjectId: null,
  };
  const listQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getVerificationClient().list(),
    enabled: canManage.allowed,
  });
  const approveMutation = useMutation({
    mutationFn: (id: string) => getVerificationClient().approve(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "verification", "approveSuccess"),
      });
    },
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) => getVerificationClient().reject(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "warning",
        title: t(locale, "verification", "rejectSuccess"),
      });
    },
  });
  const columns = useMemo<ColumnDef<VerificationRequest, unknown>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: t(locale, "verification", "colName"),
      },
      { accessorKey: "kind", header: t(locale, "verification", "colKind") },
      { accessorKey: "status", header: t(locale, "verification", "colStatus") },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          row.original.status === "pending" ? (
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => approveMutation.mutate(row.original.id)}
              >
                {t(locale, "verification", "approve")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => rejectMutation.mutate(row.original.id)}
              >
                {t(locale, "verification", "reject")}
              </Button>
            </div>
          ) : null,
      },
    ],
    [approveMutation, locale, rejectMutation],
  );
  if (sessionQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (!canManage.allowed)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "verification", "forbidden")} />
      </div>
    );
  return (
    <AdminShell locale={locale} dir={dir} active="verification">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "verification", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "verification", "subtitle")}
        </p>
      </header>
      {(listQuery.data?.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "verification", "empty")} />
      ) : (
        <SoloDataTable
          data={listQuery.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "verification", "empty")}
        />
      )}
    </AdminShell>
  );
}
