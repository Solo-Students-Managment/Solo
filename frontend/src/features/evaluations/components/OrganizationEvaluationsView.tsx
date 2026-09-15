"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useFormContext } from "react-hook-form";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
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
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import { getAuthClient } from "@/services/auth";
import {
  getEvaluationsClient,
  type EvaluationLevel,
  type EvaluationTemplate,
  type GradeScale,
  type ProgressMetric,
} from "@/services/evaluations";
import { getOrganizationClient } from "@/services/organization";

import {
  createEvaluationLevelSchema,
  createEvaluationTemplateSchema,
  createGradeScaleSchema,
  createProgressMetricSchema,
  parseProgressMetricIds,
  resolveEvaluationTab,
  type CreateEvaluationLevelValues,
  type CreateEvaluationTemplateValues,
  type CreateGradeScaleValues,
  type CreateProgressMetricValues,
  type EvaluationTab,
} from "../schemas";

const evaluationsQueryKeys = createQueryKeyFactory("evaluations");

const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function ScaleFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register, watch } = useFormContext<CreateGradeScaleValues>();
  const type = watch("type");
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="scale-name">
          {t(locale, "evaluations", "nameLabel")}
        </Label>
        <Input id="scale-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="scale-type">
          {t(locale, "evaluations", "scaleTypeLabel")}
        </Label>
        <select
          id="scale-type"
          className={selectClassName}
          {...register("type")}
        >
          {(["out_of_20", "out_of_100", "pass_fail", "custom"] as const).map(
            (value) => (
              <option key={value} value={value}>
                {t(locale, "evaluations", `scaleType.${value}`)}
              </option>
            ),
          )}
        </select>
        <SoloFieldError name="type" />
      </div>
      {type === "custom" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="scale-min">
              {t(locale, "evaluations", "minValueLabel")}
            </Label>
            <Input id="scale-min" type="number" {...register("minValue")} />
            <SoloFieldError name="minValue" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scale-max">
              {t(locale, "evaluations", "maxValueLabel")}
            </Label>
            <Input id="scale-max" type="number" {...register("maxValue")} />
            <SoloFieldError name="maxValue" />
          </div>
        </div>
      ) : null}
      {type === "pass_fail" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="scale-pass">
              {t(locale, "evaluations", "passLabel")}
            </Label>
            <Input id="scale-pass" {...register("passLabel")} />
            <SoloFieldError name="passLabel" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scale-fail">
              {t(locale, "evaluations", "failLabel")}
            </Label>
            <Input id="scale-fail" {...register("failLabel")} />
            <SoloFieldError name="failLabel" />
          </div>
        </div>
      ) : null}
    </>
  );
}

function LevelFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateEvaluationLevelValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="level-name">
          {t(locale, "evaluations", "nameLabel")}
        </Label>
        <Input id="level-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="level-rank">
          {t(locale, "evaluations", "rankLabel")}
        </Label>
        <Input id="level-rank" type="number" min={1} {...register("rank")} />
        <SoloFieldError name="rank" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="level-description">
          {t(locale, "evaluations", "descriptionLabel")}
        </Label>
        <Input id="level-description" {...register("description")} />
        <SoloFieldError name="description" />
      </div>
    </>
  );
}

function MetricFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreateProgressMetricValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="metric-name">
          {t(locale, "evaluations", "nameLabel")}
        </Label>
        <Input id="metric-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="metric-kind">
          {t(locale, "evaluations", "metricKindLabel")}
        </Label>
        <select
          id="metric-kind"
          className={selectClassName}
          {...register("kind")}
        >
          {(["core", "custom"] as const).map((value) => (
            <option key={value} value={value}>
              {t(locale, "evaluations", `metricKind.${value}`)}
            </option>
          ))}
        </select>
        <SoloFieldError name="kind" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="metric-unit">
          {t(locale, "evaluations", "unitLabel")}
        </Label>
        <Input id="metric-unit" {...register("unit")} />
        <SoloFieldError name="unit" />
      </div>
    </>
  );
}

