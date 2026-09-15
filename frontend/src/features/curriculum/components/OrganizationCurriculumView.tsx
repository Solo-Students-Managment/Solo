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
  clampLessonProgress,
  getCurriculumClient,
  type CurriculumLesson,
  type CurriculumModule,
  type CurriculumUnit,
} from "@/services/curriculum";
import { getOrganizationClient } from "@/services/organization";

import {
  createLessonSchema,
  createModuleSchema,
  createUnitSchema,
  resolveCurriculumTab,
  type CreateLessonValues,
  type CreateModuleValues,
  type CreateUnitValues,
  type CurriculumTab,
} from "../schemas";

const keys = createQueryKeyFactory("curriculum");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function ModuleFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreateModuleValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="cmod-title">
          {t(locale, "curriculum", "titleLabel")}
        </Label>
        <Input id="cmod-title" {...register("title")} />
        <SoloFieldError name="title" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cmod-desc">
          {t(locale, "curriculum", "descriptionLabel")}
        </Label>
        <Input id="cmod-desc" {...register("description")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cmod-order">
          {t(locale, "curriculum", "sortOrderLabel")}
        </Label>
        <Input id="cmod-order" type="number" {...register("sortOrder")} />
        <SoloFieldError name="sortOrder" />
      </div>
    </>
  );
}

function UnitFields({
  locale,
  modules,
}: {
  locale: ReturnType<typeof resolveLocale>;
  modules: CurriculumModule[];
}) {
  const { register } = useFormContext<CreateUnitValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="cunit-module">
          {t(locale, "curriculum", "moduleLabel")}
        </Label>
        <select
          id="cunit-module"
          className={selectClassName}
          {...register("moduleId")}
        >
          <option value="">—</option>
          {modules.map((row) => (
            <option key={String(row.id)} value={String(row.id)}>
              {row.title}
            </option>
          ))}
        </select>
        <SoloFieldError name="moduleId" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cunit-title">
          {t(locale, "curriculum", "titleLabel")}
        </Label>
        <Input id="cunit-title" {...register("title")} />
        <SoloFieldError name="title" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cunit-desc">
          {t(locale, "curriculum", "descriptionLabel")}
        </Label>
        <Input id="cunit-desc" {...register("description")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cunit-order">
          {t(locale, "curriculum", "sortOrderLabel")}
        </Label>
        <Input id="cunit-order" type="number" {...register("sortOrder")} />
        <SoloFieldError name="sortOrder" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cunit-prereq">
          {t(locale, "curriculum", "prerequisiteUnitLabel")}
        </Label>
        <Input id="cunit-prereq" {...register("prerequisiteUnitId")} />
      </div>
    </>
  );
}

