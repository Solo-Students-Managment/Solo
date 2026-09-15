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
import { getResourcesClient, type ResourceFile } from "@/services/resources";
import { publishResourceSchema, type PublishResourceValues } from "../schemas";

const keys = createQueryKeyFactory("resources");

function Fields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<PublishResourceValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="res-subject">
          {t(locale, "resources", "subjectLabel")}
        </Label>
        <Input id="res-subject" {...register("subjectName")} />
        <SoloFieldError name="subjectName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="res-title">
          {t(locale, "resources", "titleLabel")}
        </Label>
        <Input id="res-title" {...register("title")} />
        <SoloFieldError name="title" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="res-mime">{t(locale, "resources", "mimeLabel")}</Label>
        <select
          id="res-mime"
          className="border-border bg-elevated w-full rounded-md border px-3 py-2 text-sm"
          {...register("mimeHint")}
        >
          {(["pdf", "word", "image", "audio"] as const).map((mime) => (
            <option key={mime} value={mime}>
              {t(locale, "resources", `mime.${mime}`)}
            </option>
          ))}
        </select>
        <SoloFieldError name="mimeHint" />
      </div>
    </>
  );
}

export function OrganizationResourcesView() {
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
    queryKey: keys.list(ctx, { resource: "files" }),
    queryFn: () => getResourcesClient().list(orgId),
    enabled: Boolean(sessionQuery.data),
  });
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );
  const columns = useMemo<ColumnDef<ResourceFile, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "resources", "colTitle") },
      {
        accessorKey: "subjectName",
        header: t(locale, "resources", "colSubject"),
      },
      { accessorKey: "version", header: t(locale, "resources", "colVersion") },
      {
        accessorKey: "securityState",
        header: t(locale, "resources", "colSecurity"),
        cell: ({ row }) =>
          t(locale, "resources", `security.${row.original.securityState}`),
      },
      {
        accessorKey: "mimeHint",
        header: t(locale, "resources", "colMime"),
        cell: ({ row }) =>
          t(locale, "resources", `mime.${row.original.mimeHint}`),
      },
    ],
    [locale],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "resources", "loadError")} />
      </div>
    );
  if (!canManage.allowed)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "resources", "forbidden")} />
      </div>
    );

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgId}
      orgName={orgQuery.data.name}
      active="resources"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "resources", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "resources", "subtitle")}
        </p>
      </header>
      <SoloForm
        schema={publishResourceSchema}
        defaultValues={{ subjectName: "", title: "", mimeHint: "pdf" }}
        submitLabel={t(locale, "resources", "publishSubmit")}
        onSubmit={async (values: PublishResourceValues) => {
          await getResourcesClient().publish(orgId, values);
          pushFeedback({
            tone: "success",
            title: t(locale, "resources", "publishSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <Fields locale={locale} />
      </SoloForm>
      {!listQuery.isLoading && (listQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "resources", "empty")} />
      ) : (
        <SoloDataTable
          data={listQuery.data?.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "resources", "empty")}
        />
      )}
    </OrgShell>
  );
}
