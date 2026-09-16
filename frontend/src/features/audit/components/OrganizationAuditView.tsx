"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { OrgShell } from "@/features/organization";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuditClient, type AuditEntry } from "@/services/audit";
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";

const keys = createQueryKeyFactory("audit-org");

export function OrganizationAuditView() {
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
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );
  const ctx = {
    personaId: sessionQuery.data?.userId,
    organizationId: orgId,
    subjectId: null,
  };
  const listQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getAuditClient().list({ organizationId: orgId }),
    enabled: canManage.allowed,
  });
  const columns = useMemo<ColumnDef<AuditEntry, unknown>[]>(
    () => [
      { accessorKey: "action", header: t(locale, "audit", "colAction") },
      { accessorKey: "targetId", header: t(locale, "audit", "colTarget") },
      { accessorKey: "createdAt", header: t(locale, "audit", "colWhen") },
    ],
    [locale],
  );
  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data || !canManage.allowed)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "audit", "forbidden")} />
      </div>
    );
  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="audit"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "audit", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "audit", "subtitle")}</p>
      </header>
      {(listQuery.data?.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "audit", "empty")} />
      ) : (
        <SoloDataTable
          data={listQuery.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "audit", "empty")}
        />
      )}
    </OrgShell>
  );
}
