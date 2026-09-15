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
import { getSubjectClient, type Subject } from "@/services/subjects";

import { createSubjectSchema, type CreateSubjectValues } from "../schemas";

const subjectsQueryKeys = createQueryKeyFactory("subjects");

function CreateFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreateSubjectValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="subject-name">
          {t(locale, "subjects", "nameLabel")}
        </Label>
        <Input id="subject-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="subject-code">
          {t(locale, "subjects", "codeLabel")}
        </Label>
        <Input id="subject-code" {...register("code")} />
        <SoloFieldError name="code" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="subject-level">
          {t(locale, "subjects", "levelLabel")}
        </Label>
        <Input id="subject-level" {...register("levelLabel")} />
        <SoloFieldError name="levelLabel" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="subject-teacher">
          {t(locale, "subjects", "teacherLabel")}
        </Label>
        <Input id="subject-teacher" {...register("teacherDisplayName")} />
        <SoloFieldError name="teacherDisplayName" />
      </div>
    </>
  );
}

export function OrganizationSubjectsView() {
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
  const subjectsQuery = useQuery({
    queryKey: subjectsQueryKeys.list(ctx, { scope: "org" }),
    queryFn: () => getSubjectClient().list(orgId),
    enabled: Boolean(sessionQuery.data),
  });

  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );

  const columns = useMemo<ColumnDef<Subject, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: t(locale, "subjects", "colName"),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-muted text-xs">
              {row.original.code} · {row.original.levelLabel}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "teacherDisplayName",
        header: t(locale, "subjects", "colTeacher"),
      },
      {
        accessorKey: "active",
        header: t(locale, "subjects", "colStatus"),
        cell: ({ row }) =>
          row.original.active
            ? t(locale, "subjects", "statusActive")
            : t(locale, "subjects", "statusInactive"),
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
        <ErrorState title={t(locale, "subjects", "loadError")} />
      </div>
    );
  }

  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "subjects", "forbidden")} />
      </div>
    );
  }

  const org = orgQuery.data;
  const rows = subjectsQuery.data?.data ?? [];

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={org.id}
      orgName={org.name}
      active="subjects"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "subjects", "manageTitle")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "subjects", "manageSubtitle")}
        </p>
      </header>

      <section className="space-y-3" aria-labelledby="create-subject">
        <h2 id="create-subject" className="font-display text-xl font-medium">
          {t(locale, "subjects", "createTitle")}
        </h2>
        <SoloForm
          schema={createSubjectSchema}
          defaultValues={{
            name: "",
            code: "",
            levelLabel: "",
            teacherDisplayName: "",
          }}
          submitLabel={t(locale, "subjects", "createSubmit")}
          onSubmit={async (values) => {
            await getSubjectClient().create(org.id, values);
            pushFeedback({
              tone: "success",
              title: t(locale, "subjects", "createSuccess"),
            });
            await queryClient.invalidateQueries({
              queryKey: subjectsQueryKeys.all(ctx),
            });
          }}
        >
          <CreateFields locale={locale} />
        </SoloForm>
      </section>

      <section className="space-y-3" aria-labelledby="subjects-list">
        <h2 id="subjects-list" className="font-display text-xl font-medium">
          {t(locale, "subjects", "listTitle")}
        </h2>
        {subjectsQuery.isLoading ? <Skeleton className="h-24" /> : null}
        {subjectsQuery.isError ? (
          <ErrorState title={t(locale, "subjects", "loadError")} />
        ) : null}
        {!subjectsQuery.isLoading && rows.length === 0 ? (
          <EmptyState title={t(locale, "subjects", "empty")} />
        ) : (
          <SoloDataTable
            data={rows}
            columns={columns}
            emptyLabel={t(locale, "subjects", "empty")}
          />
        )}
      </section>
    </OrgShell>
  );
}