function LessonFields({
  locale,
  units,
}: {
  locale: ReturnType<typeof resolveLocale>;
  units: CurriculumUnit[];
}) {
  const { register } = useFormContext<CreateLessonValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="cles-unit">
          {t(locale, "curriculum", "unitLabel")}
        </Label>
        <select
          id="cles-unit"
          className={selectClassName}
          {...register("unitId")}
        >
          <option value="">—</option>
          {units.map((row) => (
            <option key={String(row.id)} value={String(row.id)}>
              {row.title}
            </option>
          ))}
        </select>
        <SoloFieldError name="unitId" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cles-title">
          {t(locale, "curriculum", "titleLabel")}
        </Label>
        <Input id="cles-title" {...register("title")} />
        <SoloFieldError name="title" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cles-kind">
          {t(locale, "curriculum", "kindLabel")}
        </Label>
        <select
          id="cles-kind"
          className={selectClassName}
          {...register("kind")}
        >
          <option value="lesson">
            {t(locale, "curriculum", "kind.lesson")}
          </option>
          <option value="topic">{t(locale, "curriculum", "kind.topic")}</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cles-obj">
          {t(locale, "curriculum", "objectivesLabel")}
        </Label>
        <Input id="cles-obj" {...register("objectives")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cles-res">
          {t(locale, "curriculum", "resourcesLabel")}
        </Label>
        <Input id="cles-res" {...register("resources")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cles-hw">
          {t(locale, "curriculum", "homeworkLabel")}
        </Label>
        <Input id="cles-hw" {...register("homework")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cles-exam">
          {t(locale, "curriculum", "examRefLabel")}
        </Label>
        <Input id="cles-exam" {...register("examRef")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cles-dur">
          {t(locale, "curriculum", "durationLabel")}
        </Label>
        <Input id="cles-dur" type="number" {...register("durationMinutes")} />
        <SoloFieldError name="durationMinutes" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cles-prereq">
          {t(locale, "curriculum", "prerequisiteLessonLabel")}
        </Label>
        <Input id="cles-prereq" {...register("prerequisiteLessonId")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cles-progress">
          {t(locale, "curriculum", "progressLabel")}
        </Label>
        <Input
          id="cles-progress"
          type="number"
          {...register("progressPercent")}
        />
        <SoloFieldError name="progressPercent" />
      </div>
    </>
  );
}

export function OrganizationCurriculumView() {
  const params = useParams<{ orgId: string }>();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const orgId = params.orgId;
  const tab = resolveCurriculumTab(searchParams.get("tab"));
  const queryClient = useQueryClient();
  const langQuery = `?lang=${locale}`;

  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const orgQuery = useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => getOrganizationClient().get(orgId),
  });
  const capability = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );

  const ctx = {
    personaId: sessionQuery.data?.userId,
    organizationId: orgId,
    subjectId: null,
  };
  const modulesQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "modules" }),
    queryFn: () => getCurriculumClient().listModules(orgId),
    enabled: capability.allowed,
  });
  const unitsQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "units" }),
    queryFn: () => getCurriculumClient().listUnits(orgId),
    enabled: capability.allowed,
  });
  const lessonsQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "lessons" }),
    queryFn: () => getCurriculumClient().listLessons(orgId),
    enabled: capability.allowed,
  });

  const modules = modulesQuery.data?.data ?? [];
  const units = unitsQuery.data?.data ?? [];
  const lessons = lessonsQuery.data?.data ?? [];

  const moduleColumns = useMemo<ColumnDef<CurriculumModule, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "curriculum", "colTitle") },
      { accessorKey: "sortOrder", header: t(locale, "curriculum", "colOrder") },
      {
        accessorKey: "description",
        header: t(locale, "curriculum", "descriptionLabel"),
      },
    ],
    [locale],
  );
  const unitColumns = useMemo<ColumnDef<CurriculumUnit, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "curriculum", "colTitle") },
      {
        accessorKey: "moduleTitle",
        header: t(locale, "curriculum", "colModule"),
      },
      { accessorKey: "sortOrder", header: t(locale, "curriculum", "colOrder") },
    ],
    [locale],
  );
  const lessonColumns = useMemo<ColumnDef<CurriculumLesson, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "curriculum", "colTitle") },
      { accessorKey: "unitTitle", header: t(locale, "curriculum", "colUnit") },
      {
        accessorKey: "kind",
        header: t(locale, "curriculum", "colKind"),
        cell: ({ row }) => t(locale, "curriculum", `kind.${row.original.kind}`),
      },
      {
        accessorKey: "durationMinutes",
        header: t(locale, "curriculum", "colDuration"),
      },
      {
        accessorKey: "progressPercent",
        header: t(locale, "curriculum", "colProgress"),
      },
      {
        accessorKey: "examRef",
        header: t(locale, "curriculum", "colExam"),
        cell: ({ row }) => row.original.examRef ?? "—",
      },
    ],
    [locale],
  );

  const tabs: { key: CurriculumTab; label: string }[] = [
    { key: "modules", label: t(locale, "curriculum", "tabModules") },
    { key: "units", label: t(locale, "curriculum", "tabUnits") },
    { key: "lessons", label: t(locale, "curriculum", "tabLessons") },
  ];

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }

  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "curriculum", "loadError")} />
      </div>
    );
  }

  if (!capability.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "curriculum", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="curriculum"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "curriculum", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "curriculum", "subtitle")}
        </p>
      </header>

      <nav
        aria-label={t(locale, "curriculum", "title")}
        className="flex flex-wrap gap-2"
      >
        {tabs.map((item) => (
          <Link
            key={item.key}
            href={`${routes.organization.curriculum(orgId)}${langQuery}&tab=${item.key}`}
            className={cn(
              "border-border inline-flex min-h-11 items-center rounded-md border px-3 text-sm transition-colors duration-200",
              tab === item.key
                ? "bg-brand text-brand-fg border-brand"
                : "bg-elevated hover:bg-muted/40",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {tab === "modules" ? (
        <section className="space-y-4" aria-labelledby="cmod-heading">
          <h2 id="cmod-heading" className="text-lg font-medium">
            {t(locale, "curriculum", "tabModules")}
          </h2>
          <SoloForm
            schema={createModuleSchema}
            defaultValues={{ title: "", description: "", sortOrder: 0 }}
            submitLabel={t(locale, "curriculum", "createModule")}
            onSubmit={async (values: CreateModuleValues) => {
              await getCurriculumClient().createModule(orgId, {
                title: values.title,
                description: values.description,
                sortOrder: values.sortOrder,
              });
              pushFeedback({
                tone: "success",
                title: t(locale, "curriculum", "moduleSuccess"),
              });
              await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
            }}
          >
            <ModuleFields locale={locale} />
          </SoloForm>
          {modulesQuery.isLoading ? <Skeleton className="h-24" /> : null}
          {!modulesQuery.isLoading && modules.length === 0 ? (
            <EmptyState title={t(locale, "curriculum", "modulesEmpty")} />
          ) : (
            <div className="overflow-x-auto">
              <SoloDataTable
                data={modules}
                columns={moduleColumns}
                emptyLabel={t(locale, "curriculum", "modulesEmpty")}
              />
            </div>
          )}
        </section>
      ) : null}

      {tab === "units" ? (
        <section className="space-y-4" aria-labelledby="cunit-heading">
          <h2 id="cunit-heading" className="text-lg font-medium">
            {t(locale, "curriculum", "tabUnits")}
          </h2>
          <SoloForm
            schema={createUnitSchema}
            defaultValues={{
              moduleId: "",
              title: "",
              description: "",
              sortOrder: 0,
              prerequisiteUnitId: "",
            }}
            submitLabel={t(locale, "curriculum", "createUnit")}
            onSubmit={async (values: CreateUnitValues) => {
              await getCurriculumClient().createUnit(orgId, {
                moduleId: values.moduleId,
                title: values.title,
                description: values.description,
                sortOrder: values.sortOrder,
                prerequisiteUnitId: values.prerequisiteUnitId || null,
              });
              pushFeedback({
                tone: "success",
                title: t(locale, "curriculum", "unitSuccess"),
              });
              await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
            }}
          >
            <UnitFields locale={locale} modules={modules} />
          </SoloForm>
          {unitsQuery.isLoading ? <Skeleton className="h-24" /> : null}
          {!unitsQuery.isLoading && units.length === 0 ? (
            <EmptyState title={t(locale, "curriculum", "unitsEmpty")} />
          ) : (
            <div className="overflow-x-auto">
              <SoloDataTable
                data={units}
                columns={unitColumns}
                emptyLabel={t(locale, "curriculum", "unitsEmpty")}
              />
            </div>
          )}
        </section>
      ) : null}

      {tab === "lessons" ? (
        <section className="space-y-4" aria-labelledby="cles-heading">
          <h2 id="cles-heading" className="text-lg font-medium">
            {t(locale, "curriculum", "tabLessons")}
          </h2>
          <SoloForm
            schema={createLessonSchema}
            defaultValues={{
              unitId: "",
              title: "",
              kind: "lesson",
              objectives: "",
              resources: "",
              homework: "",
              examRef: "",
              durationMinutes: 45,
              prerequisiteLessonId: "",
              progressPercent: 0,
            }}
            submitLabel={t(locale, "curriculum", "createLesson")}
            onSubmit={async (values: CreateLessonValues) => {
              await getCurriculumClient().createLesson(orgId, {
                unitId: values.unitId,
                title: values.title,
                kind: values.kind,
                objectives: values.objectives,
                resources: values.resources,
                homework: values.homework,
                examRef: values.examRef || null,
                durationMinutes: values.durationMinutes,
                prerequisiteLessonId: values.prerequisiteLessonId || null,
                progressPercent: clampLessonProgress(
                  values.progressPercent ?? 0,
                ),
              });
              pushFeedback({
                tone: "success",
                title: t(locale, "curriculum", "lessonSuccess"),
              });
              await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
            }}
          >
            <LessonFields locale={locale} units={units} />
          </SoloForm>
          {lessonsQuery.isLoading ? <Skeleton className="h-24" /> : null}
          {!lessonsQuery.isLoading && lessons.length === 0 ? (
            <EmptyState title={t(locale, "curriculum", "lessonsEmpty")} />
          ) : (
            <div className="overflow-x-auto">
              <SoloDataTable
                data={lessons}
                columns={lessonColumns}
                emptyLabel={t(locale, "curriculum", "lessonsEmpty")}
              />
            </div>
          )}
        </section>
      ) : null}
    </OrgShell>
  );
}
