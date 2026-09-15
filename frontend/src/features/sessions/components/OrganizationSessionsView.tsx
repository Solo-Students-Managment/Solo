"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
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
import { routes } from "@/lib/routes";
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";
import { getSessionsClient, type ClassSession } from "@/services/sessions";

import { createSessionSchema, type CreateSessionValues } from "../schemas";

const sessionsQueryKeys = createQueryKeyFactory("sessions");

function Fields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateSessionValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="ses-class">{t(locale, "sessions", "classLabel")}</Label>
        <Input id="ses-class" {...register("className")} />
        <SoloFieldError name="className" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ses-starts">
          {t(locale, "sessions", "startsLabel")}
        </Label>
        <Input
          id="ses-starts"
          type="datetime-local"
          {...register("startsAt")}
        />
        <SoloFieldError name="startsAt" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ses-ends">{t(locale, "sessions", "endsLabel")}</Label>
        <Input id="ses-ends" type="datetime-local" {...register("endsAt")} />
        <SoloFieldError name="endsAt" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ses-recurrence">
          {t(locale, "sessions", "recurrenceLabel")}
        </Label>
        <Input id="ses-recurrence" {...register("recurrenceLabel")} />
      </div>
    </>
  );
}

export function OrganizationSessionsView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const langQuery = locale === "en" ? "?lang=en" : "?lang=fa";

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
    queryKey: sessionsQueryKeys.list(ctx, { scope: "all" }),
    queryFn: () => getSessionsClient().list(orgId),
    enabled: Boolean(sessionQuery.data),
  });

  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );

  const columns = useMemo<ColumnDef<ClassSession, unknown>[]>(
    () => [
      {
        accessorKey: "className",
        header: t(locale, "sessions", "colClass"),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.className}</p>
            {row.original.conflictWarning ? (
              <p className="text-danger text-xs">
                {row.original.conflictWarning}
              </p>
            ) : null}
            {row.original.recurrenceLabel ? (
              <p className="text-muted text-xs">
                {row.original.recurrenceLabel}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: "when",
        header: t(locale, "sessions", "colWhen"),
        cell: ({ row }) => (
          <span className="text-xs">
            {row.original.startsAt} → {row.original.endsAt}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: t(locale, "sessions", "colStatus"),
      },
      {
        id: "open",
        header: "",
        cell: ({ row }) => (
          <Link
            className="text-brand text-sm underline"
            href={`${routes.organization.session(orgId, row.original.id)}${langQuery}`}
          >
            {t(locale, "sessions", "openDetail")}
          </Link>
        ),
      },
    ],
    [locale, orgId, langQuery],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "sessions", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "sessions", "forbidden")} />
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
      active="sessions"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "sessions", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "sessions", "subtitle")}
        </p>
      </header>

      <SoloForm
        schema={createSessionSchema}
        defaultValues={{
          className: "",
          startsAt: "",
          endsAt: "",
          recurrenceLabel: "Weekly",
        }}
        submitLabel={t(locale, "sessions", "createSubmit")}
        onSubmit={async (values) => {
          await getSessionsClient().create(orgId, {
            classId: `cls_${values.className.toLowerCase().replace(/\s+/g, "_")}`,
            className: values.className,
            startsAt: new Date(values.startsAt).toISOString(),
            endsAt: new Date(values.endsAt).toISOString(),
            recurrenceLabel: values.recurrenceLabel,
          });
          pushFeedback({
            tone: "success",
            title: t(locale, "sessions", "createSuccess"),
          });
          await queryClient.invalidateQueries({
            queryKey: sessionsQueryKeys.all(ctx),
          });
        }}
      >
        <Fields locale={locale} />
      </SoloForm>

      {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!listQuery.isLoading && rows.length === 0 ? (
        <EmptyState title={t(locale, "sessions", "empty")} />
      ) : (
        <SoloDataTable
          data={rows}
          columns={columns}
          emptyLabel={t(locale, "sessions", "empty")}
        />
      )}
    </OrgShell>
  );
}
