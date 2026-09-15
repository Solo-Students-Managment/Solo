"use client";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layouts";
import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { EmptyState, ErrorState, Label, Skeleton } from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import { getCalendarClient, type CalendarEvent } from "@/services/calendar";
import { filterEventsByKind, sortUpcomingEvents } from "../model";

const keys = createQueryKeyFactory("calendar");

export function UpcomingCalendarView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const [kind, setKind] = useState<CalendarEvent["kind"] | "all">("all");
  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const ctx = {
    personaId: sessionQuery.data?.userId,
    organizationId: null,
    subjectId: null,
  };
  const listQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "upcoming" }),
    queryFn: () => getCalendarClient().listUpcoming(),
    enabled: Boolean(sessionQuery.data),
  });
  const rows = useMemo(
    () =>
      sortUpcomingEvents(filterEventsByKind(listQuery.data?.data ?? [], kind)),
    [listQuery.data, kind],
  );
  const columns = useMemo<ColumnDef<CalendarEvent, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "calendar", "colTitle") },
      {
        accessorKey: "kind",
        header: t(locale, "calendar", "colKind"),
        cell: ({ row }) => t(locale, "calendar", `kind.${row.original.kind}`),
      },
      { accessorKey: "startsAt", header: t(locale, "calendar", "colStarts") },
      { accessorKey: "endsAt", header: t(locale, "calendar", "colEnds") },
    ],
    [locale],
  );

  if (sessionQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (!sessionQuery.data)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "calendar", "forbidden")} />
      </div>
    );

  return (
    <AppShell title="Solo">
      <div className="space-y-6" dir={dir} lang={locale}>
        <header className="space-y-2">
          <h1 className="font-display text-2xl font-medium">
            {t(locale, "calendar", "title")}
          </h1>
          <p className="text-muted text-sm">
            {t(locale, "calendar", "subtitle")}
          </p>
        </header>
        <div className="max-w-xs space-y-1.5">
          <Label htmlFor="cal-kind">
            {t(locale, "calendar", "filterLabel")}
          </Label>
          <select
            id="cal-kind"
            className="border-border bg-elevated w-full rounded-md border px-3 py-2 text-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
          >
            <option value="all">{t(locale, "calendar", "kind.all")}</option>
            <option value="session">
              {t(locale, "calendar", "kind.session")}
            </option>
            <option value="assignment">
              {t(locale, "calendar", "kind.assignment")}
            </option>
            <option value="reminder">
              {t(locale, "calendar", "kind.reminder")}
            </option>
          </select>
        </div>
        {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
        {!listQuery.isLoading && rows.length === 0 ? (
          <EmptyState title={t(locale, "calendar", "empty")} />
        ) : (
          <SoloDataTable
            data={rows}
            columns={columns}
            emptyLabel={t(locale, "calendar", "empty")}
          />
        )}
      </div>
    </AppShell>
  );
}
