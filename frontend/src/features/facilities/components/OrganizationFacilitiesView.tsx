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
import { getBranchesClient, type Branch } from "@/services/branches";
import {
  getFacilitiesClient,
  type Equipment,
  type Room,
} from "@/services/facilities";
import { getOrganizationClient } from "@/services/organization";

import {
  createEquipmentSchema,
  createRoomSchema,
  resolveFacilitiesTab,
  type CreateEquipmentValues,
  type CreateRoomValues,
  type FacilitiesTab,
} from "../schemas";

const keys = createQueryKeyFactory("facilities");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function RoomFields({
  locale,
  branches,
}: {
  locale: ReturnType<typeof resolveLocale>;
  branches: Branch[];
}) {
  const { register } = useFormContext<CreateRoomValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="room-branch">
          {t(locale, "facilities", "branchLabel")}
        </Label>
        <select
          id="room-branch"
          className={selectClassName}
          {...register("branchId")}
        >
          <option value="">—</option>
          {branches.map((branch) => (
            <option key={String(branch.id)} value={String(branch.id)}>
              {branch.name}
            </option>
          ))}
        </select>
        <SoloFieldError name="branchId" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="room-name">
          {t(locale, "facilities", "roomNameLabel")}
        </Label>
        <Input id="room-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="room-capacity">
          {t(locale, "facilities", "capacityLabel")}
        </Label>
        <Input id="room-capacity" type="number" {...register("capacity")} />
        <SoloFieldError name="capacity" />
      </div>
    </>
  );
}

function EquipmentFields({
  locale,
  branches,
}: {
  locale: ReturnType<typeof resolveLocale>;
  branches: Branch[];
}) {
  const { register } = useFormContext<CreateEquipmentValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="eq-branch">
          {t(locale, "facilities", "branchLabel")}
        </Label>
        <select
          id="eq-branch"
          className={selectClassName}
          {...register("branchId")}
        >
          <option value="">—</option>
          {branches.map((branch) => (
            <option key={String(branch.id)} value={String(branch.id)}>
              {branch.name}
            </option>
          ))}
        </select>
        <SoloFieldError name="branchId" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="eq-name">
          {t(locale, "facilities", "equipmentNameLabel")}
        </Label>
        <Input id="eq-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="eq-tag">
          {t(locale, "facilities", "assetTagLabel")}
        </Label>
        <Input id="eq-tag" {...register("assetTag")} />
        <SoloFieldError name="assetTag" />
      </div>
    </>
  );
}

export function OrganizationFacilitiesView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const tab = resolveFacilitiesTab(searchParams.get("tab"));
  const queryClient = useQueryClient();
  const langQuery = `?lang=${locale}`;

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
  const branchesQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "branch-options" }),
    queryFn: () => getBranchesClient().list(orgId),
    enabled: canManage.allowed,
  });
  const roomsQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "rooms" }),
    queryFn: () => getFacilitiesClient().listRooms(orgId),
    enabled: canManage.allowed,
  });
  const equipmentQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "equipment" }),
    queryFn: () => getFacilitiesClient().listEquipment(orgId),
    enabled: canManage.allowed,
  });

  const branches = (branchesQuery.data?.data ?? []).filter(
    (row) => row.status === "active",
  );

  const roomColumns = useMemo<ColumnDef<Room, unknown>[]>(
    () => [
      { accessorKey: "name", header: t(locale, "facilities", "colName") },
      {
        accessorKey: "branchName",
        header: t(locale, "facilities", "colBranch"),
      },
      {
        accessorKey: "capacity",
        header: t(locale, "facilities", "colCapacity"),
      },
      {
        accessorKey: "status",
        header: t(locale, "facilities", "colStatus"),
        cell: ({ row }) =>
          t(locale, "facilities", `status.${row.original.status}`),
      },
    ],
    [locale],
  );

  const equipmentColumns = useMemo<ColumnDef<Equipment, unknown>[]>(
    () => [
      { accessorKey: "name", header: t(locale, "facilities", "colName") },
      {
        accessorKey: "branchName",
        header: t(locale, "facilities", "colBranch"),
      },
      { accessorKey: "assetTag", header: t(locale, "facilities", "colAsset") },
      {
        accessorKey: "status",
        header: t(locale, "facilities", "colStatus"),
        cell: ({ row }) =>
          t(locale, "facilities", `status.${row.original.status}`),
      },
    ],
    [locale],
  );

  const tabs: { key: FacilitiesTab; label: string }[] = [
    { key: "rooms", label: t(locale, "facilities", "tabRooms") },
    { key: "equipment", label: t(locale, "facilities", "tabEquipment") },
  ];

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "facilities", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "facilities", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="facilities"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "facilities", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "facilities", "subtitle")}
        </p>
      </header>

      <nav
        aria-label={t(locale, "facilities", "title")}
        className="flex flex-wrap gap-2"
      >
        {tabs.map((item) => (
          <Link
            key={item.key}
            href={`${routes.organization.facilities(orgId)}${langQuery}&tab=${item.key}`}
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

      {tab === "rooms" ? (
        <section className="space-y-4">
          <SoloForm
            schema={createRoomSchema}
            defaultValues={{ branchId: "", name: "", capacity: 20 }}
            submitLabel={t(locale, "facilities", "createRoom")}
            onSubmit={async (values: CreateRoomValues) => {
              await getFacilitiesClient().createRoom(orgId, {
                branchId: values.branchId,
                name: values.name,
                capacity: values.capacity,
              });
              pushFeedback({
                tone: "success",
                title: t(locale, "facilities", "roomSuccess"),
              });
              await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
            }}
          >
            <RoomFields locale={locale} branches={branches} />
          </SoloForm>
          {roomsQuery.isLoading ? <Skeleton className="h-24" /> : null}
          {!roomsQuery.isLoading &&
          (roomsQuery.data?.data.length ?? 0) === 0 ? (
            <EmptyState title={t(locale, "facilities", "roomsEmpty")} />
          ) : (
            <div className="overflow-x-auto">
              <SoloDataTable
                data={roomsQuery.data?.data ?? []}
                columns={roomColumns}
                emptyLabel={t(locale, "facilities", "roomsEmpty")}
              />
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          <SoloForm
            schema={createEquipmentSchema}
            defaultValues={{ branchId: "", name: "", assetTag: "" }}
            submitLabel={t(locale, "facilities", "createEquipment")}
            onSubmit={async (values: CreateEquipmentValues) => {
              await getFacilitiesClient().createEquipment(orgId, {
                branchId: values.branchId,
                name: values.name,
                assetTag: values.assetTag,
              });
              pushFeedback({
                tone: "success",
                title: t(locale, "facilities", "equipmentSuccess"),
              });
              await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
            }}
          >
            <EquipmentFields locale={locale} branches={branches} />
          </SoloForm>
          {equipmentQuery.isLoading ? <Skeleton className="h-24" /> : null}
          {!equipmentQuery.isLoading &&
          (equipmentQuery.data?.data.length ?? 0) === 0 ? (
            <EmptyState title={t(locale, "facilities", "equipmentEmpty")} />
          ) : (
            <div className="overflow-x-auto">
              <SoloDataTable
                data={equipmentQuery.data?.data ?? []}
                columns={equipmentColumns}
                emptyLabel={t(locale, "facilities", "equipmentEmpty")}
              />
            </div>
          )}
        </section>
      )}
    </OrgShell>
  );
}
