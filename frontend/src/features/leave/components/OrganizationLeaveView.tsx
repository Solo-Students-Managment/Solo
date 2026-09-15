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
import {
  canApproveLeave,
  getLeaveClient,
  type LeaveRequest,
} from "@/services/leave";

import { createLeaveSchema, type CreateLeaveValues } from "../schemas";

const keys = createQueryKeyFactory("leave");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function LeaveFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateLeaveValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="leave-staff">{t(locale, "leave", "staffLabel")}</Label>
        <Input id="leave-staff" {...register("staffDisplayName")} />
        <SoloFieldError name="staffDisplayName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="leave-type">{t(locale, "leave", "typeLabel")}</Label>
        <select
          id="leave-type"
          className={selectClassName}
          {...register("leaveType")}
        >
          {(["annual", "sick", "unpaid", "other"] as const).map((type) => (
            <option key={type} value={type}>
              {t(locale, "leave", `type.${type}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="leave-start">{t(locale, "leave", "startLabel")}</Label>
        <Input id="leave-start" type="date" {...register("startDate")} />
        <SoloFieldError name="startDate" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="leave-end">{t(locale, "leave", "endLabel")}</Label>
        <Input id="leave-end" type="date" {...register("endDate")} />
        <SoloFieldError name="endDate" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="leave-reason">
          {t(locale, "leave", "reasonLabel")}
        </Label>
        <Input id="leave-reason" {...register("reason")} />
        <SoloFieldError name="reason" />
      </div>
    </>
  );
}

export function OrganizationLeaveView() {
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
  const leaveQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getLeaveClient().list(orgId),
    enabled: canManage.allowed,
  });

  const columns = useMemo<ColumnDef<LeaveRequest, unknown>[]>(
    () => [
      {
        accessorKey: "staffDisplayName",
        header: t(locale, "leave", "colStaff"),
      },
      {
        id: "type",
        header: t(locale, "leave", "colType"),
        cell: ({ row }) => t(locale, "leave", `type.${row.original.leaveType}`),
      },
      {
        id: "status",
        header: t(locale, "leave", "colStatus"),
        cell: ({ row }) => t(locale, "leave", `status.${row.original.status}`),
      },
      { accessorKey: "startDate", header: t(locale, "leave", "colStart") },
      { accessorKey: "endDate", header: t(locale, "leave", "colEnd") },
      {
        id: "actions",
        header: t(locale, "leave", "colActions"),
        cell: ({ row }) =>
          canApproveLeave(row.original.status) ? (
            <Button
              type="button"
              className="min-h-11"
              onClick={async () => {
                await getLeaveClient().approve(orgId, String(row.original.id));
                pushFeedback({
                  tone: "success",
                  title: t(locale, "leave", "approveSuccess"),
                });
                await queryClient.invalidateQueries({
                  queryKey: keys.all({
                    personaId: sessionQuery.data?.userId,
                    organizationId: orgId,
                    subjectId: null,
                  }),
                });
              }}
            >
              {t(locale, "leave", "approve")}
            </Button>
          ) : (
            "—"
          ),
      },
    ],
    [locale, orgId, queryClient, sessionQuery.data?.userId],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "leave", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "leave", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="leave"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "leave", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "leave", "subtitle")}</p>
      </header>

      <SoloForm
        schema={createLeaveSchema}
        defaultValues={{
          staffDisplayName: "",
          leaveType: "annual",
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date().toISOString().slice(0, 10),
          reason: "",
        }}
        submitLabel={t(locale, "leave", "createLeave")}
        onSubmit={async (values: CreateLeaveValues) => {
          await getLeaveClient().create(orgId, {
            staffDisplayName: values.staffDisplayName,
            leaveType: values.leaveType,
            startDate: values.startDate,
            endDate: values.endDate,
            reason: values.reason,
          });
          pushFeedback({
            tone: "success",
            title: t(locale, "leave", "leaveSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <LeaveFields locale={locale} />
      </SoloForm>

      {leaveQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!leaveQuery.isLoading && (leaveQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "leave", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={leaveQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "leave", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
