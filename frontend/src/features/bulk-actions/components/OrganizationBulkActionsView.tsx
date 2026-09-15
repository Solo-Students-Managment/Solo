"use client";

import { useMemo, useState } from "react";
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
  getBulkActionsClient,
  requiresBulkApproval,
  type BulkJob,
} from "@/services/bulk-actions";
import { createBulkJobSchema, type CreateBulkJobValues } from "../schemas";

const keys = createQueryKeyFactory("bulk-actions");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function BulkJobFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreateBulkJobValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="bulk-module">
          {t(locale, "bulkActions", "moduleKeyLabel")}
        </Label>
        <Input id="bulk-module" {...register("moduleKey")} />
        <SoloFieldError name="moduleKey" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bulk-action">
          {t(locale, "bulkActions", "actionKeyLabel")}
        </Label>
        <select
          id="bulk-action"
          className={selectClassName}
          {...register("actionKey")}
        >
          <option value="tag">{t(locale, "bulkActions", "action.tag")}</option>
          <option value="update">
            {t(locale, "bulkActions", "action.update")}
          </option>
          <option value="archive">
            {t(locale, "bulkActions", "action.archive")}
          </option>
          <option value="delete">
            {t(locale, "bulkActions", "action.delete")}
          </option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bulk-count">
          {t(locale, "bulkActions", "itemCountLabel")}
        </Label>
        <Input
          id="bulk-count"
          type="number"
          min={1}
          {...register("itemCount")}
        />
        <SoloFieldError name="itemCount" />
      </div>
    </>
  );
}

function RunRowActions({
  job,
  locale,
  onRun,
}: {
  job: BulkJob;
  locale: ReturnType<typeof resolveLocale>;
  onRun: (approvalGranted: boolean) => Promise<void>;
}) {
  const [approvalGranted, setApprovalGranted] = useState(false);
  const needsApproval = job.requiresApproval;

  if (job.status === "completed") {
    return (
      <span className="text-muted text-sm">
        {t(locale, "bulkActions", "status.completed")}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {needsApproval ? (
        <>
          <p className="text-warning text-xs">
            {t(locale, "bulkActions", "approvalHint")}
          </p>
          <div className="flex min-h-11 items-center gap-2">
            <input
              id={`bulk-approval-${String(job.id)}`}
              type="checkbox"
              className="size-4"
              checked={approvalGranted}
              onChange={(event) => setApprovalGranted(event.target.checked)}
            />
            <Label htmlFor={`bulk-approval-${String(job.id)}`}>
              {t(locale, "bulkActions", "approvalGrantedLabel")}
            </Label>
          </div>
        </>
      ) : null}
      <Button
        type="button"
        className="min-h-11"
        disabled={needsApproval && !approvalGranted}
        onClick={() => void onRun(approvalGranted)}
      >
        {t(locale, "bulkActions", "run")}
      </Button>
    </div>
  );
}

export function OrganizationBulkActionsView() {
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
  const listQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getBulkActionsClient().list(orgId),
    enabled: canManage.allowed,
  });

  async function runJob(job: BulkJob, approvalGranted: boolean) {
    try {
      await getBulkActionsClient().run(orgId, String(job.id), {
        approvalGranted: job.requiresApproval ? approvalGranted : undefined,
      });
      pushFeedback({
        tone: "success",
        title: t(locale, "bulkActions", "runSuccess"),
      });
      await queryClient.refetchQueries({ queryKey: keys.lists(ctx) });
    } catch {
      pushFeedback({
        tone: "error",
        title: t(locale, "bulkActions", "approvalRequired"),
      });
    }
  }

  const columns = useMemo<ColumnDef<BulkJob, unknown>[]>(
    () => [
      {
        accessorKey: "moduleKey",
        header: t(locale, "bulkActions", "colModule"),
      },
      {
        id: "action",
        header: t(locale, "bulkActions", "colAction"),
        cell: ({ row }) =>
          t(locale, "bulkActions", `action.${row.original.actionKey}`),
      },
      {
        accessorKey: "itemCount",
        header: t(locale, "bulkActions", "colCount"),
      },
      {
        id: "status",
        header: t(locale, "bulkActions", "colStatus"),
        cell: ({ row }) =>
          t(locale, "bulkActions", `status.${row.original.status}`),
      },
      {
        id: "actions",
        header: t(locale, "bulkActions", "colActions"),
        cell: ({ row }) => (
          <RunRowActions
            job={row.original}
            locale={locale}
            onRun={(approvalGranted) => runJob(row.original, approvalGranted)}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, orgId, sessionQuery.data?.userId],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "bulkActions", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "bulkActions", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="bulkActions"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "bulkActions", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "bulkActions", "subtitle")}
        </p>
      </header>

      <SoloForm
        schema={createBulkJobSchema}
        defaultValues={{
          moduleKey: "students",
          actionKey: "tag",
          itemCount: 3,
        }}
        submitLabel={t(locale, "bulkActions", "createJob")}
        onSubmit={async (values: CreateBulkJobValues) => {
          await getBulkActionsClient().create(orgId, values);
          const needsApproval = requiresBulkApproval(
            values.itemCount,
            values.actionKey,
          );
          pushFeedback({
            tone: needsApproval ? "info" : "success",
            title: needsApproval
              ? t(locale, "bulkActions", "createApprovalRequired")
              : t(locale, "bulkActions", "createSuccess"),
          });
          await queryClient.refetchQueries({ queryKey: keys.lists(ctx) });
        }}
      >
        <BulkJobFields locale={locale} />
      </SoloForm>

      {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!listQuery.isLoading && (listQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "bulkActions", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={listQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "bulkActions", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
