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
import {
  getStaffAttendanceClient,
  nextExpectedClockEvent,
  type StaffClockEvent,
} from "@/services/staff-attendance";

import {
  createClockEventSchema,
  type CreateClockEventValues,
} from "../schemas";

const keys = createQueryKeyFactory("staff-attendance");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function ClockFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateClockEventValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="clk-staff">
          {t(locale, "staffAttendance", "staffLabel")}
        </Label>
        <Input id="clk-staff" {...register("staffDisplayName")} />
        <SoloFieldError name="staffDisplayName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="clk-type">
          {t(locale, "staffAttendance", "eventTypeLabel")}
        </Label>
        <select
          id="clk-type"
          className={selectClassName}
          {...register("eventType")}
        >
          <option value="clock_in">
            {t(locale, "staffAttendance", "event.clock_in")}
          </option>
          <option value="clock_out">
            {t(locale, "staffAttendance", "event.clock_out")}
          </option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="clk-branch">
          {t(locale, "staffAttendance", "branchLabel")}
        </Label>
        <Input id="clk-branch" {...register("branchName")} />
        <SoloFieldError name="branchName" />
      </div>
    </>
  );
}

export function OrganizationStaffAttendanceView() {
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
  const eventsQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getStaffAttendanceClient().list(orgId),
    enabled: canManage.allowed,
  });

  const suggested = nextExpectedClockEvent(eventsQuery.data?.data ?? []);

  const columns = useMemo<ColumnDef<StaffClockEvent, unknown>[]>(
    () => [
      {
        accessorKey: "staffDisplayName",
        header: t(locale, "staffAttendance", "colStaff"),
      },
      {
        id: "event",
        header: t(locale, "staffAttendance", "colEvent"),
        cell: ({ row }) =>
          t(locale, "staffAttendance", `event.${row.original.eventType}`),
      },
      {
        accessorKey: "recordedAt",
        header: t(locale, "staffAttendance", "colTime"),
      },
      {
        accessorKey: "branchName",
        header: t(locale, "staffAttendance", "colBranch"),
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
        <ErrorState title={t(locale, "staffAttendance", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "staffAttendance", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="staffAttendance"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "staffAttendance", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "staffAttendance", "subtitle")}
        </p>
      </header>

      <SoloForm
        schema={createClockEventSchema}
        defaultValues={{
          staffDisplayName: "",
          eventType: suggested,
          branchName: "Main Branch",
        }}
        submitLabel={t(locale, "staffAttendance", "createEvent")}
        onSubmit={async (values: CreateClockEventValues) => {
          await getStaffAttendanceClient().create(orgId, {
            staffDisplayName: values.staffDisplayName,
            eventType: values.eventType,
            branchName: values.branchName,
          });
          pushFeedback({
            tone: "success",
            title: t(locale, "staffAttendance", "eventSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <ClockFields locale={locale} />
      </SoloForm>

      {eventsQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!eventsQuery.isLoading && (eventsQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "staffAttendance", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={eventsQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "staffAttendance", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
