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
  canPublishPolicy,
  getPoliciesClient,
  type OrgPolicy,
} from "@/services/policies";

import { createPolicySchema, type CreatePolicyValues } from "../schemas";

const keys = createQueryKeyFactory("policies");

function PolicyFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreatePolicyValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="pol-title">{t(locale, "policies", "titleLabel")}</Label>
        <Input id="pol-title" {...register("title")} />
        <SoloFieldError name="title" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pol-cat">
          {t(locale, "policies", "categoryLabel")}
        </Label>
        <Input id="pol-cat" {...register("category")} />
        <SoloFieldError name="category" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pol-from">
          {t(locale, "policies", "effectiveFromLabel")}
        </Label>
        <Input id="pol-from" type="date" {...register("effectiveFrom")} />
        <SoloFieldError name="effectiveFrom" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pol-summary">
          {t(locale, "policies", "summaryLabel")}
        </Label>
        <textarea
          id="pol-summary"
          className="border-border bg-elevated min-h-24 w-full rounded-md border px-2 py-2 text-sm"
          {...register("summary")}
        />
        <SoloFieldError name="summary" />
      </div>
      <div className="flex min-h-11 items-center gap-2">
        <input
          id="pol-inherit"
          type="checkbox"
          className="size-4"
          {...register("inheritsFromParent")}
        />
        <Label htmlFor="pol-inherit">
          {t(locale, "policies", "inheritsLabel")}
        </Label>
      </div>
      <div className="flex min-h-11 items-center gap-2">
        <input
          id="pol-sensitive"
          type="checkbox"
          className="size-4"
          {...register("sensitive")}
        />
        <Label htmlFor="pol-sensitive">
          {t(locale, "policies", "sensitiveLabel")}
        </Label>
      </div>
    </>
  );
}

export function OrganizationPoliciesView() {
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
  const policiesQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getPoliciesClient().list(orgId),
    enabled: canManage.allowed,
  });

  const columns = useMemo<ColumnDef<OrgPolicy, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "policies", "colTitle") },
      {
        accessorKey: "category",
        header: t(locale, "policies", "colCategory"),
      },
      {
        accessorKey: "status",
        header: t(locale, "policies", "colStatus"),
        cell: ({ row }) =>
          t(locale, "policies", `status.${row.original.status}`),
      },
      {
        accessorKey: "version",
        header: t(locale, "policies", "colVersion"),
      },
      {
        accessorKey: "effectiveFrom",
        header: t(locale, "policies", "colEffective"),
      },
      {
        id: "actions",
        header: t(locale, "policies", "colActions"),
        cell: ({ row }) =>
          canPublishPolicy(row.original) ? (
            <Button
              type="button"
              className="min-h-11"
              onClick={async () => {
                await getPoliciesClient().publish(
                  orgId,
                  String(row.original.id),
                );
                pushFeedback({
                  tone: "success",
                  title: t(locale, "policies", "publishSuccess"),
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
              {t(locale, "policies", "publish")}
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
        <ErrorState title={t(locale, "policies", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "policies", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="policies"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "policies", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "policies", "subtitle")}
        </p>
        <p className="text-muted text-xs">
          {t(locale, "policies", "impactPreview")}
        </p>
      </header>

      <SoloForm
        schema={createPolicySchema}
        defaultValues={{
          title: "",
          category: "",
          inheritsFromParent: true,
          sensitive: false,
          effectiveFrom: new Date().toISOString().slice(0, 10),
          summary: "",
        }}
        submitLabel={t(locale, "policies", "createPolicy")}
        onSubmit={async (values: CreatePolicyValues) => {
          await getPoliciesClient().create(orgId, {
            title: values.title,
            category: values.category,
            inheritsFromParent: values.inheritsFromParent,
            sensitive: values.sensitive,
            effectiveFrom: values.effectiveFrom,
            summary: values.summary,
          });
          pushFeedback({
            tone: "success",
            title: t(locale, "policies", "policySuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <PolicyFields locale={locale} />
      </SoloForm>

      {policiesQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!policiesQuery.isLoading &&
      (policiesQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "policies", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={policiesQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "policies", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
