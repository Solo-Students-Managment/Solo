"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useFormContext } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { z } from "zod";

import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { OrgShell } from "@/features/organization";
import {
  Button,
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
import {
  getManualBillingClient,
  type ManualInvoice,
} from "@/services/manual-billing";
import { getOrganizationClient } from "@/services/organization";

const keys = createQueryKeyFactory("manual-billing");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

const createSchema = z.object({
  amount: z.coerce.number().positive(),
  currency: z.enum(["IRR", "USD"]),
});
type CreateValues = z.infer<typeof createSchema>;

function CreateFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreateValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="mb-amount">
          {t(locale, "manualBilling", "amountLabel")}
        </Label>
        <Input id="mb-amount" type="number" {...register("amount")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="mb-cur">
          {t(locale, "manualBilling", "currencyLabel")}
        </Label>
        <select
          id="mb-cur"
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

export function OrganizationManualBillingView() {
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
    queryFn: () => getManualBillingClient().list(orgId),
    enabled: canManage.allowed,
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => getManualBillingClient().send(orgId, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "info",
        title: t(locale, "manualBilling", "sendSuccess"),
      });
    },
  });
  const escalateMutation = useMutation({
    mutationFn: (id: string) => getManualBillingClient().escalate(orgId, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "warning",
        title: t(locale, "manualBilling", "escalateSuccess"),
      });
    },
  });
  const payMutation = useMutation({
    mutationFn: (id: string) => getManualBillingClient().markPaid(orgId, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "manualBilling", "paidSuccess"),
      });
    },
  });

  const columns = useMemo<ColumnDef<ManualInvoice, unknown>[]>(
    () => [
      {
        accessorKey: "number",
        header: t(locale, "manualBilling", "colNumber"),
      },
      {
        id: "amount",
        header: t(locale, "manualBilling", "colAmount"),
        cell: ({ row }) =>
          formatInvoiceMoney(
            row.original.amount.amount,
            row.original.amount.currency as "IRR" | "USD",
          ),
      },
      {
        id: "status",
        header: t(locale, "manualBilling", "colStatus"),
        cell: ({ row }) =>
          t(locale, "manualBilling", `status.${row.original.status}`),
      },
      {
        accessorKey: "dunningLevel",
        header: t(locale, "manualBilling", "colDunning"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const inv = row.original;
          return (
            <div className="flex flex-wrap gap-2">
              {inv.status === "draft" ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={sendMutation.isPending}
                  onClick={() => sendMutation.mutate(inv.id)}
                >
                  {t(locale, "manualBilling", "send")}
                </Button>
              ) : null}
              {inv.status === "sent" || inv.status === "overdue" ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={escalateMutation.isPending}
                    onClick={() => escalateMutation.mutate(inv.id)}
                  >
                    {t(locale, "manualBilling", "escalate")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={payMutation.isPending}
                    onClick={() => payMutation.mutate(inv.id)}
                  >
                    {t(locale, "manualBilling", "markPaid")}
                  </Button>
                </>
              ) : null}
            </div>
          );
        },
      },
    ],
    [escalateMutation, locale, payMutation, sendMutation],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data || !canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "manualBilling", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="manualBilling"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "manualBilling", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "manualBilling", "subtitle")}
        </p>
      </header>

      <SoloForm
        schema={createSchema}
        defaultValues={{ amount: 1_000_000, currency: "IRR" }}
        submitLabel={t(locale, "manualBilling", "create")}
        onSubmit={async (values: CreateValues) => {
          await getManualBillingClient().create(orgId, values);
          pushFeedback({
            tone: "success",
            title: t(locale, "manualBilling", "createSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <CreateFields locale={locale} />
      </SoloForm>

      {(listQuery.data?.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "manualBilling", "empty")} />
      ) : (
        <SoloDataTable
          data={listQuery.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "manualBilling", "empty")}
        />
      )}
    </OrgShell>
  );
}
