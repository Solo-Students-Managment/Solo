"use client";

import { useMemo, useState } from "react";
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
import { getDepartmentsClient, type Department } from "@/services/departments";
import { getOrganizationClient } from "@/services/organization";
import {
  buildOrgChartForest,
  getPositionsClient,
  isPositionVacant,
  type OrgChartNode,
  type Position,
} from "@/services/positions";

import {
  createPositionSchema,
  resolvePositionsTab,
  type CreatePositionValues,
  type PositionsTab,
} from "../schemas";

const keys = createQueryKeyFactory("positions");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function PositionFields({
  locale,
  departments,
  positions,
}: {
  locale: ReturnType<typeof resolveLocale>;
  departments: Department[];
  positions: Position[];
}) {
  const { register } = useFormContext<CreatePositionValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="pos-title">
          {t(locale, "positions", "titleLabel")}
        </Label>
        <Input id="pos-title" {...register("title")} />
        <SoloFieldError name="title" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pos-dept">
          {t(locale, "positions", "departmentLabel")}
        </Label>
        <select
          id="pos-dept"
          className={selectClassName}
          {...register("departmentId")}
        >
          <option value="">{t(locale, "positions", "noneOption")}</option>
          {departments.map((dept) => (
            <option key={String(dept.id)} value={String(dept.id)}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pos-reports">
          {t(locale, "positions", "reportsToLabel")}
        </Label>
        <select
          id="pos-reports"
          className={selectClassName}
          {...register("reportsToPositionId")}
        >
          <option value="">{t(locale, "positions", "noneOption")}</option>
          {positions.map((row) => (
            <option key={String(row.id)} value={String(row.id)}>
              {row.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pos-holder">
          {t(locale, "positions", "holderLabel")}
        </Label>
        <Input id="pos-holder" {...register("holderDisplayName")} />
        <p className="text-muted text-xs">
          {t(locale, "positions", "holderHelp")}
        </p>
      </div>
    </>
  );
}

function ChartNodeView({
  node,
  locale,
}: {
  node: OrgChartNode;
  locale: ReturnType<typeof resolveLocale>;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children.length > 0;
  const vacant = isPositionVacant(node.position.status);
  const holder =
    node.position.holderDisplayName ?? t(locale, "positions", "vacantLabel");

  return (
    <li className="ms-0">
      <div className="border-border bg-elevated flex flex-wrap items-center gap-2 rounded-md border px-3 py-2">
        {hasChildren ? (
          <button
            type="button"
            className="text-muted hover:text-foreground inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-sm"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "−" : "+"}
          </button>
        ) : (
          <span className="inline-flex min-h-11 min-w-11" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium">{node.position.title}</p>
          <p className="text-muted text-sm">
            {holder}
            {node.position.departmentName
              ? ` · ${node.position.departmentName}`
              : ""}
            {vacant ? ` · ${t(locale, "positions", "status.vacant")}` : ""}
          </p>
        </div>
      </div>
      {hasChildren && open ? (
        <ul className="border-border ms-4 mt-2 space-y-2 border-s ps-3">
          {node.children.map((child) => (
            <ChartNodeView
              key={String(child.position.id)}
              node={child}
              locale={locale}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function OrganizationPositionsView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const langQuery = locale === "en" ? "?lang=en" : "?lang=fa";
  const tab = resolvePositionsTab(searchParams.get("tab"));
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
    queryKey: keys.list(ctx, { resource: "dept-options" }),
    queryFn: () => getDepartmentsClient().listDepartments(orgId),
    enabled: canManage.allowed,
  });
  const positionsQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "positions" }),
    queryFn: () => getPositionsClient().list(orgId),
    enabled: canManage.allowed,
  });

  const positions = useMemo(
    () => positionsQuery.data?.data ?? [],
    [positionsQuery.data?.data],
  );
  const activeDepartments = (departmentsQuery.data?.data ?? []).filter(
    (row) => row.status === "active",
  );
  const titleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of positions) map.set(String(row.id), row.title);
    return map;
  }, [positions]);
  const forest = useMemo(() => buildOrgChartForest(positions), [positions]);

  const columns = useMemo<ColumnDef<Position, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "positions", "colTitle") },
      {
        id: "department",
        header: t(locale, "positions", "colDepartment"),
        cell: ({ row }) => row.original.departmentName ?? "—",
      },
      {
        id: "reportsTo",
        header: t(locale, "positions", "colReportsTo"),
        cell: ({ row }) =>
          row.original.reportsToPositionId
            ? (titleById.get(String(row.original.reportsToPositionId)) ?? "—")
            : "—",
      },
      {
        id: "holder",
        header: t(locale, "positions", "colHolder"),
        cell: ({ row }) =>
          row.original.holderDisplayName ??
          t(locale, "positions", "vacantLabel"),
      },
      {
        accessorKey: "status",
        header: t(locale, "positions", "colStatus"),
        cell: ({ row }) =>
          t(locale, "positions", `status.${row.original.status}`),
      },
    ],
    [locale, titleById],
  );

  const tabs: { key: PositionsTab; label: string }[] = [
    { key: "positions", label: t(locale, "positions", "tabPositions") },
    { key: "chart", label: t(locale, "positions", "tabChart") },
  ];

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "positions", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "positions", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="positions"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "positions", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "positions", "subtitle")}
        </p>
      </header>

      <nav
        aria-label={t(locale, "positions", "title")}
        className="flex flex-wrap gap-2"
      >
        {tabs.map((item) => (
          <Link
            key={item.key}
            href={`${routes.organization.positions(orgId)}${langQuery}&tab=${item.key}`}
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

      {tab === "positions" ? (
        <section className="space-y-4">
          <SoloForm
            schema={createPositionSchema}
            defaultValues={{
              title: "",
              departmentId: "",
              reportsToPositionId: "",
              holderDisplayName: "",
            }}
            submitLabel={t(locale, "positions", "createPosition")}
            onSubmit={async (values: CreatePositionValues) => {
              await getPositionsClient().create(orgId, {
                title: values.title,
                departmentId: values.departmentId || null,
                reportsToPositionId: values.reportsToPositionId || null,
                holderDisplayName: values.holderDisplayName || null,
              });
              pushFeedback({
                tone: "success",
                title: t(locale, "positions", "positionSuccess"),
              });
              await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
            }}
          >
            <PositionFields
              locale={locale}
              departments={activeDepartments}
              positions={positions.filter((p) => p.status !== "archived")}
            />
          </SoloForm>
          {positionsQuery.isLoading ? <Skeleton className="h-24" /> : null}
          {!positionsQuery.isLoading && positions.length === 0 ? (
            <EmptyState title={t(locale, "positions", "positionsEmpty")} />
          ) : (
            <div className="overflow-x-auto">
              <SoloDataTable
                data={positions}
                columns={columns}
                emptyLabel={t(locale, "positions", "positionsEmpty")}
              />
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          {positionsQuery.isLoading ? <Skeleton className="h-24" /> : null}
          {!positionsQuery.isLoading && forest.length === 0 ? (
            <EmptyState title={t(locale, "positions", "chartEmpty")} />
          ) : (
            <ul
              aria-label={t(locale, "positions", "chartLabel")}
              className="space-y-2"
            >
              {forest.map((node) => (
                <ChartNodeView
                  key={String(node.position.id)}
                  node={node}
                  locale={locale}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </OrgShell>
  );
}
