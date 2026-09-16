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
import { getAuthClient } from "@/services/auth";
import {
  formatInvoiceMoney,
  getBillingClient,
  type Invoice,
} from "@/services/billing";
import { getOrganizationClient } from "@/services/organization";

const keys = createQueryKeyFactory("billing");

export function OrganizationBillingView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const ctx = {
    personaId: undefined as string | undefined,
    organizationId: orgId,
    subjectId: null,
  };

  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  ctx.personaId = sessionQuery.data?.userId;
  const orgQuery = useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => getOrganizationClient().get(orgId),
  });
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "billing.manage",
  );
  const summaryQuery = useQuery({
    queryKey: keys.detail(ctx, "summary"),
    queryFn: () => getBillingClient().getSummary(orgId),
    enabled: canManage.allowed,
  });
  const invoicesQuery = useQuery({
    queryKey: keys.list(ctx, { kind: "invoices" }),
    queryFn: () => getBillingClient().listInvoices(orgId),
    enabled: canManage.allowed,
  });

  const columns = useMemo<ColumnDef<Invoice, unknown>[]>(
    () => [
      { accessorKey: "number", header: t(locale, "billing", "colNumber") },
      {
        id: "status",
        header: t(locale, "billing", "colStatus"),
        cell: ({ row }) =>
          t(locale, "billing", `status.${row.original.status}`),
      },
      {
        id: "total",
        header: t(locale, "billing", "colTotal"),
        cell: ({ row }) =>
          formatInvoiceMoney(
            row.original.total.amount,
            row.original.total.currency as "IRR" | "USD",
          ),
      },
      {
        id: "issued",
        header: t(locale, "billing", "colIssued"),
        cell: ({ row }) =>
          new Date(row.original.issuedAt).toLocaleDateString(locale),
      },
      {
        id: "due",
        header: t(locale, "billing", "colDue"),
        cell: ({ row }) =>
          new Date(row.original.dueAt).toLocaleDateString(locale),
      },
    ],
    [locale],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data || !canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "billing", "forbidden")} />
      </div>
    );
  }

  const summary = summaryQuery.data;

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="billing"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "billing", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "billing", "subtitle")}</p>
      </header>

      {summaryQuery.isLoading ? <Skeleton className="h-20" /> : null}
      {summary ? (
        <dl className="border-border grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
          <div>
            <dt className="text-muted text-xs">
              {t(locale, "billing", "nextBill")}
            </dt>
            <dd>
              {summary.nextBillAt
                ? new Date(summary.nextBillAt).toLocaleDateString(locale)
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted text-xs">
              {t(locale, "billing", "nextBillAmount")}
            </dt>
            <dd className="font-medium">
              {summary.nextBillAmount
                ? formatInvoiceMoney(
                    summary.nextBillAmount.amount,
                    summary.nextBillAmount.currency as "IRR" | "USD",
                  )
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted text-xs">
              {t(locale, "billing", "paymentMethod")}
            </dt>
            <dd>
              {summary.paymentMethod
                ? `${summary.paymentMethod.brand} ·••• ${summary.paymentMethod.last4}`
                : t(locale, "billing", "noPaymentMethod")}
            </dd>
          </div>
        </dl>
      ) : null}

      <h2 className="font-medium">{t(locale, "billing", "invoicesTitle")}</h2>
      {invoicesQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {invoicesQuery.data && invoicesQuery.data.data.length === 0 ? (
        <EmptyState title={t(locale, "billing", "empty")} />
      ) : invoicesQuery.data ? (
        <SoloDataTable
          data={invoicesQuery.data.data}
          columns={columns}
          emptyLabel={t(locale, "billing", "empty")}
        />
      ) : null}
    </OrgShell>
  );
}
