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
import { getAssignmentsClient, type Assignment } from "@/services/assignments";
import {
  createAssignmentSchema,
  type CreateAssignmentValues,
} from "../schemas";

const keys = createQueryKeyFactory("assignments");

function Fields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateAssignmentValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="asg-title">
          {t(locale, "assignments", "titleLabel")}
        </Label>
        <Input id="asg-title" {...register("title")} />
        <SoloFieldError name="title" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asg-type">
          {t(locale, "assignments", "typeLabel")}
        </Label>
        <select
          id="asg-type"
          className="border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm"
          {...register("type")}
        >
          {(
            [
              "homework",
              "project",
              "essay",
              "presentation",
              "research",
              "practice",
              "custom",
            ] as const
          ).map((type) => (
            <option key={type} value={type}>
              {t(locale, "assignments", `type.${type}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asg-due">{t(locale, "assignments", "dueLabel")}</Label>
        <Input id="asg-due" type="datetime-local" {...register("dueAt")} />
        <SoloFieldError name="dueAt" />
      </div>
    </>
  );
}

export function OrganizationAssignmentsView() {
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
    queryKey: keys.list(ctx, { resource: "assignments" }),
    queryFn: () => getAssignmentsClient().list(orgId),
    enabled: Boolean(sessionQuery.data),
  });
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );
  const columns = useMemo<ColumnDef<Assignment, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "assignments", "colTitle") },
      {
        accessorKey: "type",
        header: t(locale, "assignments", "colType"),
        cell: ({ row }) =>
          t(locale, "assignments", `type.${row.original.type}`),
      },
      { accessorKey: "dueAt", header: t(locale, "assignments", "colDue") },
      {
        accessorKey: "submissionsCount",
        header: t(locale, "assignments", "colSubmissions"),
      },
    ],
    [locale],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "assignments", "loadError")} />
      </div>
    );
  if (!canManage.allowed)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "assignments", "forbidden")} />
      </div>
    );

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgId}
      orgName={orgQuery.data.name}
      active="assignments"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "assignments", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "assignments", "subtitle")}
        </p>
      </header>
      <SoloForm
        schema={createAssignmentSchema}
        defaultValues={{ title: "", type: "homework", dueAt: "" }}
        submitLabel={t(locale, "assignments", "createSubmit")}
        onSubmit={async (values: CreateAssignmentValues) => {
          await getAssignmentsClient().create(orgId, {
            title: values.title,
            type: values.type,
            dueAt: new Date(values.dueAt).toISOString(),
          });
          pushFeedback({
            tone: "success",
            title: t(locale, "assignments", "createSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <Fields locale={locale} />
      </SoloForm>
      {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!listQuery.isLoading && (listQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "assignments", "empty")} />
      ) : (
        <SoloDataTable
          data={listQuery.data?.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "assignments", "empty")}
        />
      )}
    </OrgShell>
  );
}
