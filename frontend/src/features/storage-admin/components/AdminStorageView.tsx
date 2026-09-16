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
  getStorageAdminClient,
  type StorageFile,
} from "@/services/storage-admin";

const keys = createQueryKeyFactory("storage-admin");

export function AdminStorageView() {
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
  const quotaQuery = useQuery({
    queryKey: keys.detail(ctx, "quota"),
    queryFn: () => getStorageAdminClient().getQuota(),
    enabled: canManage.allowed,
  });
  const listQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getStorageAdminClient().listFiles(),
    enabled: canManage.allowed,
  });
  const quarantineMutation = useMutation({
    mutationFn: (id: string) => getStorageAdminClient().quarantine(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "warning",
        title: t(locale, "storageAdmin", "quarantineSuccess"),
      });
    },
  });
  const releaseMutation = useMutation({
    mutationFn: (id: string) => getStorageAdminClient().release(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "storageAdmin", "releaseSuccess"),
      });
    },
  });
  const columns = useMemo<ColumnDef<StorageFile, unknown>[]>(
    () => [
      { accessorKey: "name", header: t(locale, "storageAdmin", "colName") },
      {
        accessorKey: "sizeBytes",
        header: t(locale, "storageAdmin", "colSize"),
      },
      {
        id: "status",
        header: t(locale, "storageAdmin", "colStatus"),
        cell: ({ row }) =>
          t(
            locale,
            "storageAdmin",
            row.original.quarantined ? "status.quarantined" : "status.ok",
          ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          row.original.quarantined ? (
            <Button
              type="button"
              size="sm"
              onClick={() => releaseMutation.mutate(row.original.id)}
            >
              {t(locale, "storageAdmin", "release")}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => quarantineMutation.mutate(row.original.id)}
            >
              {t(locale, "storageAdmin", "quarantine")}
            </Button>
          ),
      },
    ],
    [locale, quarantineMutation, releaseMutation],
  );
  if (sessionQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (!canManage.allowed)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "storageAdmin", "forbidden")} />
      </div>
    );
  const quota = quotaQuery.data;
  return (
    <AdminShell locale={locale} dir={dir} active="storage">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "storageAdmin", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "storageAdmin", "subtitle")}
        </p>
      </header>
      {quota ? (
        <p data-testid="storage-quota" className="text-sm">
          {t(locale, "storageAdmin", "quotaLabel")}: {quota.usedBytes} /{" "}
          {quota.quotaBytes} · {t(locale, "storageAdmin", "quarantinedLabel")}:{" "}
          {quota.quarantinedFiles}
        </p>
      ) : (
        <Skeleton className="h-8 w-64" />
      )}
      {(listQuery.data?.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "storageAdmin", "empty")} />
      ) : (
        <SoloDataTable
          data={listQuery.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "storageAdmin", "empty")}
        />
      )}
    </AdminShell>
  );
}
