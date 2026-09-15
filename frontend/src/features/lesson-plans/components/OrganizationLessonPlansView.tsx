"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Controller, useFormContext } from "react-hook-form";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { SoloContentEditor } from "@/components/shared/SoloContentEditor";
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
  getLessonPlansClient,
  hasMeaningfulBody,
  type LessonPlan,
} from "@/services/lesson-plans";

import {
  createLessonPlanSchema,
  type CreateLessonPlanValues,
} from "../schemas";

const keys = createQueryKeyFactory("lesson-plans");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";
const VISIBILITIES = ["personal", "school", "specific", "public"] as const;

function PlanFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register, control } = useFormContext<CreateLessonPlanValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="lplan-title">
          {t(locale, "lessonPlans", "titleLabel")}
        </Label>
        <Input id="lplan-title" {...register("title")} />
        <SoloFieldError name="title" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="lplan-body">
          {t(locale, "lessonPlans", "bodyLabel")}
        </Label>
        <Controller
          name="bodyHtml"
          control={control}
          render={({ field }) => (
            <SoloContentEditor
              initialHtml={field.value || "<p></p>"}
              onChange={field.onChange}
            />
          )}
        />
        <SoloFieldError name="bodyHtml" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="lplan-visibility">
          {t(locale, "lessonPlans", "visibilityLabel")}
        </Label>
        <select
          id="lplan-visibility"
          className={selectClassName}
          {...register("visibility")}
        >
          {VISIBILITIES.map((visibility) => (
            <option key={visibility} value={visibility}>
              {t(locale, "lessonPlans", `visibility.${visibility}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="lplan-module">
          {t(locale, "lessonPlans", "moduleRefLabel")}
        </Label>
        <Input id="lplan-module" {...register("moduleRef")} />
      </div>
    </>
  );
}

export function OrganizationLessonPlansView() {
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
  const listQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "plans" }),
    queryFn: () => getLessonPlansClient().list(orgId),
    enabled: canManage.allowed,
  });

  const columns = useMemo<ColumnDef<LessonPlan, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "lessonPlans", "colTitle") },
      {
        accessorKey: "visibility",
        header: t(locale, "lessonPlans", "colVisibility"),
        cell: ({ row }) =>
          t(locale, "lessonPlans", `visibility.${row.original.visibility}`),
      },
      {
        accessorKey: "version",
        header: t(locale, "lessonPlans", "colVersion"),
      },
      {
        accessorKey: "moduleRef",
        header: t(locale, "lessonPlans", "colModule"),
        cell: ({ row }) => row.original.moduleRef ?? "—",
      },
      {
        id: "actions",
        header: t(locale, "lessonPlans", "colActions"),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={async () => {
                await getLessonPlansClient().clone(
                  orgId,
                  String(row.original.id),
                );
                pushFeedback({
                  tone: "success",
                  title: t(locale, "lessonPlans", "cloneSuccess"),
                });
                await queryClient.invalidateQueries({
                  queryKey: keys.all(ctx),
                });
              }}
            >
              {t(locale, "lessonPlans", "cloneSubmit")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={async () => {
                await getLessonPlansClient().snapshot(
                  orgId,
                  String(row.original.id),
                );
                pushFeedback({
                  tone: "success",
                  title: t(locale, "lessonPlans", "snapshotSuccess"),
                });
                await queryClient.invalidateQueries({
                  queryKey: keys.all(ctx),
                });
              }}
            >
              {t(locale, "lessonPlans", "snapshotSubmit")}
            </Button>
          </div>
        ),
      },
    ],
    // ctx is derived from session/org; invalidate uses stable key factory prefix
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: avoid remounting columns each render
    [locale, orgId, queryClient, sessionQuery.data?.userId],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "lessonPlans", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "lessonPlans", "forbidden")} />
      </div>
    );
  }

  const rows = listQuery.data?.data ?? [];

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="lessonPlans"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "lessonPlans", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "lessonPlans", "subtitle")}
        </p>
      </header>

      <SoloForm
        schema={createLessonPlanSchema}
        defaultValues={{
          title: "",
          bodyHtml: "<p></p>",
          visibility: "school",
          moduleRef: "",
        }}
        submitLabel={t(locale, "lessonPlans", "createSubmit")}
        onSubmit={async (values: CreateLessonPlanValues) => {
          if (!hasMeaningfulBody(values.bodyHtml)) {
            pushFeedback({
              tone: "error",
              title: t(locale, "lessonPlans", "validation.body"),
            });
            return;
          }
          await getLessonPlansClient().create(orgId, {
            title: values.title,
            bodyHtml: values.bodyHtml,
            visibility: values.visibility,
            moduleRef: values.moduleRef || null,
          });
          pushFeedback({
            tone: "success",
            title: t(locale, "lessonPlans", "createSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <PlanFields locale={locale} />
      </SoloForm>

      {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!listQuery.isLoading && rows.length === 0 ? (
        <EmptyState title={t(locale, "lessonPlans", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={rows}
            columns={columns}
            emptyLabel={t(locale, "lessonPlans", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
