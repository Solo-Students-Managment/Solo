"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";

import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { OrgShell } from "@/features/organization";
import { ErrorState, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";
import { getUsageClient, isOverQuota, type QuotaMeter } from "@/services/usage";

const keys = createQueryKeyFactory("usage");

export function OrganizationUsageView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);

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
    "students.manage",
  );
  const usageQuery = useQuery({
    queryKey: keys.detail(ctx, "snapshot"),
    queryFn: () => getUsageClient().get(orgId),
    enabled: canManage.allowed,
  });

  const columns = useMemo<ColumnDef<QuotaMeter, unknown>[]>(
    () => [
      {
        id: "resource",
        header: t(locale, "usage", "colResource"),
        cell: ({ row }) =>
          t(locale, "usage", `resource.${row.original.resource}`),
      },
      {
        accessorKey: "used",
        header: t(locale, "usage", "colUsed"),
        cell: ({ row }) => `${row.original.used} ${row.original.unit}`,
      },
      {
        id: "quota",
        header: t(locale, "usage", "colQuota"),
        cell: ({ row }) => `${row.original.quota} ${row.original.unit}`,
      },
      {
        id: "status",
        header: t(locale, "usage", "colStatus"),
        cell: ({ row }) =>
          isOverQuota(row.original)
            ? t(locale, "usage", "overQuota")
            : t(locale, "usage", "withinQuota"),
      },
    ],
    [locale],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data || !canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "usage", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="usage"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "usage", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "usage", "subtitle")}</p>
      </header>
      {usageQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {usageQuery.data ? (
        <SoloDataTable
          data={usageQuery.data.meters}
          columns={columns}
          emptyLabel={t(locale, "usage", "loadError")}
        />
      ) : null}
    </OrgShell>
  );
}
