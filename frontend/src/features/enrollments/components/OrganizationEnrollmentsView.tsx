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
import {
  getEnrollmentsClient,
  type Enrollment,
  type EnrollmentStatus,
} from "@/services/enrollments";
import { getOrganizationClient } from "@/services/organization";

import {
  createEnrollmentSchema,
  type CreateEnrollmentValues,
} from "../schemas";

const enrollmentsQueryKeys = createQueryKeyFactory("enrollments");

const STATUSES: EnrollmentStatus[] = [
  "active",
  "completed",
  "withdrawn",
  "failed",
  "transferred",
];

function Fields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateEnrollmentValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="enr-student">
          {t(locale, "enrollments", "studentLabel")}
        </Label>
        <Input id="enr-student" {...register("studentDisplayName")} />
        <SoloFieldError name="studentDisplayName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="enr-course">
          {t(locale, "enrollments", "courseLabel")}
        </Label>
        <Input id="enr-course" {...register("courseName")} />
        <SoloFieldError name="courseName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="enr-class">
          {t(locale, "enrollments", "classLabel")}
        </Label>
        <Input id="enr-class" {...register("className")} />
        <SoloFieldError name="className" />
      </div>
    </>
  );
}

export function OrganizationEnrollmentsView() {
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
    queryKey: enrollmentsQueryKeys.list(ctx, { scope: "all" }),
    queryFn: () => getEnrollmentsClient().list(orgId),
    enabled: Boolean(sessionQuery.data),
  });

  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );

  const columns = useMemo<ColumnDef<Enrollment, unknown>[]>(
    () => [
      {
        accessorKey: "studentDisplayName",
        header: t(locale, "enrollments", "colStudent"),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.studentDisplayName}</p>
            <p className="text-muted text-xs">{row.original.courseName}</p>
          </div>
        ),
      },
      {
        accessorKey: "className",
        header: t(locale, "enrollments", "colClass"),
      },
      {
        accessorKey: "status",
        header: t(locale, "enrollments", "colStatus"),
        cell: ({ row }) => (
          <select
            aria-label={`${t(locale, "enrollments", "colStatus")}: ${row.original.studentDisplayName}`}
            className="border-border bg-elevated h-9 rounded-md border px-2 text-sm"
            value={row.original.status}
            disabled={row.original.status === "completed"}
            onChange={(event) => {
              const status = event.target.value as EnrollmentStatus;
              void (async () => {
                await getEnrollmentsClient().updateStatus(
                  orgId,
                  row.original.id,
                  status,
                );
                pushFeedback({
                  tone: "success",
                  title: t(locale, "enrollments", "statusUpdated"),
                });
                await queryClient.invalidateQueries({
                  queryKey: enrollmentsQueryKeys.all(ctx),
                });
              })();
            }}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(locale, "enrollments", `status.${status}`)}
              </option>
            ))}
          </select>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, orgId],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "enrollments", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "enrollments", "forbidden")} />
      </div>
    );
  }

  const rows = listQuery.data?.data ?? [];

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgId}
      orgName={orgQuery.data.name}
      active="enrollments"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "enrollments", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "enrollments", "subtitle")}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-medium">
          {t(locale, "enrollments", "createTitle")}
        </h2>
        <SoloForm
          schema={createEnrollmentSchema}
          defaultValues={{
            studentDisplayName: "",
            className: "",
            courseName: "",
          }}
          submitLabel={t(locale, "enrollments", "createSubmit")}
          onSubmit={async (values) => {
            await getEnrollmentsClient().create(orgId, {
              studentId: `stu_${values.studentDisplayName.toLowerCase().replace(/\s+/g, "_")}`,
              studentDisplayName: values.studentDisplayName,
              classId: `cls_${values.className.toLowerCase().replace(/\s+/g, "_")}`,
              className: values.className,
              courseName: values.courseName,
            });
            pushFeedback({
              tone: "success",
              title: t(locale, "enrollments", "createSuccess"),
            });
            await queryClient.invalidateQueries({
              queryKey: enrollmentsQueryKeys.all(ctx),
            });
          }}
        >
          <Fields locale={locale} />
        </SoloForm>
      </section>

      {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!listQuery.isLoading && rows.length === 0 ? (
        <EmptyState title={t(locale, "enrollments", "empty")} />
      ) : (
        <SoloDataTable
          data={rows}
          columns={columns}
          emptyLabel={t(locale, "enrollments", "empty")}
        />
      )}
    </OrgShell>
  );
}
