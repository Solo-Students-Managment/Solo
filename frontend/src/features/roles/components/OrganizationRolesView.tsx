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
  getRolesClient,
  permissionsForTemplate,
  type OrgRoleDefinition,
  type RoleTemplateKey,
} from "@/services/roles";

import {
  createRoleSchema,
  parsePermissionsText,
  type CreateRoleValues,
} from "../schemas";

const keys = createQueryKeyFactory("roles");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function RoleFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register, setValue, watch } = useFormContext<CreateRoleValues>();
  const templateKey = watch("templateKey");

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="role-name">{t(locale, "roles", "nameLabel")}</Label>
        <Input id="role-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="role-template">
          {t(locale, "roles", "templateLabel")}
        </Label>
        <select
          id="role-template"
          className={selectClassName}
          {...register("templateKey", {
            onChange: (event) => {
              const key = event.target.value as RoleTemplateKey;
              if (key !== "custom") {
                setValue(
                  "permissionsText",
                  permissionsForTemplate(key).join(", "),
                );
              }
            },
          })}
        >
          {(
            [
              "owner",
              "manager",
              "academic_manager",
              "teacher",
              "finance",
              "support_staff",
              "custom",
            ] as const
          ).map((key) => (
            <option key={key} value={key}>
              {t(locale, "roles", `template.${key}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex min-h-11 items-center gap-2">
        <input
          id="role-branch"
          type="checkbox"
          className="size-4"
          {...register("branchScoped")}
        />
        <Label htmlFor="role-branch">
          {t(locale, "roles", "branchScopedLabel")}
        </Label>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="role-perms">
          {t(locale, "roles", "permissionsLabel")}
        </Label>
        <textarea
          id="role-perms"
          className="border-border bg-elevated min-h-24 w-full rounded-md border px-2 py-2 text-sm"
          {...register("permissionsText")}
        />
        <p className="text-muted text-xs">
          {t(locale, "roles", "permissionsHelp")}
          {templateKey !== "custom"
            ? ` (${t(locale, "roles", `template.${templateKey}`)})`
            : ""}
        </p>
        <SoloFieldError name="permissionsText" />
      </div>
    </>
  );
}

export function OrganizationRolesView() {
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
  const rolesQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getRolesClient().list(orgId),
    enabled: canManage.allowed,
  });

  const columns = useMemo<ColumnDef<OrgRoleDefinition, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: t(locale, "roles", "colName"),
        cell: ({ row }) => (
          <span>
            {row.original.name}
            {row.original.isSystem
              ? ` (${t(locale, "roles", "systemBadge")})`
              : ""}
          </span>
        ),
      },
      {
        id: "template",
        header: t(locale, "roles", "colTemplate"),
        cell: ({ row }) =>
          t(locale, "roles", `template.${row.original.templateKey}`),
      },
      {
        id: "scope",
        header: t(locale, "roles", "colScope"),
        cell: ({ row }) =>
          t(
            locale,
            "roles",
            row.original.branchScoped ? "scope.branch" : "scope.org",
          ),
      },
      {
        id: "permissions",
        header: t(locale, "roles", "colPermissions"),
        cell: ({ row }) => row.original.permissions.join(", "),
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
        <ErrorState title={t(locale, "roles", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "roles", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="roles"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "roles", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "roles", "subtitle")}</p>
      </header>

      <SoloForm
        schema={createRoleSchema}
        defaultValues={{
          name: "",
          templateKey: "custom",
          branchScoped: true,
          permissionsText: "directory.view, tasks.manage",
        }}
        submitLabel={t(locale, "roles", "createRole")}
        onSubmit={async (values: CreateRoleValues) => {
          const permissions =
            values.templateKey === "custom"
              ? parsePermissionsText(values.permissionsText)
              : permissionsForTemplate(values.templateKey);
          await getRolesClient().create(orgId, {
            name: values.name,
            templateKey: values.templateKey,
            branchScoped: values.branchScoped,
            permissions,
          });
          pushFeedback({
            tone: "success",
            title: t(locale, "roles", "roleSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <RoleFields locale={locale} />
      </SoloForm>

      {rolesQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!rolesQuery.isLoading && (rolesQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "roles", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={rolesQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "roles", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
