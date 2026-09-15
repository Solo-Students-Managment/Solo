"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useFormContext } from "react-hook-form";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
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
import { getOrganizationClient } from "@/services/organization";
import {
  getAnalyticsClient,
  isGoalMet,
  type Goal,
  type SavedView,
} from "@/services/analytics";
import {
  createGoalSchema,
  createSavedViewSchema,
  type CreateGoalValues,
  type CreateSavedViewValues,
} from "../schemas";

const viewKeys = createQueryKeyFactory("analytics-views");
const goalKeys = createQueryKeyFactory("analytics-goals");

function ViewFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateSavedViewValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="view-name">
          {t(locale, "analytics", "viewNameLabel")}
        </Label>
        <Input id="view-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="view-metric">
          {t(locale, "analytics", "metricKeyLabel")}
        </Label>
        <Input id="view-metric" {...register("metricKey")} />
        <SoloFieldError name="metricKey" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="view-threshold">
          {t(locale, "analytics", "alertThresholdLabel")}
        </Label>
        <Input
          id="view-threshold"
          type="number"
          {...register("alertThreshold")}
        />
        <SoloFieldError name="alertThreshold" />
      </div>
    </>
  );
}

function GoalFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateGoalValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="goal-name">
          {t(locale, "analytics", "goalNameLabel")}
        </Label>
        <Input id="goal-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="goal-target">
          {t(locale, "analytics", "targetValueLabel")}
        </Label>
        <Input
          id="goal-target"
          type="number"
          min={1}
          {...register("targetValue")}
        />
        <SoloFieldError name="targetValue" />
      </div>
    </>
  );
}

function GoalProgressActions({
  goal,
  locale,
  onUpdate,
}: {
  goal: Goal;
  locale: ReturnType<typeof resolveLocale>;
  onUpdate: (value: number) => Promise<void>;
}) {
  const [value, setValue] = useState(String(goal.currentValue));
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="space-y-1.5">
        <Label htmlFor={`goal-progress-${String(goal.id)}`}>
          {t(locale, "analytics", "currentValueLabel")}
        </Label>
        <Input
          id={`goal-progress-${String(goal.id)}`}
          type="number"
          min={0}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      <Button
        type="button"
        className="min-h-11"
        onClick={() => void onUpdate(Number(value))}
      >
        {t(locale, "analytics", "updateProgress")}
      </Button>
      {isGoalMet(goal) ? (
        <span className="text-brand text-sm">
          {t(locale, "analytics", "goalMet")}
        </span>
      ) : null}
    </div>
  );
}

export function OrganizationAnalyticsView() {
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
    "students.manage",
  );
  const viewsQuery = useQuery({
    queryKey: viewKeys.list(ctx, {}),
    queryFn: () => getAnalyticsClient().listViews(orgId),
    enabled: canManage.allowed,
  });
  const goalsQuery = useQuery({
    queryKey: goalKeys.list(ctx, {}),
    queryFn: () => getAnalyticsClient().listGoals(orgId),
    enabled: canManage.allowed,
  });

  async function updateProgress(goal: Goal, currentValue: number) {
    await getAnalyticsClient().updateGoalProgress(
      orgId,
      String(goal.id),
      currentValue,
    );
    pushFeedback({
      tone: "success",
      title: t(locale, "analytics", "progressSuccess"),
    });
    await queryClient.refetchQueries({ queryKey: goalKeys.lists(ctx) });
  }

  const viewColumns = useMemo<ColumnDef<SavedView, unknown>[]>(
    () => [
      { accessorKey: "name", header: t(locale, "analytics", "colView") },
      { accessorKey: "metricKey", header: t(locale, "analytics", "colMetric") },
      {
        accessorKey: "alertThreshold",
        header: t(locale, "analytics", "colThreshold"),
      },
    ],
    [locale],
  );

  const goalColumns = useMemo<ColumnDef<Goal, unknown>[]>(
    () => [
      { accessorKey: "name", header: t(locale, "analytics", "colGoal") },
      {
        accessorKey: "targetValue",
        header: t(locale, "analytics", "colTarget"),
      },
      {
        accessorKey: "currentValue",
        header: t(locale, "analytics", "colCurrent"),
      },
      {
        id: "status",
        header: t(locale, "analytics", "colStatus"),
        cell: ({ row }) =>
          isGoalMet(row.original)
            ? t(locale, "analytics", "goalMet")
            : t(locale, "analytics", "goalPending"),
      },
      {
        id: "actions",
        header: t(locale, "analytics", "colActions"),
        cell: ({ row }) => (
          <GoalProgressActions
            goal={row.original}
            locale={locale}
            onUpdate={(value) => updateProgress(row.original, value)}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, orgId, sessionQuery.data?.userId],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "analytics", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "analytics", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="analytics"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "analytics", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "analytics", "subtitle")}
        </p>
      </header>

      <SoloForm
        schema={createSavedViewSchema}
        defaultValues={{ name: "", metricKey: "", alertThreshold: 80 }}
        submitLabel={t(locale, "analytics", "createView")}
        onSubmit={async (values: CreateSavedViewValues) => {
          await getAnalyticsClient().createView(orgId, values);
          pushFeedback({
            tone: "success",
            title: t(locale, "analytics", "viewSuccess"),
          });
          await queryClient.refetchQueries({ queryKey: viewKeys.lists(ctx) });
        }}
      >
        <ViewFields locale={locale} />
      </SoloForm>

      {viewsQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!viewsQuery.isLoading && (viewsQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "analytics", "emptyViews")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={viewsQuery.data?.data ?? []}
            columns={viewColumns}
            emptyLabel={t(locale, "analytics", "emptyViews")}
          />
        </div>
      )}

      <SoloForm
        schema={createGoalSchema}
        defaultValues={{ name: "", targetValue: 10 }}
        submitLabel={t(locale, "analytics", "createGoal")}
        onSubmit={async (values: CreateGoalValues) => {
          await getAnalyticsClient().createGoal(orgId, values);
          pushFeedback({
            tone: "success",
            title: t(locale, "analytics", "goalSuccess"),
          });
          await queryClient.refetchQueries({ queryKey: goalKeys.lists(ctx) });
        }}
      >
        <GoalFields locale={locale} />
      </SoloForm>

      {goalsQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!goalsQuery.isLoading && (goalsQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "analytics", "emptyGoals")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={goalsQuery.data?.data ?? []}
            columns={goalColumns}
            emptyLabel={t(locale, "analytics", "emptyGoals")}
          />
        </div>
      )}
    </OrgShell>
  );
}
