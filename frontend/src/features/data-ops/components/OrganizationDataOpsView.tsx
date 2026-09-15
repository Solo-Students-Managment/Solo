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
  getDataOpsClient,
  isTerminalDataJobStatus,
  type DataJob,
} from "@/services/data-ops";
import { createDataJobSchema, type CreateDataJobValues } from "../schemas";

const keys = createQueryKeyFactory("data-ops");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function DataJobFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreateDataJobValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="djob-type">
          {t(locale, "dataOps", "jobTypeLabel")}
        </Label>
        <select
          id="djob-type"
          className={selectClassName}
          {...register("jobType")}
        >
          <option value="import">
            {t(locale, "dataOps", "jobType.import")}
          </option>
          <option value="export">
            {t(locale, "dataOps", "jobType.export")}
          </option>
          <option value="backup">
            {t(locale, "dataOps", "jobType.backup")}
          </option>
          <option value="restore">
            {t(locale, "dataOps", "jobType.restore")}
          </option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="djob-resource">
          {t(locale, "dataOps", "resourceKeyLabel")}
        </Label>
        <Input id="djob-resource" {...register("resourceKey")} />
        <SoloFieldError name="resourceKey" />
      </div>
    </>
  );
}

export function OrganizationDataOpsView() {
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
    queryFn: () => getDataOpsClient().list(orgId),
    enabled: canManage.allowed,
  });

  async function advanceJob(job: DataJob) {
    if (isTerminalDataJobStatus(job.status)) {
      pushFeedback({
        tone: "warning",
        title: t(locale, "dataOps", "terminalStatus"),
      });
      return;
    }
    await getDataOpsClient().advance(orgId, String(job.id));
    pushFeedback({
      tone: "success",
      title: t(locale, "dataOps", "advanceSuccess"),
    });
    await queryClient.refetchQueries({ queryKey: keys.lists(ctx) });
  }

  const columns = useMemo<ColumnDef<DataJob, unknown>[]>(
    () => [
      {
        id: "jobType",
        header: t(locale, "dataOps", "colJobType"),
        cell: ({ row }) =>
          t(locale, "dataOps", `jobType.${row.original.jobType}`),
      },
      {
        accessorKey: "resourceKey",
        header: t(locale, "dataOps", "colResource"),
      },
      {
        id: "status",
        header: t(locale, "dataOps", "colStatus"),
        cell: ({ row }) =>
          t(locale, "dataOps", `status.${row.original.status}`),
      },
      {
        id: "actions",
        header: t(locale, "dataOps", "colActions"),
        cell: ({ row }) => {
          const job = row.original;
          if (isTerminalDataJobStatus(job.status)) return null;
          return (
            <Button
              type="button"
              className="min-h-11"
              onClick={() => void advanceJob(job)}
            >
              {t(locale, "dataOps", "advance")}
            </Button>
          );
        },
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
        <ErrorState title={t(locale, "dataOps", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "dataOps", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="dataOps"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "dataOps", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "dataOps", "subtitle")}</p>
      </header>

      <SoloForm
        schema={createDataJobSchema}
        defaultValues={{ jobType: "export", resourceKey: "" }}
        submitLabel={t(locale, "dataOps", "createJob")}
        onSubmit={async (values: CreateDataJobValues) => {
          await getDataOpsClient().create(orgId, values);
          pushFeedback({
            tone: "success",
            title: t(locale, "dataOps", "createSuccess"),
          });
          await queryClient.refetchQueries({ queryKey: keys.lists(ctx) });
        }}
      >
        <DataJobFields locale={locale} />
      </SoloForm>

      {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!listQuery.isLoading && (listQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "dataOps", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={listQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "dataOps", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
