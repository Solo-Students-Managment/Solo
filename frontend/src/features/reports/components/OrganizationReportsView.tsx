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
import { getReportsClient, type ReportView } from "@/services/reports";
import { saveReportViewSchema, type SaveReportViewValues } from "../schemas";

const keys = createQueryKeyFactory("reports");

function Fields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<SaveReportViewValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="rpt-name">{t(locale, "reports", "nameLabel")}</Label>
        <Input id="rpt-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rpt-kind">{t(locale, "reports", "kindLabel")}</Label>
        <select
          id="rpt-kind"
          className="border-border bg-elevated w-full rounded-md border px-3 py-2 text-sm"
          {...register("kind")}
        >
          {(["attendance", "grades", "enrollment"] as const).map((kind) => (
            <option key={kind} value={kind}>
              {t(locale, "reports", `kind.${kind}`)}
            </option>
          ))}
        </select>
        <SoloFieldError name="kind" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rpt-format">
          {t(locale, "reports", "formatLabel")}
        </Label>
        <select
          id="rpt-format"
          className="border-border bg-elevated w-full rounded-md border px-3 py-2 text-sm"
          {...register("format")}
        >
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
        <SoloFieldError name="format" />
      </div>
    </>
  );
}

export function OrganizationReportsView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [exportPreview, setExportPreview] = useState<string>("");
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
    queryKey: keys.list(ctx, { resource: "views" }),
    queryFn: () => getReportsClient().list(orgId),
    enabled: Boolean(sessionQuery.data),
  });
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );
  const columns = useMemo<ColumnDef<ReportView, unknown>[]>(
    () => [
      { accessorKey: "name", header: t(locale, "reports", "colName") },
      {
        accessorKey: "kind",
        header: t(locale, "reports", "colKind"),
        cell: ({ row }) => t(locale, "reports", `kind.${row.original.kind}`),
      },
      { accessorKey: "format", header: t(locale, "reports", "colFormat") },
      {
        id: "export",
        header: t(locale, "reports", "colExport"),
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={async () => {
              const result = await getReportsClient().exportView(
                orgId,
                String(row.original.id),
              );
              setExportPreview(result.content);
              pushFeedback({
                tone: "success",
                title: t(locale, "reports", "exportSuccess"),
              });
            }}
          >
            {t(locale, "reports", "exportAction")}
          </Button>
        ),
      },
    ],
    [locale, orgId],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "reports", "loadError")} />
      </div>
    );
  if (!canManage.allowed)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "reports", "forbidden")} />
      </div>
    );

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgId}
      orgName={orgQuery.data.name}
      active="reports"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "reports", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "reports", "subtitle")}</p>
      </header>
      <SoloForm
        schema={saveReportViewSchema}
        defaultValues={{ name: "", kind: "attendance", format: "csv" }}
        submitLabel={t(locale, "reports", "saveSubmit")}
        onSubmit={async (values: SaveReportViewValues) => {
          await getReportsClient().saveView(orgId, values);
          pushFeedback({
            tone: "success",
            title: t(locale, "reports", "saveSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <Fields locale={locale} />
      </SoloForm>
      {!listQuery.isLoading && (listQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "reports", "empty")} />
      ) : (
        <SoloDataTable
          data={listQuery.data?.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "reports", "empty")}
        />
      )}
      {exportPreview ? (
        <pre
          className="border-border bg-sunken overflow-auto rounded-md border p-3 text-xs"
          aria-label={t(locale, "reports", "exportPreview")}
        >
          {exportPreview}
        </pre>
      ) : null}
    </OrgShell>
  );
}
