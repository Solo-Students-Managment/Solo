"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";

import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { OrgShell } from "@/features/organization";
import { Button, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";
import {
  getPlanVersionsClient,
  type MigrationCampaign,
  type PlanVersion,
} from "@/services/plan-versions";

const keys = createQueryKeyFactory("plan-versions");

export function OrganizationPlanVersionsView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const orgQuery = useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => getOrganizationClient().get(orgId),
  });
  const ctx = {
    personaId: sessionQuery.data?.userId,
    organizationId: orgId,
    subjectId: null,
  };
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "billing.manage",
  );
  const snapQuery = useQuery({
    queryKey: keys.detail(ctx, "snapshot"),
    queryFn: () => getPlanVersionsClient().get(orgId),
    enabled: canManage.allowed,
  });

  const startMutation = useMutation({
    mutationFn: () => {
      const snap = snapQuery.data!;
      const from = snap.versions.find((v) => v.id === snap.currentVersionId)!;
      const to = snap.versions.find((v) => v.id !== snap.currentVersionId)!;
      return getPlanVersionsClient().startMigration(orgId, {
        fromVersionId: from.id,
        toVersionId: to.id,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "info",
        title: t(locale, "planVersions", "startSuccess"),
      });
    },
  });

  const enrollMutation = useMutation({
    mutationFn: (campaignId: string) =>
      getPlanVersionsClient().enroll(orgId, campaignId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "planVersions", "enrollSuccess"),
      });
    },
  });

  const versionColumns = useMemo<ColumnDef<PlanVersion, unknown>[]>(
    () => [
      { accessorKey: "code", header: t(locale, "planVersions", "colCode") },
      { accessorKey: "label", header: t(locale, "planVersions", "colLabel") },
      {
        id: "gf",
        header: t(locale, "planVersions", "colGrandfathered"),
        cell: ({ row }) =>
          row.original.grandfathered
            ? t(locale, "planVersions", "yes")
            : t(locale, "planVersions", "no"),
      },
    ],
    [locale],
  );

  const campaignColumns = useMemo<ColumnDef<MigrationCampaign, unknown>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      {
        accessorKey: "status",
        header: t(locale, "planVersions", "colStatus"),
      },
      {
        id: "action",
        header: "",
        cell: ({ row }) =>
          row.original.status === "running" ? (
            <Button
              type="button"
              size="sm"
              disabled={enrollMutation.isPending}
              onClick={() => enrollMutation.mutate(row.original.id)}
            >
              {t(locale, "planVersions", "enroll")}
            </Button>
          ) : null,
      },
    ],
    [enrollMutation, locale],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data || !canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "planVersions", "forbidden")} />
      </div>
    );
  }

  const snap = snapQuery.data;
  const current = snap?.versions.find((v) => v.id === snap.currentVersionId);

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="planVersions"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "planVersions", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "planVersions", "subtitle")}
        </p>
      </header>

      {snapQuery.isLoading || !snap ? (
        <Skeleton className="h-32" />
      ) : (
        <section className="space-y-6">
          <p className="text-sm" data-testid="current-plan-version">
            <span className="text-muted">
              {t(locale, "planVersions", "currentLabel")}:{" "}
            </span>
            <strong>{current?.label ?? snap.currentVersionId}</strong>
          </p>
          <Button
            type="button"
            disabled={
              startMutation.isPending ||
              snap.versions.length < 2 ||
              snap.campaigns.some((c) => c.status === "running")
            }
            onClick={() => startMutation.mutate()}
          >
            {t(locale, "planVersions", "startMigration")}
          </Button>
          <div className="space-y-2">
            <h2 className="font-display text-lg">
              {t(locale, "planVersions", "versionsTitle")}
            </h2>
            <SoloDataTable
              data={snap.versions}
              columns={versionColumns}
              emptyLabel={t(locale, "planVersions", "versionsTitle")}
            />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-lg">
              {t(locale, "planVersions", "campaignsTitle")}
            </h2>
            {snap.campaigns.length === 0 ? (
              <EmptyState title={t(locale, "planVersions", "emptyCampaigns")} />
            ) : (
              <SoloDataTable
                data={snap.campaigns}
                columns={campaignColumns}
                emptyLabel={t(locale, "planVersions", "emptyCampaigns")}
              />
            )}
          </div>
        </section>
      )}
    </OrgShell>
  );
}
