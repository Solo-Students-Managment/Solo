"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { AdminShell } from "@/features/admin";
import { ErrorState, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAdminDashboardClient } from "@/services/admin-dashboard";
import { getAuthClient } from "@/services/auth";
import { formatInvoiceMoney } from "@/services/billing";

const keys = createQueryKeyFactory("admin-dashboard");

export function AdminDashboardView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
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
  const kpiQuery = useQuery({
    queryKey: keys.detail(ctx, "kpis"),
    queryFn: () => getAdminDashboardClient().getKpis(),
    enabled: canManage.allowed,
  });

  if (sessionQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "adminDashboard", "forbidden")} />
      </div>
    );
  }

  const kpis = kpiQuery.data;

  return (
    <AdminShell locale={locale} dir={dir} active="dashboard">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "adminDashboard", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "adminDashboard", "subtitle")}
        </p>
      </header>
      {kpiQuery.isLoading || !kpis ? (
        <Skeleton className="h-32" />
      ) : (
        <dl
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          data-testid="platform-kpis"
        >
          <div>
            <dt className="text-muted text-sm">
              {t(locale, "adminDashboard", "orgs")}
            </dt>
            <dd className="font-display text-2xl">{kpis.organizations}</dd>
          </div>
          <div>
            <dt className="text-muted text-sm">
              {t(locale, "adminDashboard", "users")}
            </dt>
            <dd className="font-display text-2xl">{kpis.activeUsers}</dd>
          </div>
          <div>
            <dt className="text-muted text-sm">
              {t(locale, "adminDashboard", "mrr")}
            </dt>
            <dd className="font-display text-2xl">
              {formatInvoiceMoney(kpis.mrrMinor, kpis.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-muted text-sm">
              {t(locale, "adminDashboard", "tickets")}
            </dt>
            <dd className="font-display text-2xl">{kpis.openTickets}</dd>
          </div>
        </dl>
      )}
    </AdminShell>
  );
}
