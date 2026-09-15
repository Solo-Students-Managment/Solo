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
import { getTuitionClient, type TuitionRecord } from "@/services/tuition";
import { recordTuitionSchema, type RecordTuitionValues } from "../schemas";

const keys = createQueryKeyFactory("tuition");

function Fields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<RecordTuitionValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="tui-student">
          {t(locale, "tuition", "studentLabel")}
        </Label>
        <Input id="tui-student" {...register("studentDisplayName")} />
        <SoloFieldError name="studentDisplayName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tui-amount">
          {t(locale, "tuition", "amountLabel")}
        </Label>
        <Input
          id="tui-amount"
          type="number"
          min={0}
          {...register("amountMinor")}
        />
        <SoloFieldError name="amountMinor" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tui-due">{t(locale, "tuition", "dueLabel")}</Label>
        <Input id="tui-due" type="date" {...register("dueAt")} />
        <SoloFieldError name="dueAt" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tui-status">
          {t(locale, "tuition", "statusLabel")}
        </Label>
        <select
          id="tui-status"
          className="border-border bg-elevated w-full rounded-md border px-3 py-2 text-sm"
          {...register("status")}
        >
          {(["due", "partial", "paid", "waived"] as const).map((status) => (
            <option key={status} value={status}>
              {t(locale, "tuition", `status.${status}`)}
            </option>
          ))}
        </select>
        <SoloFieldError name="status" />
      </div>
    </>
  );
}

export function OrganizationTuitionView() {
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
    queryKey: keys.list(ctx, { resource: "records" }),
    queryFn: () => getTuitionClient().list(orgId),
    enabled: Boolean(sessionQuery.data),
  });
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );
  const columns = useMemo<ColumnDef<TuitionRecord, unknown>[]>(
    () => [
      {
        accessorKey: "studentDisplayName",
        header: t(locale, "tuition", "colStudent"),
      },
      { accessorKey: "amountMinor", header: t(locale, "tuition", "colAmount") },
      {
        accessorKey: "status",
        header: t(locale, "tuition", "colStatus"),
        cell: ({ row }) =>
          t(locale, "tuition", `status.${row.original.status}`),
      },
      { accessorKey: "dueAt", header: t(locale, "tuition", "colDue") },
    ],
    [locale],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "tuition", "loadError")} />
      </div>
    );
  if (!canManage.allowed)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "tuition", "forbidden")} />
      </div>
    );

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgId}
      orgName={orgQuery.data.name}
      active="tuition"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "tuition", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "tuition", "subtitle")}</p>
      </header>
      <SoloForm
        schema={recordTuitionSchema}
        defaultValues={{
          studentDisplayName: "",
          amountMinor: 0,
          dueAt: "",
          status: "due",
        }}
        submitLabel={t(locale, "tuition", "saveSubmit")}
        onSubmit={async (values: RecordTuitionValues) => {
          await getTuitionClient().record(orgId, values);
          pushFeedback({
            tone: "success",
            title: t(locale, "tuition", "saveSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <Fields locale={locale} />
      </SoloForm>
      {!listQuery.isLoading && (listQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "tuition", "empty")} />
      ) : (
        <SoloDataTable
          data={listQuery.data?.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "tuition", "empty")}
        />
      )}
    </OrgShell>
  );
}
