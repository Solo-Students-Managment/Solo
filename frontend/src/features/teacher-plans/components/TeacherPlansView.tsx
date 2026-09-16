"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { AppShell } from "@/components/layouts";
import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { Button, ErrorState, Label, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import type { MarketCode } from "@/services/pricing";
import {
  canStartTrial,
  formatPlanPrice,
  getTeacherPlansClient,
  type TeacherPlanCode,
  type TeacherPlanOffer,
} from "@/services/teacher-plans";

const keys = createQueryKeyFactory("teacher-plans");
const selectClassName =
  "border-border bg-elevated h-10 w-full max-w-xs rounded-md border px-2 text-sm";

export function TeacherPlansView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [market, setMarket] = useState<MarketCode>("IR");

  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const session = sessionQuery.data ?? null;
  const capability = resolveCapability(session, "nav.teacher");
  const ctx = {
    personaId: session?.userId,
    organizationId: null,
    subjectId: null,
  };

  const subscriptionQuery = useQuery({
    queryKey: keys.detail(ctx, "subscription"),
    queryFn: () => getTeacherPlansClient().getSubscription(),
    enabled: capability.allowed,
  });
  const offersQuery = useQuery({
    queryKey: keys.list(ctx, { market }),
    queryFn: () => getTeacherPlansClient().listOffers(market),
    enabled: capability.allowed,
  });

  const trialMutation = useMutation({
    mutationFn: (planCode: TeacherPlanCode) =>
      getTeacherPlansClient().startTrial(planCode),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "teacherPlans", "trialStarted"),
      });
    },
    onError: () => {
      pushFeedback({
        tone: "error",
        title: t(locale, "teacherPlans", "trialBlocked"),
      });
    },
  });

  const subscription = subscriptionQuery.data;
  const columns = useMemo<ColumnDef<TeacherPlanOffer, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: t(locale, "teacherPlans", "colPlan"),
      },
      {
        id: "price",
        header: t(locale, "teacherPlans", "colPrice"),
        cell: ({ row }) =>
          formatPlanPrice(
            row.original.monthlyPrice.amount,
            row.original.monthlyPrice.currency as "IRR" | "USD",
          ),
      },
      {
        accessorKey: "featureSummary",
        header: t(locale, "teacherPlans", "colFeatures"),
      },
      {
        id: "action",
        header: t(locale, "teacherPlans", "colAction"),
        cell: ({ row }) => {
          const code = row.original.code;
          const isCurrent =
            subscription?.planCode === code &&
            subscription.status !== "expired";
          if (isCurrent) {
            return (
              <span className="text-muted text-sm">
                {t(locale, "teacherPlans", "current")}
              </span>
            );
          }
          if (
            !row.original.trialEligible ||
            !subscription ||
            !canStartTrial(subscription, code)
          ) {
            return null;
          }
          return (
            <Button
              type="button"
              size="sm"
              disabled={trialMutation.isPending}
              onClick={() => trialMutation.mutate(code)}
            >
              {t(locale, "teacherPlans", "startTrial")}
            </Button>
          );
        },
      },
    ],
    [locale, subscription, trialMutation.isPending, trialMutation.mutate],
  );

  if (sessionQuery.isLoading) {
    return (
      <AppShell title="Solo">
        <Skeleton className="h-32 w-full" />
      </AppShell>
    );
  }

  if (!capability.allowed) {
    return (
      <AppShell title="Solo">
        <div dir={dir} lang={locale}>
          <ErrorState title={t(locale, "teacherPlans", "forbidden")} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Solo">
      <div className="space-y-6" dir={dir} lang={locale}>
        <header className="space-y-2">
          <h1 className="font-display text-2xl font-medium">
            {t(locale, "teacherPlans", "title")}
          </h1>
          <p className="text-muted text-sm">
            {t(locale, "teacherPlans", "subtitle")}
          </p>
          <p className="text-muted text-xs">
            {t(locale, "teacherPlans", "demoNote")}
          </p>
        </header>

        {subscriptionQuery.isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : null}
        {subscription ? (
          <dl className="border-border grid gap-3 rounded-lg border p-4 sm:grid-cols-3">
            <div>
              <dt className="text-muted text-xs">
                {t(locale, "teacherPlans", "currentPlan")}
              </dt>
              <dd className="font-medium">
                {t(locale, "teacherPlans", `plan.${subscription.planCode}`)}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs">
                {t(locale, "teacherPlans", `status.${subscription.status}`)}
              </dt>
              <dd className="font-medium capitalize">{subscription.status}</dd>
            </div>
            {subscription.trialDaysLeft != null ? (
              <div>
                <dt className="text-muted text-xs">
                  {t(locale, "teacherPlans", "trialDaysLeft")}
                </dt>
                <dd className="font-display text-brand text-2xl">
                  {subscription.trialDaysLeft}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="teacher-plans-market">
            {t(locale, "teacherPlans", "marketLabel")}
          </Label>
          <select
            id="teacher-plans-market"
            className={selectClassName}
            value={market}
            onChange={(e) => setMarket(e.target.value as MarketCode)}
          >
            <option value="IR">{t(locale, "teacherPlans", "market.IR")}</option>
            <option value="GLOBAL">
              {t(locale, "teacherPlans", "market.GLOBAL")}
            </option>
          </select>
        </div>

        {offersQuery.isLoading ? <Skeleton className="h-24 w-full" /> : null}
        {offersQuery.isError ? (
          <ErrorState
            title={t(locale, "teacherPlans", "loadError")}
            action={
              <Button type="button" onClick={() => void offersQuery.refetch()}>
                {t(locale, "teacherPlans", "retry")}
              </Button>
            }
          />
        ) : null}
        {offersQuery.data ? (
          <div className="overflow-x-auto">
            <SoloDataTable
              data={offersQuery.data}
              columns={columns}
              emptyLabel={t(locale, "teacherPlans", "loadError")}
            />
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
