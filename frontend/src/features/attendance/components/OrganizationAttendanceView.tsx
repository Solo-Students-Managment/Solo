"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

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
import { attendanceStatusSchema, getSessionsClient } from "@/services/sessions";

const attendanceQueryKeys = createQueryKeyFactory("attendance");

const markSchema = z.object({
  studentDisplayName: z.string().trim().min(1, "attendance.validation.student"),
  status: attendanceStatusSchema,
});

type MarkValues = z.infer<typeof markSchema>;

function Fields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<MarkValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="att-student">
          {t(locale, "attendance", "studentLabel")}
        </Label>
        <Input id="att-student" {...register("studentDisplayName")} />
        <SoloFieldError name="studentDisplayName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="att-status">
          {t(locale, "attendance", "statusLabel")}
        </Label>
        <select
          id="att-status"
          className="border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm"
          {...register("status")}
        >
          {(["present", "absent", "late", "excused"] as const).map((status) => (
            <option key={status} value={status}>
              {t(locale, "attendance", `status.${status}`)}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

export function OrganizationAttendanceView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState("");

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
  const reportQuery = useQuery({
    queryKey: attendanceQueryKeys.detail(ctx, sessionId || "none"),
    queryFn: () => getSessionsClient().listAttendance(orgId, sessionId),
    enabled: Boolean(sessionQuery.data && sessionId),
  });

  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "attendance", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "attendance", "forbidden")} />
      </div>
    );
  }

  const report = reportQuery.data;

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgId}
      orgName={orgQuery.data.name}
      active="attendance"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "attendance", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "attendance", "subtitle")}
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="att-session">
            {t(locale, "attendance", "sessionLabel")}
          </Label>
          <Input
            id="att-session"
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void reportQuery.refetch()}
          disabled={!sessionId}
        >
          {t(locale, "attendance", "loadSession")}
        </Button>
      </div>

      {sessionId ? (
        <SoloForm
          schema={markSchema}
          defaultValues={{ studentDisplayName: "", status: "present" }}
          submitLabel={t(locale, "attendance", "markSubmit")}
          onSubmit={async (values) => {
            await getSessionsClient().setAttendance(orgId, sessionId, {
              studentId: `stu_${values.studentDisplayName.toLowerCase().replace(/\s+/g, "_")}`,
              studentDisplayName: values.studentDisplayName,
              status: attendanceStatusSchema.parse(values.status),
            });
            pushFeedback({
              tone: "success",
              title: t(locale, "attendance", "markSuccess"),
            });
            await queryClient.invalidateQueries({
              queryKey: attendanceQueryKeys.all(ctx),
            });
          }}
        >
          <Fields locale={locale} />
        </SoloForm>
      ) : null}

      {report ? (
        <>
          <dl className="grid gap-4 sm:grid-cols-4">
            <div>
              <dt className="text-muted text-xs">
                {t(locale, "attendance", "statsPresent")}
              </dt>
              <dd className="font-display text-2xl">{report.present}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">
                {t(locale, "attendance", "statsAbsent")}
              </dt>
              <dd className="font-display text-2xl">{report.absent}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">
                {t(locale, "attendance", "statsLate")}
              </dt>
              <dd className="font-display text-2xl">{report.late}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">
                {t(locale, "attendance", "statsExcused")}
              </dt>
              <dd className="font-display text-2xl">{report.excused}</dd>
            </div>
          </dl>
          {report.records.length === 0 ? (
            <EmptyState title={t(locale, "attendance", "empty")} />
          ) : (
            <ul className="space-y-2">
              {report.records.map((record) => (
                <li
                  key={record.id}
                  className="border-border rounded-md border p-3"
                >
                  <p className="font-medium">{record.studentDisplayName}</p>
                  <p className="text-muted text-xs">
                    {t(locale, "attendance", `status.${record.status}`)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </OrgShell>
  );
}
