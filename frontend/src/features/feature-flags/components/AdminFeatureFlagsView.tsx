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
  getFeatureFlagsClient,
  type FeatureFlag,
} from "@/services/feature-flags";

const keys = createQueryKeyFactory("feature-flags");

export function AdminFeatureFlagsView() {
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
    queryFn: () => getFeatureFlagsClient().list(),
    enabled: canManage.allowed,
  });
  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      getFeatureFlagsClient().toggle(id, enabled),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "featureFlags", "toggleSuccess"),
      });
    },
  });
  const columns = useMemo<ColumnDef<FeatureFlag, unknown>[]>(
    () => [
      { accessorKey: "key", header: t(locale, "featureFlags", "colKey") },
      { accessorKey: "label", header: t(locale, "featureFlags", "colLabel") },
      {
        id: "enabled",
        header: t(locale, "featureFlags", "colEnabled"),
        cell: ({ row }) =>
          t(locale, "featureFlags", row.original.enabled ? "yes" : "no"),
      },
      {
        id: "early",
        header: t(locale, "featureFlags", "colEarly"),
        cell: ({ row }) =>
          t(locale, "featureFlags", row.original.earlyAccess ? "yes" : "no"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            onClick={() =>
              toggleMutation.mutate({
                id: row.original.id,
                enabled: !row.original.enabled,
              })
            }
          >
            {row.original.enabled
              ? t(locale, "featureFlags", "disable")
              : t(locale, "featureFlags", "enable")}
          </Button>
        ),
      },
    ],
    [locale, toggleMutation],
  );
  if (sessionQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (!canManage.allowed)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "featureFlags", "forbidden")} />
      </div>
    );
  return (
    <AdminShell locale={locale} dir={dir} active="featureFlags">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "featureFlags", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "featureFlags", "subtitle")}
        </p>
      </header>
      {(listQuery.data?.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "featureFlags", "empty")} />
      ) : (
        <SoloDataTable
          data={listQuery.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "featureFlags", "empty")}
        />
      )}
    </AdminShell>
  );
}
