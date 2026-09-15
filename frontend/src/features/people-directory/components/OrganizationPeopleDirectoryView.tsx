"use client";

import { useEffect, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { OrgShell } from "@/features/organization";
import {
  Button,
  EmptyState,
  ErrorState,
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
import { getOrganizationClient } from "@/services/organization";
import {
  getPeopleDirectoryClient,
  PRESENCE_STATUSES,
  resolveVisiblePresence,
  type DirectoryPerson,
  type PresenceStatus,
} from "@/services/people-directory";
import { getRealtimeClient } from "@/services/realtime/client";

import {
  filterDirectoryPeople,
  resolveDirectoryFilter,
  type DirectoryFilter,
} from "../schemas";

const keys = createQueryKeyFactory("people-directory");
const selectClassName =
  "border-border bg-elevated h-10 w-full max-w-xs rounded-md border px-2 text-sm";

export function OrganizationPeopleDirectoryView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const langQuery = locale === "en" ? "?lang=en" : "?lang=fa";
  const filter = resolveDirectoryFilter(searchParams.get("presence"));
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
  const directoryQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "directory" }),
    queryFn: () => getPeopleDirectoryClient().list(orgId),
    enabled: canManage.allowed,
  });

  useEffect(() => {
    const topic = `org:${orgId}:presence`;
    const realtime = getRealtimeClient();
    realtime.connect();
    return realtime.subscribe(topic, () => {
      void queryClient.invalidateQueries({
        queryKey: keys.all({
          personaId: sessionQuery.data?.userId,
          organizationId: orgId,
          subjectId: null,
        }),
      });
    });
  }, [orgId, queryClient, sessionQuery.data?.userId]);

  const people = useMemo(
    () => directoryQuery.data?.data ?? [],
    [directoryQuery.data?.data],
  );
  const filtered = useMemo(
    () => filterDirectoryPeople(people, filter),
    [people, filter],
  );

  const columns = useMemo<ColumnDef<DirectoryPerson, unknown>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: t(locale, "peopleDirectory", "colName"),
      },
      {
        accessorKey: "roleLabel",
        header: t(locale, "peopleDirectory", "colRole"),
      },
      {
        id: "department",
        header: t(locale, "peopleDirectory", "colDepartment"),
        cell: ({ row }) => row.original.departmentName ?? "—",
      },
      {
        id: "teams",
        header: t(locale, "peopleDirectory", "colTeams"),
        cell: ({ row }) =>
          row.original.teamNames.length > 0
            ? row.original.teamNames.join(", ")
            : "—",
      },
      {
        id: "presence",
        header: t(locale, "peopleDirectory", "colPresence"),
        cell: ({ row }) => {
          const visible = resolveVisiblePresence(row.original);
          return t(locale, "peopleDirectory", `presence.${visible}`);
        },
      },
    ],
    [locale],
  );

  const filters: { key: DirectoryFilter; label: string }[] = [
    { key: "all", label: t(locale, "peopleDirectory", "filterAll") },
    ...PRESENCE_STATUSES.map((status) => ({
      key: status as DirectoryFilter,
      label: t(locale, "peopleDirectory", `presence.${status}`),
    })),
  ];

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "peopleDirectory", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "peopleDirectory", "forbidden")} />
      </div>
    );
  }

  const selfPerson = people[0];

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="directory"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "peopleDirectory", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "peopleDirectory", "subtitle")}
        </p>
        <p className="text-muted text-xs">
          {t(locale, "peopleDirectory", "realtimeHint")}
        </p>
      </header>

      <nav
        aria-label={t(locale, "peopleDirectory", "filterLabel")}
        className="flex flex-wrap gap-2"
      >
        {filters.map((item) => (
          <Link
            key={item.key}
            href={`${routes.organization.directory(orgId)}${langQuery}${item.key === "all" ? "" : `&presence=${item.key}`}`}
            className={cn(
              "border-border inline-flex min-h-11 items-center rounded-md border px-3 text-sm transition-colors duration-200",
              filter === item.key
                ? "bg-brand text-brand-fg border-brand"
                : "bg-elevated hover:bg-muted/40",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {selfPerson ? (
        <form
          className="border-border bg-elevated flex flex-wrap items-end gap-3 rounded-md border p-4"
          aria-label={t(locale, "peopleDirectory", "setPresence")}
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const select = form.elements.namedItem(
              "presenceStatus",
            ) as HTMLSelectElement;
            const status = select.value as PresenceStatus;
            const updated = await getPeopleDirectoryClient().setPresence(
              orgId,
              String(selfPerson.id),
              status,
            );
            getRealtimeClient().publish({
              topic: `org:${orgId}:presence`,
              id: `presence_${String(updated.id)}_${Date.now()}`,
              payload: {
                personId: updated.id,
                status: updated.presenceStatus,
              },
            });
            pushFeedback({
              tone: "success",
              title: t(locale, "peopleDirectory", "presenceSuccess"),
            });
            await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="presence-status">
              {t(locale, "peopleDirectory", "setPresence")}
            </Label>
            <select
              id="presence-status"
              name="presenceStatus"
              className={selectClassName}
              defaultValue={selfPerson.presenceStatus}
            >
              {PRESENCE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(locale, "peopleDirectory", `presence.${status}`)}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="min-h-11">
            {t(locale, "peopleDirectory", "setPresence")}
          </Button>
        </form>
      ) : null}

      {directoryQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!directoryQuery.isLoading && filtered.length === 0 ? (
        <EmptyState title={t(locale, "peopleDirectory", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={filtered}
            columns={columns}
            emptyLabel={t(locale, "peopleDirectory", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
