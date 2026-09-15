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
  canViewPrivatePipeline,
  getCrmClient,
  type Deal,
  type Pipeline,
} from "@/services/crm";
import {
  createDealSchema,
  createPipelineSchema,
  type CreateDealValues,
  type CreatePipelineValues,
} from "../schemas";

const pipelineKeys = createQueryKeyFactory("crm-pipelines");
const dealKeys = createQueryKeyFactory("crm-deals");

function PipelineFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreatePipelineValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="pip-name">
          {t(locale, "crm", "pipelineNameLabel")}
        </Label>
        <Input id="pip-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pip-stages">
          {t(locale, "crm", "stageLabelsLabel")}
        </Label>
        <Input id="pip-stages" {...register("stageLabels")} />
        <SoloFieldError name="stageLabels" />
      </div>
      <div className="flex min-h-11 items-center gap-2">
        <input
          id="pip-private"
          type="checkbox"
          className="size-4"
          {...register("isPrivate")}
        />
        <Label htmlFor="pip-private">
          {t(locale, "crm", "privatePipelineLabel")}
        </Label>
      </div>
    </>
  );
}

function DealFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateDealValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="deal-title">{t(locale, "crm", "dealTitleLabel")}</Label>
        <Input id="deal-title" {...register("title")} />
        <SoloFieldError name="title" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="deal-pipeline">
          {t(locale, "crm", "pipelineNameLabel")}
        </Label>
        <Input id="deal-pipeline" {...register("pipelineName")} />
        <SoloFieldError name="pipelineName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="deal-stage">{t(locale, "crm", "stageLabel")}</Label>
        <Input id="deal-stage" {...register("stage")} />
        <SoloFieldError name="stage" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="deal-value">{t(locale, "crm", "valueLabel")}</Label>
        <Input
          id="deal-value"
          type="number"
          min={0}
          {...register("valueMinor")}
        />
        <SoloFieldError name="valueMinor" />
      </div>
    </>
  );
}

function parseStageLabels(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function OrganizationCrmView() {
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
  const pipelineQuery = useQuery({
    queryKey: pipelineKeys.list(ctx, {}),
    queryFn: () => getCrmClient().listPipelines(orgId),
    enabled: canManage.allowed,
  });
  const dealQuery = useQuery({
    queryKey: dealKeys.list(ctx, {}),
    queryFn: () => getCrmClient().listDeals(orgId),
    enabled: canManage.allowed,
  });

  const visiblePipelines = useMemo(
    () =>
      (pipelineQuery.data?.data ?? []).filter((row) =>
        canViewPrivatePipeline(row.isPrivate, canManage.allowed),
      ),
    [pipelineQuery.data?.data, canManage.allowed],
  );

  const pipelineColumns = useMemo<ColumnDef<Pipeline, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: t(locale, "crm", "colPipeline"),
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-2">
            {row.original.isPrivate ? (
              <span aria-label={t(locale, "crm", "privateLock")}>🔒</span>
            ) : null}
            {row.original.name}
          </span>
        ),
      },
      {
        id: "stages",
        header: t(locale, "crm", "colStages"),
        cell: ({ row }) => row.original.stageLabels.join(", "),
      },
      {
        id: "visibility",
        header: t(locale, "crm", "colVisibility"),
        cell: ({ row }) =>
          row.original.isPrivate
            ? t(locale, "crm", "visibility.private")
            : t(locale, "crm", "visibility.public"),
      },
    ],
    [locale],
  );

  const dealColumns = useMemo<ColumnDef<Deal, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "crm", "colDeal") },
      { accessorKey: "pipelineName", header: t(locale, "crm", "colPipeline") },
      { accessorKey: "stage", header: t(locale, "crm", "colStage") },
      {
        accessorKey: "valueMinor",
        header: t(locale, "crm", "colValue"),
        cell: ({ row }) => row.original.valueMinor.toLocaleString(locale),
      },
    ],
    [locale],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "crm", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "crm", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="crm"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "crm", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "crm", "subtitle")}</p>
      </header>

      <SoloForm
        schema={createPipelineSchema}
        defaultValues={{ name: "", isPrivate: false, stageLabels: "" }}
        submitLabel={t(locale, "crm", "createPipeline")}
        onSubmit={async (values: CreatePipelineValues) => {
          const stageLabels = parseStageLabels(values.stageLabels);
          if (stageLabels.length === 0) {
            pushFeedback({
              tone: "error",
              title: t(locale, "crm", "validation.stageLabels"),
            });
            return;
          }
          await getCrmClient().createPipeline(orgId, {
            name: values.name,
            isPrivate: values.isPrivate,
            stageLabels,
          });
          pushFeedback({
            tone: "success",
            title: t(locale, "crm", "pipelineSuccess"),
          });
          await queryClient.refetchQueries({
            queryKey: pipelineKeys.lists(ctx),
          });
        }}
      >
        <PipelineFields locale={locale} />
      </SoloForm>

      {pipelineQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!pipelineQuery.isLoading && visiblePipelines.length === 0 ? (
        <EmptyState title={t(locale, "crm", "emptyPipelines")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={visiblePipelines}
            columns={pipelineColumns}
            emptyLabel={t(locale, "crm", "emptyPipelines")}
          />
        </div>
      )}

      <SoloForm
        schema={createDealSchema}
        defaultValues={{
          title: "",
          pipelineName: "",
          stage: "",
          valueMinor: 0,
        }}
        submitLabel={t(locale, "crm", "createDeal")}
        onSubmit={async (values: CreateDealValues) => {
          await getCrmClient().createDeal(orgId, values);
          pushFeedback({
            tone: "success",
            title: t(locale, "crm", "dealSuccess"),
          });
          await queryClient.refetchQueries({ queryKey: dealKeys.lists(ctx) });
        }}
      >
        <DealFields locale={locale} />
      </SoloForm>

      {dealQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!dealQuery.isLoading && (dealQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "crm", "emptyDeals")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={dealQuery.data?.data ?? []}
            columns={dealColumns}
            emptyLabel={t(locale, "crm", "emptyDeals")}
          />
        </div>
      )}
    </OrgShell>
  );
}
