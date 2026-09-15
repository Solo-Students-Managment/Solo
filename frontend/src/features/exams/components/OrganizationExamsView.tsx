"use client";

import { useMemo } from "react";
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
import { getExamsClient, isExamPublishable, type Exam } from "@/services/exams";
import { getOrganizationClient } from "@/services/organization";

import {
  createExamSchema,
  parseTimeLimitMinutes,
  type CreateExamValues,
} from "../schemas";

const keys = createQueryKeyFactory("exams");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function ExamFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateExamValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="exam-title">{t(locale, "exams", "titleLabel")}</Label>
        <Input id="exam-title" {...register("title")} />
        <SoloFieldError name="title" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="exam-pool">{t(locale, "exams", "poolSizeLabel")}</Label>
        <Input id="exam-pool" type="number" min={1} {...register("poolSize")} />
        <SoloFieldError name="poolSize" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="exam-random">
          {t(locale, "exams", "randomizeLabel")}
        </Label>
        <select
          id="exam-random"
          className={selectClassName}
          {...register("randomize")}
        >
          <option value="yes">{t(locale, "exams", "randomize.yes")}</option>
          <option value="no">{t(locale, "exams", "randomize.no")}</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="exam-attempts">
          {t(locale, "exams", "maxAttemptsLabel")}
        </Label>
        <Input
          id="exam-attempts"
          type="number"
          min={1}
          max={10}
          {...register("maxAttempts")}
        />
        <SoloFieldError name="maxAttempts" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="exam-time">
          {t(locale, "exams", "timeLimitLabel")}
        </Label>
        <Input
          id="exam-time"
          type="number"
          min={1}
          {...register("timeLimitMinutes")}
        />
        <p className="text-muted text-xs">
          {t(locale, "exams", "timeLimitHint")}
        </p>
      </div>
    </>
  );
}

export function OrganizationExamsView() {
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
  const listQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "exams" }),
    queryFn: () => getExamsClient().list(orgId),
    enabled: Boolean(sessionQuery.data),
  });
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );

  const columns = useMemo<ColumnDef<Exam, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "exams", "colTitle") },
      { accessorKey: "poolSize", header: t(locale, "exams", "colPool") },
      {
        accessorKey: "randomize",
        header: t(locale, "exams", "colRandomize"),
        cell: ({ row }) =>
          row.original.randomize
            ? t(locale, "exams", "randomize.yes")
            : t(locale, "exams", "randomize.no"),
      },
      {
        accessorKey: "maxAttempts",
        header: t(locale, "exams", "colAttempts"),
      },
      {
        accessorKey: "timeLimitMinutes",
        header: t(locale, "exams", "colTime"),
        cell: ({ row }) => row.original.timeLimitMinutes ?? "—",
      },
      {
        accessorKey: "status",
        header: t(locale, "exams", "colStatus"),
        cell: ({ row }) => t(locale, "exams", `status.${row.original.status}`),
      },
      {
        id: "actions",
        header: t(locale, "exams", "colActions"),
        cell: ({ row }) =>
          isExamPublishable(row.original) ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={async () => {
                await getExamsClient().publish(orgId, String(row.original.id));
                pushFeedback({
                  tone: "success",
                  title: t(locale, "exams", "publishSuccess"),
                });
                await queryClient.invalidateQueries({
                  queryKey: keys.all({
                    personaId: sessionQuery.data?.userId,
                    organizationId: orgId,
                    subjectId: null,
                  }),
                });
              }}
            >
              {t(locale, "exams", "publishSubmit")}
            </Button>
          ) : (
            "—"
          ),
      },
    ],
    [locale, orgId, queryClient, sessionQuery.data?.userId],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "exams", "loadError")} />
      </div>
    );
  if (!canManage.allowed)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "exams", "forbidden")} />
      </div>
    );

  const rows = listQuery.data?.data ?? [];

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="exams"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "exams", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "exams", "subtitle")}</p>
      </header>
      <SoloForm
        schema={createExamSchema}
        defaultValues={{
          title: "",
          poolSize: 10,
          randomize: "yes",
          maxAttempts: 1,
          timeLimitMinutes: "60",
        }}
        submitLabel={t(locale, "exams", "createSubmit")}
        onSubmit={async (values: CreateExamValues) => {
          await getExamsClient().create(orgId, {
            title: values.title,
            poolSize: values.poolSize,
            randomize: values.randomize === "yes",
            maxAttempts: values.maxAttempts,
            timeLimitMinutes: parseTimeLimitMinutes(values.timeLimitMinutes),
          });
          pushFeedback({
            tone: "success",
            title: t(locale, "exams", "createSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <ExamFields locale={locale} />
      </SoloForm>
      {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!listQuery.isLoading && rows.length === 0 ? (
        <EmptyState title={t(locale, "exams", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={rows}
            columns={columns}
            emptyLabel={t(locale, "exams", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