function TemplateFields({
  locale,
  scales,
  levels,
  metrics,
}: {
  locale: ReturnType<typeof resolveLocale>;
  scales: GradeScale[];
  levels: EvaluationLevel[];
  metrics: ProgressMetric[];
}) {
  const { register } = useFormContext<CreateEvaluationTemplateValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="template-name">
          {t(locale, "evaluations", "nameLabel")}
        </Label>
        <Input id="template-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="template-domain">
          {t(locale, "evaluations", "domainLabel")}
        </Label>
        <Input id="template-domain" {...register("domain")} />
        <SoloFieldError name="domain" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="template-scale">
          {t(locale, "evaluations", "scaleLabel")}
        </Label>
        <select
          id="template-scale"
          className={selectClassName}
          {...register("scaleId")}
        >
          <option value="">
            {t(locale, "evaluations", "scalePlaceholder")}
          </option>
          {scales.map((scale) => (
            <option key={scale.id} value={scale.id}>
              {scale.name} (
              {t(locale, "evaluations", `scaleType.${scale.type}`)})
            </option>
          ))}
        </select>
        <SoloFieldError name="scaleId" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="template-level">
          {t(locale, "evaluations", "levelLabel")}
        </Label>
        <select
          id="template-level"
          className={selectClassName}
          {...register("levelId")}
        >
          <option value="">{t(locale, "evaluations", "levelOptional")}</option>
          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.rank}. {level.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="template-metrics">
          {t(locale, "evaluations", "progressMetricsLabel")}
        </Label>
        <select
          id="template-metrics"
          className={selectClassName}
          {...register("progressMetricIds")}
        >
          <option value="">
            {t(locale, "evaluations", "metricsOptional")}
          </option>
          {metrics.map((metric) => (
            <option key={metric.id} value={metric.id}>
              {metric.name} (
              {t(locale, "evaluations", `metricKind.${metric.kind}`)})
            </option>
          ))}
        </select>
        <p className="text-muted text-xs">
          {t(locale, "evaluations", "metricsHint")}
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="template-description">
          {t(locale, "evaluations", "descriptionLabel")}
        </Label>
        <Input id="template-description" {...register("description")} />
      </div>
    </>
  );
}

function TabLink({
  orgId,
  locale,
  tab,
  active,
  label,
}: {
  orgId: string;
  locale: ReturnType<typeof resolveLocale>;
  tab: EvaluationTab;
  active: boolean;
  label: string;
}) {
  const lang = locale === "en" ? "en" : "fa";
  const href = `${routes.organization.evaluations(orgId)}?tab=${tab}&lang=${lang}`;
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-2 text-sm whitespace-nowrap",
        active ? "bg-sunken font-medium" : "hover:bg-sunken",
      )}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

