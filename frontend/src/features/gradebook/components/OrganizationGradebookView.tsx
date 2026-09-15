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
import { getGradebookClient, type GradeEntry } from "@/services/gradebook";
import { upsertGradeSchema, type UpsertGradeValues } from "../schemas";

const keys = createQueryKeyFactory("gradebook");
function Fields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<UpsertGradeValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="gb-student">
          {t(locale, "gradebook", "studentLabel")}
        </Label>
        <Input id="gb-student" {...register("studentDisplayName")} />
        <SoloFieldError name="studentDisplayName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="gb-subject">
          {t(locale, "gradebook", "subjectLabel")}
        </Label>
        <Input id="gb-subject" {...register("subjectName")} />
        <SoloFieldError name="subjectName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="gb-score">{t(locale, "gradebook", "scoreLabel")}</Label>
        <Input
          id="gb-score"
          type="number"
          min={0}
          max={100}
          {...register("score")}
        />
        <SoloFieldError name="score" />
      </div>
    </>
  );
}
export function OrganizationGradebookView() {
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
    queryKey: keys.list(ctx, { resource: "grades" }),
    queryFn: () => getGradebookClient().list(orgId),
    enabled: Boolean(sessionQuery.data),
  });
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );
  const columns = useMemo<ColumnDef<GradeEntry, unknown>[]>(
    () => [
      {
        accessorKey: "studentDisplayName",
        header: t(locale, "gradebook", "colStudent"),
      },
      {
        accessorKey: "subjectName",
        header: t(locale, "gradebook", "colSubject"),
      },
      { accessorKey: "score", header: t(locale, "gradebook", "colScore") },
    ],
    [locale],
  );
  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "gradebook", "loadError")} />
      </div>
    );
  if (!canManage.allowed)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "gradebook", "forbidden")} />
      </div>
    );
  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgId}
      orgName={orgQuery.data.name}
      active="gradebook"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "gradebook", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "gradebook", "subtitle")}
        </p>
      </header>
      <SoloForm
        schema={upsertGradeSchema}
        defaultValues={{ studentDisplayName: "", subjectName: "", score: 0 }}
        submitLabel={t(locale, "gradebook", "saveSubmit")}
        onSubmit={async (values) => {
          await getGradebookClient().upsert(orgId, values);
          pushFeedback({
            tone: "success",
            title: t(locale, "gradebook", "saveSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <Fields locale={locale} />
      </SoloForm>
      {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!listQuery.isLoading && (listQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "gradebook", "empty")} />
      ) : (
        <SoloDataTable
          data={listQuery.data?.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "gradebook", "empty")}
        />
      )}
    </OrgShell>
  );
}
