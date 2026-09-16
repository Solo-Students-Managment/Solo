"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { OrgShell } from "@/features/organization";
import { EmptyState, ErrorState, Label, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";
import {
  comparePlanCodes,
  formatCatalogMoney,
  getPricingClient,
  plansForMarket,
  type CatalogPlan,
  type MarketCode,
} from "@/services/pricing";

const keys = createQueryKeyFactory("pricing");
const selectClassName =
  "border-border bg-elevated h-10 w-full max-w-xs rounded-md border px-2 text-sm";

export function OrganizationPricingView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const [market, setMarket] = useState<MarketCode>("IR");
  const [audience, setAudience] = useState<"all" | "teacher" | "organization">(
    "organization",
  );

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
  const catalogQuery = useQuery({
    queryKey: keys.detail(ctx, "catalog"),
    queryFn: () => getPricingClient().getCatalog(),
    enabled: canManage.allowed,
  });

  const plans = useMemo(() => {
    if (!catalogQuery.data) return [] as CatalogPlan[];
    return plansForMarket(catalogQuery.data, market)
      .filter((plan) => audience === "all" || plan.audience === audience)
      .slice()
      .sort(comparePlanCodes);
  }, [catalogQuery.data, market, audience]);

  const columns = useMemo<ColumnDef<CatalogPlan, unknown>[]>(
    () => [
      { accessorKey: "name", header: t(locale, "pricing", "colName") },
      {
        id: "audience",
        header: t(locale, "pricing", "colAudience"),
        cell: ({ row }) =>
          t(locale, "pricing", `audience.${row.original.audience}`),
      },
      {
        id: "price",
        header: t(locale, "pricing", "colPrice"),
        cell: ({ row }) =>
          formatCatalogMoney(
            row.original.monthlyPrice.amount,
            row.original.monthlyPrice.currency as "IRR" | "USD",
          ),
      },
      {
        accessorKey: "featureSummary",
        header: t(locale, "pricing", "colFeatures"),
      },
      {
        id: "highlight",
        header: t(locale, "pricing", "colHighlight"),
        cell: ({ row }) =>
          row.original.highlight
            ? t(locale, "pricing", "highlighted")
            : t(locale, "pricing", "standard"),
      },
    ],
    [locale],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "pricing", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "pricing", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="pricing"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "pricing", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "pricing", "subtitle")}</p>
        <p className="text-muted text-xs">{t(locale, "pricing", "demoNote")}</p>
      </header>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="pricing-market">
            {t(locale, "pricing", "marketLabel")}
          </Label>
          <select
            id="pricing-market"
            className={selectClassName}
            value={market}
            onChange={(e) => setMarket(e.target.value as MarketCode)}
          >
            <option value="IR">{t(locale, "pricing", "market.IR")}</option>
            <option value="GLOBAL">
              {t(locale, "pricing", "market.GLOBAL")}
            </option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pricing-audience">
            {t(locale, "pricing", "audienceLabel")}
          </Label>
          <select
            id="pricing-audience"
            className={selectClassName}
            value={audience}
            onChange={(e) =>
              setAudience(e.target.value as "all" | "teacher" | "organization")
            }
          >
            <option value="all">{t(locale, "pricing", "audience.all")}</option>
            <option value="teacher">
              {t(locale, "pricing", "audience.teacher")}
            </option>
            <option value="organization">
              {t(locale, "pricing", "audience.organization")}
            </option>
          </select>
        </div>
      </div>

      {catalogQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!catalogQuery.isLoading && plans.length === 0 ? (
        <EmptyState title={t(locale, "pricing", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={plans}
            columns={columns}
            emptyLabel={t(locale, "pricing", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
