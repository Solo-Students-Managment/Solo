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
import { getShiftsClient, type StaffShift } from "@/services/shifts";

import { createShiftSchema, type CreateShiftValues } from "../schemas";

const keys = createQueryKeyFactory("shifts");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function ShiftFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateShiftValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="shift-name">{t(locale, "shifts", "nameLabel")}</Label>
        <Input id="shift-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="shift-day">{t(locale, "shifts", "weekdayLabel")}</Label>
        <select
          id="shift-day"
          className={selectClassName}
          {...register("weekday")}
        >
          {Array.from({ length: 7 }, (_, day) => (
            <option key={day} value={day}>
              {t(locale, "shifts", `weekday.${day}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="shift-start">{t(locale, "shifts", "startLabel")}</Label>
        <Input id="shift-start" type="time" {...register("startTime")} />
        <SoloFieldError name="startTime" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="shift-end">{t(locale, "shifts", "endLabel")}</Label>
        <Input id="shift-end" type="time" {...register("endTime")} />
        <SoloFieldError name="endTime" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="shift-branch">
          {t(locale, "shifts", "branchLabel")}
        </Label>
        <Input id="shift-branch" {...register("branchName")} />
        <SoloFieldError name="branchName" />
      </div>
    </>
  );
}

export function OrganizationShiftsView() {
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
  const shiftsQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getShiftsClient().list(orgId),
    enabled: canManage.allowed,
  });

  const columns = useMemo<ColumnDef<StaffShift, unknown>[]>(
    () => [
      { accessorKey: "name", header: t(locale, "shifts", "colName") },
      {
        id: "weekday",
        header: t(locale, "shifts", "colWeekday"),
        cell: ({ row }) =>
          t(locale, "shifts", `weekday.${row.original.weekday}`),
      },
      { accessorKey: "startTime", header: t(locale, "shifts", "colStart") },
      { accessorKey: "endTime", header: t(locale, "shifts", "colEnd") },
      {
        accessorKey: "branchName",
        header: t(locale, "shifts", "colBranch"),
      },
    ],
    [locale],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "shifts", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "shifts", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="shifts"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "shifts", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "shifts", "subtitle")}</p>
      </header>

      <SoloForm
        schema={createShiftSchema}
        defaultValues={{
          name: "",
          weekday: 1,
          startTime: "09:00",
          endTime: "17:00",
          branchName: "Main Branch",
        }}
        submitLabel={t(locale, "shifts", "createShift")}
        onSubmit={async (values: CreateShiftValues) => {
          await getShiftsClient().create(orgId, {
            name: values.name,
            weekday: values.weekday,
            startTime: values.startTime,
            endTime: values.endTime,
            branchName: values.branchName,
          });
          pushFeedback({
            tone: "success",
            title: t(locale, "shifts", "shiftSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <ShiftFields locale={locale} />
      </SoloForm>

      {shiftsQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!shiftsQuery.isLoading && (shiftsQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "shifts", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={shiftsQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "shifts", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
