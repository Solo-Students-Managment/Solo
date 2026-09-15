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
import {
  canArchiveBranch,
  getBranchesClient,
  type Branch,
} from "@/services/branches";
import { getOrganizationClient } from "@/services/organization";

import { createBranchSchema, type CreateBranchValues } from "../schemas";

const keys = createQueryKeyFactory("branches");

function BranchFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreateBranchValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="branch-name">
          {t(locale, "branches", "nameLabel")}
        </Label>
        <Input id="branch-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="branch-code">
          {t(locale, "branches", "codeLabel")}
        </Label>
        <Input id="branch-code" {...register("code")} />
        <SoloFieldError name="code" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="branch-from">
          {t(locale, "branches", "effectiveFromLabel")}
        </Label>
        <Input id="branch-from" type="date" {...register("effectiveFrom")} />
        <SoloFieldError name="effectiveFrom" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="branch-address">
          {t(locale, "branches", "addressLabel")}
        </Label>
        <Input id="branch-address" {...register("address")} />
      </div>
    </>
  );
}

export function OrganizationBranchesView() {
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
    queryKey: keys.list(ctx, { resource: "branches" }),
    queryFn: () => getBranchesClient().list(orgId),
    enabled: canManage.allowed,
  });

  const columns = useMemo<ColumnDef<Branch, unknown>[]>(
    () => [
      { accessorKey: "name", header: t(locale, "branches", "colName") },
      { accessorKey: "code", header: t(locale, "branches", "colCode") },
      {
        accessorKey: "isMain",
        header: t(locale, "branches", "colMain"),
        cell: ({ row }) =>
          row.original.isMain
            ? t(locale, "branches", "main.yes")
            : t(locale, "branches", "main.no"),
      },
      {
        accessorKey: "status",
        header: t(locale, "branches", "colStatus"),
        cell: ({ row }) =>
          t(locale, "branches", `status.${row.original.status}`),
      },
      {
        accessorKey: "effectiveFrom",
        header: t(locale, "branches", "colEffective"),
        cell: ({ row }) => {
          const to = row.original.effectiveTo;
          return to
            ? `${row.original.effectiveFrom} → ${to}`
            : row.original.effectiveFrom;
        },
      },
      {
        id: "actions",
        header: t(locale, "branches", "colActions"),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {!row.original.isMain && row.original.status === "active" ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await getBranchesClient().setMain(
                    orgId,
                    String(row.original.id),
                  );
                  pushFeedback({
                    tone: "success",
                    title: t(locale, "branches", "setMainSuccess"),
                  });
                  await queryClient.invalidateQueries({
                    queryKey: keys.all(ctx),
                  });
                }}
              >
                {t(locale, "branches", "setMain")}
              </Button>
            ) : null}
            {canArchiveBranch(row.original) ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={async () => {
                  try {
                    await getBranchesClient().archive(
                      orgId,
                      String(row.original.id),
                    );
                    pushFeedback({
                      tone: "success",
                      title: t(locale, "branches", "archiveSuccess"),
                    });
                    await queryClient.invalidateQueries({
                      queryKey: keys.all(ctx),
                    });
                  } catch {
                    pushFeedback({
                      tone: "error",
                      title: t(locale, "branches", "archiveBlocked"),
                    });
                  }
                }}
              >
                {t(locale, "branches", "archive")}
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, orgId, queryClient, sessionQuery.data?.userId],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "branches", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "branches", "forbidden")} />
      </div>
    );
  }

  const rows = listQuery.data?.data ?? [];

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="branches"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "branches", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "branches", "subtitle")}
        </p>
      </header>

      <SoloForm
        schema={createBranchSchema}
        defaultValues={{
          name: "",
          code: "",
          effectiveFrom: new Date().toISOString().slice(0, 10),
          address: "",
        }}
        submitLabel={t(locale, "branches", "createSubmit")}
        onSubmit={async (values: CreateBranchValues) => {
          await getBranchesClient().create(orgId, {
            name: values.name,
            code: values.code,
            effectiveFrom: values.effectiveFrom,
            address: values.address,
          });
          pushFeedback({
            tone: "success",
            title: t(locale, "branches", "createSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <BranchFields locale={locale} />
      </SoloForm>

      {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!listQuery.isLoading && rows.length === 0 ? (
        <EmptyState title={t(locale, "branches", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={rows}
            columns={columns}
            emptyLabel={t(locale, "branches", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
