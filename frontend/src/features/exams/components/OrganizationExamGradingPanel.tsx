"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useFormContext } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { EmptyState, Input, Label, Skeleton } from "@/components/ui";
import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import {
  getExamsClient,
  suggestPlacement,
  type ExamGrade,
} from "@/services/exams";

import {
  gradeAttemptSchema,
  regradeAttemptSchema,
  type GradeAttemptValues,
  type RegradeAttemptValues,
} from "../schemas";

const keys = createQueryKeyFactory("exams");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function GradeFields({ locale }: { locale: Locale }) {
  const { register } = useFormContext<GradeAttemptValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="exam-grade-attempt">
          {t(locale, "exams", "attemptIdLabel")}
        </Label>
        <Input id="exam-grade-attempt" {...register("attemptId")} />
        <SoloFieldError name="attemptId" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="exam-grade-score">
          {t(locale, "exams", "scoreLabel")}
        </Label>
        <Input
          id="exam-grade-score"
          type="number"
          min={0}
          max={100}
          {...register("score")}
        />
        <SoloFieldError name="score" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="exam-grade-rubric">
          {t(locale, "exams", "rubricLabel")}
        </Label>
        <Input id="exam-grade-rubric" {...register("rubricNotes")} />
        <SoloFieldError name="rubricNotes" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="exam-grade-placement">
          {t(locale, "exams", "placementLabel")}
        </Label>
        <Input
          id="exam-grade-placement"
          {...register("placementRecommendation")}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="exam-grade-override">
          {t(locale, "exams", "overrideLabel")}
        </Label>
        <select
          id="exam-grade-override"
          className={selectClassName}
          {...register("humanOverride")}
        >
          <option value="no">{t(locale, "exams", "override.no")}</option>
          <option value="yes">{t(locale, "exams", "override.yes")}</option>
        </select>
      </div>
    </>
  );
}

function RegradeFields({ locale }: { locale: Locale }) {
  const { register } = useFormContext<RegradeAttemptValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="exam-regrade-id">
          {t(locale, "exams", "gradeIdLabel")}
        </Label>
        <Input id="exam-regrade-id" {...register("gradeId")} />
        <SoloFieldError name="gradeId" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="exam-regrade-attempt">
          {t(locale, "exams", "attemptIdLabel")}
        </Label>
        <Input id="exam-regrade-attempt" {...register("attemptId")} />
        <SoloFieldError name="attemptId" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="exam-regrade-score">
          {t(locale, "exams", "scoreLabel")}
        </Label>
        <Input
          id="exam-regrade-score"
          type="number"
          min={0}
          max={100}
          {...register("score")}
        />
        <SoloFieldError name="score" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="exam-regrade-rubric">
          {t(locale, "exams", "rubricLabel")}
        </Label>
        <Input id="exam-regrade-rubric" {...register("rubricNotes")} />
        <SoloFieldError name="rubricNotes" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="exam-regrade-placement">
          {t(locale, "exams", "placementLabel")}
        </Label>
        <Input
          id="exam-regrade-placement"
          {...register("placementRecommendation")}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="exam-regrade-override">
          {t(locale, "exams", "overrideLabel")}
        </Label>
        <select
          id="exam-regrade-override"
          className={selectClassName}
          {...register("humanOverride")}
        >
          <option value="no">{t(locale, "exams", "override.no")}</option>
          <option value="yes">{t(locale, "exams", "override.yes")}</option>
        </select>
      </div>
    </>
  );
}

type OrganizationExamGradingPanelProps = {
  locale: Locale;
  orgId: string;
  personaId?: string;
  defaultAttemptId?: string;
};

export function OrganizationExamGradingPanel({
  locale,
  orgId,
  personaId,
  defaultAttemptId = "",
}: OrganizationExamGradingPanelProps) {
  const queryClient = useQueryClient();
  const ctx = {
    personaId,
    organizationId: orgId,
    subjectId: null,
  };
  const gradesQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "grades" }),
    queryFn: () => getExamsClient().listGrades(orgId),
  });
  const rows = gradesQuery.data?.data ?? [];

  const columns = useMemo<ColumnDef<ExamGrade, unknown>[]>(
    () => [
      { accessorKey: "id", header: t(locale, "exams", "gradeIdLabel") },
      { accessorKey: "attemptId", header: t(locale, "exams", "colAttempt") },
      { accessorKey: "score", header: t(locale, "exams", "colScore") },
      {
        accessorKey: "placementRecommendation",
        header: t(locale, "exams", "colPlacement"),
        cell: ({ row }) => row.original.placementRecommendation ?? "—",
      },
      {
        accessorKey: "humanOverride",
        header: t(locale, "exams", "colOverride"),
        cell: ({ row }) =>
          row.original.humanOverride
            ? t(locale, "exams", "override.yes")
            : t(locale, "exams", "override.no"),
      },
      {
        accessorKey: "history",
        header: t(locale, "exams", "colRegrades"),
        cell: ({ row }) => String(row.original.history.length),
      },
    ],
    [locale],
  );

  return (
    <section className="space-y-6" aria-labelledby="exam-grade-heading">
      <div className="space-y-3">
        <h2 id="exam-grade-heading" className="text-lg font-medium">
          {t(locale, "exams", "gradeTitle")}
        </h2>
        <SoloForm
          key={`grade-${defaultAttemptId}`}
          schema={gradeAttemptSchema}
          defaultValues={{
            attemptId: defaultAttemptId,
            score: 80,
            rubricNotes: "",
            placementRecommendation: "",
            humanOverride: "no",
          }}
          submitLabel={t(locale, "exams", "gradeSubmit")}
          onSubmit={async (values: GradeAttemptValues) => {
            const suggested = suggestPlacement(values.score);
            await getExamsClient().gradeAttempt(orgId, {
              attemptId: values.attemptId,
              score: values.score,
              rubricNotes: values.rubricNotes,
              placementRecommendation:
                values.placementRecommendation?.trim() || suggested,
              humanOverride: values.humanOverride === "yes",
            });
            pushFeedback({
              tone: "success",
              title: t(locale, "exams", "gradeSuccess"),
            });
            await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
          }}
        >
          <GradeFields locale={locale} />
        </SoloForm>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">
          {t(locale, "exams", "regradeTitle")}
        </h2>
        <SoloForm
          key={`regrade-${defaultAttemptId}`}
          schema={regradeAttemptSchema}
          defaultValues={{
            gradeId: "",
            attemptId: defaultAttemptId,
            score: 80,
            rubricNotes: "",
            placementRecommendation: "",
            humanOverride: "yes",
          }}
          submitLabel={t(locale, "exams", "regradeSubmit")}
          onSubmit={async (values: RegradeAttemptValues) => {
            await getExamsClient().regradeAttempt(orgId, values.gradeId, {
              attemptId: values.attemptId,
              score: values.score,
              rubricNotes: values.rubricNotes,
              placementRecommendation: values.placementRecommendation,
              humanOverride: values.humanOverride === "yes",
            });
            pushFeedback({
              tone: "success",
              title: t(locale, "exams", "regradeSuccess"),
            });
            await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
          }}
        >
          <RegradeFields locale={locale} />
        </SoloForm>
      </div>

      {gradesQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!gradesQuery.isLoading && rows.length === 0 ? (
        <EmptyState title={t(locale, "exams", "gradesEmpty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={rows}
            columns={columns}
            emptyLabel={t(locale, "exams", "gradesEmpty")}
          />
        </div>
      )}
    </section>
  );
}
