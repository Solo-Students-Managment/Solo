"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";

import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { OrgShell } from "@/features/organization";
import { Button, ErrorState, Label, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";
import {
  getAddOnsClient,
  type AddOn,
  type CreditPack,
} from "@/services/add-ons";
import { formatCatalogMoney } from "@/services/pricing";

const keys = createQueryKeyFactory("add-ons");

export function OrganizationAddOnsView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
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
  const bundleQuery = useQuery({
    queryKey: keys.detail(ctx, "bundle"),
    queryFn: () => getAddOnsClient().get(orgId),
    enabled: canManage.allowed,
  });

  const overageMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      getAddOnsClient().setOverageOptIn(orgId, enabled),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "addOns", "overageUpdated"),
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      getAddOnsClient().toggleAddOn(orgId, id, active),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "addOns", "updated"),
      });
    },
  });

  const addOnColumns = useMemo<ColumnDef<AddOn, unknown>[]>(
    () => [
      { accessorKey: "name", header: t(locale, "addOns", "colName") },
      {
        id: "price",
        header: t(locale, "addOns", "colPrice"),
        cell: ({ row }) =>
          formatCatalogMoney(
            row.original.monthlyPrice.amount,
            row.original.monthlyPrice.currency as "IRR" | "USD",
          ),
      },
      {
        id: "status",
        header: t(locale, "addOns", "colStatus"),
        cell: ({ row }) =>
          row.original.active
            ? t(locale, "addOns", "active")
            : t(locale, "addOns", "inactive"),
      },
      {
        id: "action",
        header: "",
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={toggleMutation.isPending}
            onClick={() =>
              toggleMutation.mutate({
                id: String(row.original.id),
                active: !row.original.active,
              })
            }
          >
            {row.original.active
              ? t(locale, "addOns", "disable")
              : t(locale, "addOns", "enable")}
          </Button>
        ),
      },
    ],
    [locale, toggleMutation.isPending, toggleMutation.mutate],
  );

  const packColumns = useMemo<ColumnDef<CreditPack, unknown>[]>(
    () => [
      { accessorKey: "name", header: t(locale, "addOns", "colName") },
      {
        accessorKey: "credits",
        header: t(locale, "addOns", "colCredits"),
      },
      {
        id: "price",
        header: t(locale, "addOns", "colPrice"),
        cell: ({ row }) =>
          formatCatalogMoney(
            row.original.price.amount,
            row.original.price.currency as "IRR" | "USD",
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
        <ErrorState title={t(locale, "addOns", "forbidden")} />
      </div>
    );
  }

  const bundle = bundleQuery.data;

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="addOns"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "addOns", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "addOns", "subtitle")}</p>
      </header>

      <div className="border-border space-y-2 rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <input
            id="overage-opt-in"
            type="checkbox"
            checked={bundle?.overageOptIn ?? false}
            disabled={overageMutation.isPending || !bundle}
            onChange={(e) => overageMutation.mutate(e.target.checked)}
          />
          <Label htmlFor="overage-opt-in">
            {t(locale, "addOns", "overageOptIn")}
          </Label>
        </div>
        <p className="text-muted text-xs">
          {t(locale, "addOns", "overageHelp")}
        </p>
      </div>

      {bundleQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {bundle ? (
        <>
          <h2 className="font-medium">{t(locale, "addOns", "addOnsTitle")}</h2>
          <SoloDataTable
            data={bundle.addOns}
            columns={addOnColumns}
            emptyLabel={t(locale, "addOns", "loadError")}
          />
          <h2 className="font-medium">
            {t(locale, "addOns", "creditPacksTitle")}
          </h2>
          <SoloDataTable
            data={bundle.creditPacks}
            columns={packColumns}
            emptyLabel={t(locale, "addOns", "loadError")}
          />
        </>
      ) : null}
    </OrgShell>
  );
}
