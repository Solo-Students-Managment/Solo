"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useFormContext } from "react-hook-form";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { OrgShell } from "@/features/organization";
import {
  EmptyState,
  ErrorState,
  Input,
  Label,
  Skeleton,
} from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import { formatInvoiceMoney } from "@/services/billing";
import { getOrganizationClient } from "@/services/organization";
import {
  getTaxInvoicesClient,
  type TaxDocument,
} from "@/services/tax-invoices";

const keys = createQueryKeyFactory("tax-invoices");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

const issueSchema = z.object({
  type: z.enum(["invoice", "credit_note"]),
  locale: z.enum(["en", "fa"]),
  vatRatePercent: z.coerce.number().min(0).max(100),
  subtotalAmount: z.coerce.number().positive(),
  currency: z.enum(["IRR", "USD"]),
});
type IssueValues = z.infer<typeof issueSchema>;

function IssueFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<IssueValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="tax-type">
          {t(locale, "taxInvoices", "typeLabel")}
        </Label>
        <select id="tax-type" className={selectClassName} {...register("type")}>
          <option value="invoice">
            {t(locale, "taxInvoices", "type.invoice")}
          </option>
          <option value="credit_note">
            {t(locale, "taxInvoices", "type.credit_note")}
          </option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tax-locale">
          {t(locale, "taxInvoices", "localeLabel")}
        </Label>
        <select
          id="tax-locale"
          className={selectClassName}
          {...register("locale")}
        >
          <option value="en">en</option>
          <option value="fa">fa</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tax-vat">{t(locale, "taxInvoices", "vatLabel")}</Label>
        <Input id="tax-vat" type="number" {...register("vatRatePercent")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tax-sub">
          {t(locale, "taxInvoices", "subtotalLabel")}
        </Label>
        <Input id="tax-sub" type="number" {...register("subtotalAmount")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tax-cur">
          {t(locale, "taxInvoices", "currencyLabel")}
        </Label>
        <select
          id="tax-cur"
          className={selectClassName}
          {...register("currency")}
        >
          <option value="IRR">IRR</option>
          <option value="USD">USD</option>
        </select>
      </div>
    </>
  );
}

export function OrganizationTaxInvoicesView() {
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
  const listQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getTaxInvoicesClient().list(orgId),
    enabled: canManage.allowed,
  });

  const columns = useMemo<ColumnDef<TaxDocument, unknown>[]>(
    () => [
      { accessorKey: "number", header: t(locale, "taxInvoices", "colNumber") },
      {
        id: "type",
        header: t(locale, "taxInvoices", "colType"),
        cell: ({ row }) =>
          t(locale, "taxInvoices", `type.${row.original.type}`),
      },
      { accessorKey: "locale", header: t(locale, "taxInvoices", "colLocale") },
      {
        id: "total",
        header: t(locale, "taxInvoices", "colTotal"),
        cell: ({ row }) =>
          formatInvoiceMoney(
            row.original.total.amount,
            row.original.total.currency as "IRR" | "USD",
          ),
      },
    ],
    [locale],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data || !canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "taxInvoices", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="taxInvoices"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "taxInvoices", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "taxInvoices", "subtitle")}
        </p>
      </header>

      <SoloForm
        schema={issueSchema}
        defaultValues={{
          type: "invoice",
          locale: "en",
          vatRatePercent: 9,
          subtotalAmount: 1_000_000,
          currency: "IRR",
        }}
        submitLabel={t(locale, "taxInvoices", "issue")}
        onSubmit={async (values: IssueValues) => {
          await getTaxInvoicesClient().issue(orgId, values);
          pushFeedback({
            tone: "success",
            title: t(locale, "taxInvoices", "issueSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <IssueFields locale={locale} />
      </SoloForm>

      {(listQuery.data?.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "taxInvoices", "empty")} />
      ) : (
        <SoloDataTable
          data={listQuery.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "taxInvoices", "empty")}
        />
      )}
    </OrgShell>
  );
}
