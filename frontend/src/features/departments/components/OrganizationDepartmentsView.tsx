"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useFormContext } from "react-hook-form";
import Link from "next/link";
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
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import { getAuthClient } from "@/services/auth";
import {
  getDepartmentsClient,
  type Department,
  type Team,
} from "@/services/departments";
import { getOrganizationClient } from "@/services/organization";

import {
  createDepartmentSchema,
  createTeamSchema,
  resolveDepartmentsTab,
  type CreateDepartmentValues,
  type CreateTeamValues,
  type DepartmentsTab,
} from "../schemas";

const keys = createQueryKeyFactory("departments");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function DepartmentFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreateDepartmentValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="dept-name">
          {t(locale, "departments", "deptNameLabel")}
        </Label>
        <Input id="dept-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dept-code">
          {t(locale, "departments", "deptCodeLabel")}
        </Label>
        <Input id="dept-code" {...register("code")} />
        <SoloFieldError name="code" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dept-from">
          {t(locale, "departments", "effectiveFromLabel")}
        </Label>
        <Input id="dept-from" type="date" {...register("effectiveFrom")} />
        <SoloFieldError name="effectiveFrom" />
      </div>
    </>
  );
}

function TeamFields({
  locale,
  departments,
}: {
  locale: ReturnType<typeof resolveLocale>;
  departments: Department[];
}) {
  const { register } = useFormContext<CreateTeamValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="team-dept">
          {t(locale, "departments", "departmentLabel")}
        </Label>
        <select
          id="team-dept"
          className={selectClassName}
          {...register("departmentId")}
        >
          <option value="">—</option>
          {departments.map((dept) => (
            <option key={String(dept.id)} value={String(dept.id)}>
              {dept.name}
            </option>
          ))}
        </select>
        <SoloFieldError name="departmentId" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="team-name">
          {t(locale, "departments", "teamNameLabel")}
        </Label>
        <Input id="team-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="team-code">
          {t(locale, "departments", "teamCodeLabel")}
        </Label>
        <Input id="team-code" {...register("code")} />
        <SoloFieldError name="code" />
      </div>
    </>
  );
}

export function OrganizationDepartmentsView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const langQuery = locale === "en" ? "?lang=en" : "?lang=fa";
  const tab = resolveDepartmentsTab(searchParams.get("tab"));
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
  const departmentsQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "departments" }),
    queryFn: () => getDepartmentsClient().listDepartments(orgId),
    enabled: canManage.allowed,
  });
  const teamsQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "teams" }),
    queryFn: () => getDepartmentsClient().listTeams(orgId),
    enabled: canManage.allowed,
  });

  const activeDepartments = (departmentsQuery.data?.data ?? []).filter(
    (row) => row.status === "active",
  );

  const departmentColumns = useMemo<ColumnDef<Department, unknown>[]>(
    () => [
      { accessorKey: "name", header: t(locale, "departments", "colName") },
      { accessorKey: "code", header: t(locale, "departments", "colCode") },
      {
        accessorKey: "effectiveFrom",
        header: t(locale, "departments", "colEffectiveFrom"),
      },
      {
        accessorKey: "status",
        header: t(locale, "departments", "colStatus"),
        cell: ({ row }) =>
          t(locale, "departments", `status.${row.original.status}`),
      },
    ],
    [locale],
  );

  const teamColumns = useMemo<ColumnDef<Team, unknown>[]>(
    () => [
      { accessorKey: "name", header: t(locale, "departments", "colName") },
      { accessorKey: "code", header: t(locale, "departments", "colCode") },
      {
        accessorKey: "departmentName",
        header: t(locale, "departments", "colDepartment"),
      },
      {
        accessorKey: "status",
        header: t(locale, "departments", "colStatus"),
        cell: ({ row }) =>
          t(locale, "departments", `status.${row.original.status}`),
      },
    ],
    [locale],
  );

  const tabs: { key: DepartmentsTab; label: string }[] = [
    { key: "departments", label: t(locale, "departments", "tabDepartments") },
    { key: "teams", label: t(locale, "departments", "tabTeams") },
  ];

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "departments", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "departments", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="departments"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "departments", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "departments", "subtitle")}
        </p>
      </header>

      <nav
        aria-label={t(locale, "departments", "title")}
        className="flex flex-wrap gap-2"
      >
        {tabs.map((item) => (
          <Link
            key={item.key}
            href={`${routes.organization.departments(orgId)}${langQuery}&tab=${item.key}`}
            className={cn(
              "border-border inline-flex min-h-11 items-center rounded-md border px-3 text-sm transition-colors duration-200",
              tab === item.key
                ? "bg-brand text-brand-fg border-brand"
                : "bg-elevated hover:bg-muted/40",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {tab === "departments" ? (
        <section className="space-y-4">
          <SoloForm
            schema={createDepartmentSchema}
            defaultValues={{
              name: "",
              code: "",
              effectiveFrom: new Date().toISOString().slice(0, 10),
            }}
            submitLabel={t(locale, "departments", "createDepartment")}
            onSubmit={async (values: CreateDepartmentValues) => {
              await getDepartmentsClient().createDepartment(orgId, {
                name: values.name,
                code: values.code,
                effectiveFrom: values.effectiveFrom,
              });
              pushFeedback({
                tone: "success",
                title: t(locale, "departments", "deptSuccess"),
              });
              await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
            }}
          >
            <DepartmentFields locale={locale} />
          </SoloForm>
          {departmentsQuery.isLoading ? <Skeleton className="h-24" /> : null}
          {!departmentsQuery.isLoading &&
          (departmentsQuery.data?.data.length ?? 0) === 0 ? (
            <EmptyState title={t(locale, "departments", "departmentsEmpty")} />
          ) : (
            <div className="overflow-x-auto">
              <SoloDataTable
                data={departmentsQuery.data?.data ?? []}
                columns={departmentColumns}
                emptyLabel={t(locale, "departments", "departmentsEmpty")}
              />
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          <SoloForm
            schema={createTeamSchema}
            defaultValues={{ departmentId: "", name: "", code: "" }}
            submitLabel={t(locale, "departments", "createTeam")}
            onSubmit={async (values: CreateTeamValues) => {
              await getDepartmentsClient().createTeam(orgId, {
                departmentId: values.departmentId,
                name: values.name,
                code: values.code,
              });
              pushFeedback({
                tone: "success",
                title: t(locale, "departments", "teamSuccess"),
              });
              await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
            }}
          >
            <TeamFields locale={locale} departments={activeDepartments} />
          </SoloForm>
          {teamsQuery.isLoading ? <Skeleton className="h-24" /> : null}
          {!teamsQuery.isLoading &&
          (teamsQuery.data?.data.length ?? 0) === 0 ? (
            <EmptyState title={t(locale, "departments", "teamsEmpty")} />
          ) : (
            <div className="overflow-x-auto">
              <SoloDataTable
                data={teamsQuery.data?.data ?? []}
                columns={teamColumns}
                emptyLabel={t(locale, "departments", "teamsEmpty")}
              />
            </div>
          )}
        </section>
      )}
    </OrgShell>
  );
}
