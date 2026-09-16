"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";

import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { OrgShell } from "@/features/organization";
import { Button, ErrorState, Label, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";
import {
  getPlanChangeClient,
  hasOverLimit,
  type OverLimitItem,
  type PlanChangePreview,
} from "@/services/plan-change";
import type { OrgPlanCode } from "@/services/subscription";

const plans: OrgPlanCode[] = ["org_starter", "org_pro", "org_enterprise"];
const selectClassName =
  "border-border bg-elevated h-10 w-full max-w-xs rounded-md border px-2 text-sm";

export function OrganizationPlanChangeView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const [target, setTarget] = useState<OrgPlanCode>("org_pro");
  const [preview, setPreview] = useState<PlanChangePreview | null>(null);

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
    "billing.manage",
  );

  const previewMutation = useMutation({
    mutationFn: () => getPlanChangeClient().preview(orgId, target),
    onSuccess: (data) => setPreview(data),
  });
  const applyMutation = useMutation({
    mutationFn: () => getPlanChangeClient().apply(orgId, target),
    onSuccess: (data) => {
      setPreview(data);
      pushFeedback({
        tone: "success",
        title: t(locale, "planChange", "applied"),
      });
    },
  });

  const columns = useMemo<ColumnDef<OverLimitItem, unknown>[]>(
    () => [
      {
        accessorKey: "resource",
        header: t(locale, "planChange", "colResource"),
      },
      { accessorKey: "current", header: t(locale, "planChange", "colCurrent") },
      { accessorKey: "limit", header: t(locale, "planChange", "colLimit") },
      { accessorKey: "excess", header: t(locale, "planChange", "colExcess") },
    ],
    [locale],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data || !canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "planChange", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="planChange"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "planChange", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "planChange", "subtitle")}
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="plan-change-target">
            {t(locale, "planChange", "targetPlan")}
          </Label>
          <select
            id="plan-change-target"
            className={selectClassName}
            value={target}
            onChange={(e) => setTarget(e.target.value as OrgPlanCode)}
          >
            {plans.map((code) => (
              <option key={code} value={code}>
                {t(locale, "planChange", `plan.${code}`)}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={previewMutation.isPending}
          onClick={() => previewMutation.mutate()}
        >
          {t(locale, "planChange", "preview")}
        </Button>
        <Button
          type="button"
          disabled={!preview || applyMutation.isPending}
          onClick={() => applyMutation.mutate()}
        >
          {t(locale, "planChange", "apply")}
        </Button>
      </div>

      <p className="text-muted border-border rounded-md border border-dashed p-3 text-sm">
        {t(locale, "planChange", "noDataLoss")}
      </p>

      {preview ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">
            {t(locale, "planChange", `direction.${preview.direction}`)} ·{" "}
            {t(locale, "planChange", `plan.${preview.targetPlanCode}`)}
          </p>
          {hasOverLimit(preview) ? (
            <>
              <h2 className="font-medium">
                {t(locale, "planChange", "overLimitTitle")}
              </h2>
              <SoloDataTable
                data={preview.overLimitItems.filter((i) => i.excess > 0)}
                columns={columns}
                emptyLabel={t(locale, "planChange", "noDataLoss")}
              />
            </>
          ) : null}
        </div>
      ) : null}
    </OrgShell>
  );
}