export function OrganizationEvaluationsView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const tab = resolveEvaluationTab(searchParams.get("tab"));
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

  const templatesQuery = useQuery({
    queryKey: evaluationsQueryKeys.list(ctx, { resource: "templates" }),
    queryFn: () => getEvaluationsClient().listTemplates(orgId),
    enabled: Boolean(sessionQuery.data),
  });
  const scalesQuery = useQuery({
    queryKey: evaluationsQueryKeys.list(ctx, { resource: "scales" }),
    queryFn: () => getEvaluationsClient().listScales(orgId),
    enabled: Boolean(sessionQuery.data),
  });
  const levelsQuery = useQuery({
    queryKey: evaluationsQueryKeys.list(ctx, { resource: "levels" }),
    queryFn: () => getEvaluationsClient().listLevels(orgId),
    enabled: Boolean(sessionQuery.data),
  });
  const metricsQuery = useQuery({
    queryKey: evaluationsQueryKeys.list(ctx, { resource: "progress" }),
    queryFn: () => getEvaluationsClient().listProgressMetrics(orgId),
    enabled: Boolean(sessionQuery.data),
  });

  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );

  const templateColumns = useMemo<ColumnDef<EvaluationTemplate, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: t(locale, "evaluations", "colName"),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-muted text-xs">{row.original.domain}</p>
          </div>
        ),
      },
      {
        accessorKey: "scaleName",
        header: t(locale, "evaluations", "colScale"),
      },
      {
        accessorKey: "levelName",
        header: t(locale, "evaluations", "colLevel"),
        cell: ({ row }) => row.original.levelName ?? "—",
      },
      {
        accessorKey: "progressMetricIds",
        header: t(locale, "evaluations", "colMetrics"),
        cell: ({ row }) => String(row.original.progressMetricIds.length),
      },
    ],
    [locale],
  );

  const scaleColumns = useMemo<ColumnDef<GradeScale, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: t(locale, "evaluations", "colName"),
      },
      {
        accessorKey: "type",
        header: t(locale, "evaluations", "colType"),
        cell: ({ row }) =>
          t(locale, "evaluations", `scaleType.${row.original.type}`),
      },
      {
        id: "bounds",
        header: t(locale, "evaluations", "colBounds"),
        cell: ({ row }) => {
          if (row.original.type === "pass_fail") {
            return `${row.original.passLabel}/${row.original.failLabel}`;
          }
          return `${row.original.minValue ?? "—"}–${row.original.maxValue ?? "—"}`;
        },
      },
    ],
    [locale],
  );

  const levelColumns = useMemo<ColumnDef<EvaluationLevel, unknown>[]>(
    () => [
      {
        accessorKey: "rank",
        header: t(locale, "evaluations", "colRank"),
      },
      {
        accessorKey: "name",
        header: t(locale, "evaluations", "colName"),
      },
      {
        accessorKey: "description",
        header: t(locale, "evaluations", "colDescription"),
        cell: ({ row }) => row.original.description || "—",
      },
    ],
    [locale],
  );

  const metricColumns = useMemo<ColumnDef<ProgressMetric, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: t(locale, "evaluations", "colName"),
      },
      {
        accessorKey: "kind",
        header: t(locale, "evaluations", "colKind"),
        cell: ({ row }) =>
          t(locale, "evaluations", `metricKind.${row.original.kind}`),
      },
      {
        accessorKey: "unit",
        header: t(locale, "evaluations", "colUnit"),
      },
    ],
    [locale],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }

  if (orgQuery.isError || !orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "evaluations", "loadError")} />
      </div>
    );
  }

  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "evaluations", "forbidden")} />
      </div>
    );
  }

  const org = orgQuery.data;
  const scales = scalesQuery.data?.data ?? [];
  const levels = levelsQuery.data?.data ?? [];
  const metrics = metricsQuery.data?.data ?? [];
  const templates = templatesQuery.data?.data ?? [];

  async function invalidateAll() {
    await queryClient.invalidateQueries({
      queryKey: evaluationsQueryKeys.all(ctx),
    });
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={org.id}
      orgName={org.name}
      active="evaluations"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "evaluations", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "evaluations", "subtitle")}
        </p>
      </header>

      <nav
        className="border-border flex gap-2 overflow-x-auto border-b pb-2"
        aria-label={t(locale, "evaluations", "tabsLabel")}
      >
        {(
          [
            ["templates", "tabTemplates"],
            ["scales", "tabScales"],
            ["levels", "tabLevels"],
            ["progress", "tabProgress"],
          ] as const
        ).map(([key, labelKey]) => (
          <TabLink
            key={key}
            orgId={org.id}
            locale={locale}
            tab={key}
            active={tab === key}
            label={t(locale, "evaluations", labelKey)}
          />
        ))}
      </nav>

      {tab === "templates" ? (
        <>
          <section className="space-y-3" aria-labelledby="create-template">
            <h2
              id="create-template"
              className="font-display text-xl font-medium"
            >
              {t(locale, "evaluations", "createTemplateTitle")}
            </h2>
            {scales.length === 0 ? (
              <EmptyState title={t(locale, "evaluations", "needScaleFirst")} />
            ) : (
              <SoloForm
                schema={createEvaluationTemplateSchema}
                defaultValues={{
                  name: "",
                  domain: "",
                  scaleId: scales[0]?.id ?? "",
                  levelId: "",
                  progressMetricIds: "",
                  description: "",
                }}
                submitLabel={t(locale, "evaluations", "createTemplateSubmit")}
                onSubmit={async (values: CreateEvaluationTemplateValues) => {
                  await getEvaluationsClient().createTemplate(org.id, {
                    name: values.name,
                    domain: values.domain,
                    scaleId: values.scaleId,
                    levelId: values.levelId || null,
                    progressMetricIds: parseProgressMetricIds(
                      values.progressMetricIds,
                    ),
                    description: values.description,
                  });
                  pushFeedback({
                    tone: "success",
                    title: t(locale, "evaluations", "createTemplateSuccess"),
                  });
                  await invalidateAll();
                }}
              >
                <TemplateFields
                  locale={locale}
                  scales={scales}
                  levels={levels}
                  metrics={metrics}
                />
              </SoloForm>
            )}
          </section>
          <section className="space-y-3" aria-labelledby="templates-list">
            <h2
              id="templates-list"
              className="font-display text-xl font-medium"
            >
              {t(locale, "evaluations", "templatesListTitle")}
            </h2>
            {templatesQuery.isLoading ? <Skeleton className="h-24" /> : null}
            {templatesQuery.isError ? (
              <ErrorState title={t(locale, "evaluations", "loadError")} />
            ) : null}
            {!templatesQuery.isLoading && templates.length === 0 ? (
              <EmptyState title={t(locale, "evaluations", "templatesEmpty")} />
            ) : (
              <div className="overflow-x-auto">
                <SoloDataTable
                  data={templates}
                  columns={templateColumns}
                  emptyLabel={t(locale, "evaluations", "templatesEmpty")}
                />
              </div>
            )}
          </section>
        </>
      ) : null}

      {tab === "scales" ? (
        <>
          <section className="space-y-3" aria-labelledby="create-scale">
            <h2 id="create-scale" className="font-display text-xl font-medium">
              {t(locale, "evaluations", "createScaleTitle")}
            </h2>
            <SoloForm
              schema={createGradeScaleSchema}
              defaultValues={{
                name: "",
                type: "out_of_100",
                minValue: 0,
                maxValue: 100,
                passLabel: "Pass",
                failLabel: "Fail",
              }}
              submitLabel={t(locale, "evaluations", "createScaleSubmit")}
              onSubmit={async (values: CreateGradeScaleValues) => {
                await getEvaluationsClient().createScale(org.id, {
                  name: values.name,
                  type: values.type,
                  minValue: values.minValue ?? null,
                  maxValue: values.maxValue ?? null,
                  passLabel: values.passLabel ?? null,
                  failLabel: values.failLabel ?? null,
                });
                pushFeedback({
                  tone: "success",
                  title: t(locale, "evaluations", "createScaleSuccess"),
                });
                await invalidateAll();
              }}
            >
              <ScaleFields locale={locale} />
            </SoloForm>
          </section>
          <section className="space-y-3" aria-labelledby="scales-list">
            <h2 id="scales-list" className="font-display text-xl font-medium">
              {t(locale, "evaluations", "scalesListTitle")}
            </h2>
            {scalesQuery.isLoading ? <Skeleton className="h-24" /> : null}
            {scalesQuery.isError ? (
              <ErrorState title={t(locale, "evaluations", "loadError")} />
            ) : null}
            {!scalesQuery.isLoading && scales.length === 0 ? (
              <EmptyState title={t(locale, "evaluations", "scalesEmpty")} />
            ) : (
              <div className="overflow-x-auto">
                <SoloDataTable
                  data={scales}
                  columns={scaleColumns}
                  emptyLabel={t(locale, "evaluations", "scalesEmpty")}
                />
              </div>
            )}
          </section>
        </>
      ) : null}

      {tab === "levels" ? (
        <>
          <section className="space-y-3" aria-labelledby="create-level">
            <h2 id="create-level" className="font-display text-xl font-medium">
              {t(locale, "evaluations", "createLevelTitle")}
            </h2>
            <SoloForm
              schema={createEvaluationLevelSchema}
              defaultValues={{ name: "", rank: 1, description: "" }}
              submitLabel={t(locale, "evaluations", "createLevelSubmit")}
              onSubmit={async (values: CreateEvaluationLevelValues) => {
                await getEvaluationsClient().createLevel(org.id, {
                  name: values.name,
                  rank: values.rank,
                  description: values.description,
                });
                pushFeedback({
                  tone: "success",
                  title: t(locale, "evaluations", "createLevelSuccess"),
                });
                await invalidateAll();
              }}
            >
              <LevelFields locale={locale} />
            </SoloForm>
          </section>
          <section className="space-y-3" aria-labelledby="levels-list">
            <h2 id="levels-list" className="font-display text-xl font-medium">
              {t(locale, "evaluations", "levelsListTitle")}
            </h2>
            {levelsQuery.isLoading ? <Skeleton className="h-24" /> : null}
            {levelsQuery.isError ? (
              <ErrorState title={t(locale, "evaluations", "loadError")} />
            ) : null}
            {!levelsQuery.isLoading && levels.length === 0 ? (
              <EmptyState title={t(locale, "evaluations", "levelsEmpty")} />
            ) : (
              <div className="overflow-x-auto">
                <SoloDataTable
                  data={levels}
                  columns={levelColumns}
                  emptyLabel={t(locale, "evaluations", "levelsEmpty")}
                />
              </div>
            )}
          </section>
        </>
      ) : null}

      {tab === "progress" ? (
        <>
          <section className="space-y-3" aria-labelledby="create-metric">
            <h2 id="create-metric" className="font-display text-xl font-medium">
              {t(locale, "evaluations", "createMetricTitle")}
            </h2>
            <SoloForm
              schema={createProgressMetricSchema}
              defaultValues={{ name: "", kind: "core", unit: "%" }}
              submitLabel={t(locale, "evaluations", "createMetricSubmit")}
              onSubmit={async (values: CreateProgressMetricValues) => {
                await getEvaluationsClient().createProgressMetric(org.id, {
                  name: values.name,
                  kind: values.kind,
                  unit: values.unit,
                });
                pushFeedback({
                  tone: "success",
                  title: t(locale, "evaluations", "createMetricSuccess"),
                });
                await invalidateAll();
              }}
            >
              <MetricFields locale={locale} />
            </SoloForm>
          </section>
          <section className="space-y-3" aria-labelledby="metrics-list">
            <h2 id="metrics-list" className="font-display text-xl font-medium">
              {t(locale, "evaluations", "metricsListTitle")}
            </h2>
            {metricsQuery.isLoading ? <Skeleton className="h-24" /> : null}
            {metricsQuery.isError ? (
              <ErrorState title={t(locale, "evaluations", "loadError")} />
            ) : null}
            {!metricsQuery.isLoading && metrics.length === 0 ? (
              <EmptyState title={t(locale, "evaluations", "metricsEmpty")} />
            ) : (
              <div className="overflow-x-auto">
                <SoloDataTable
                  data={metrics}
                  columns={metricColumns}
                  emptyLabel={t(locale, "evaluations", "metricsEmpty")}
                />
              </div>
            )}
          </section>
        </>
      ) : null}
    </OrgShell>
  );
}
