"use client";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { AdminShell } from "@/features/admin";
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
import { getIncidentsClient, type Incident } from "@/services/incidents";

const keys = createQueryKeyFactory("incidents");

export function AdminIncidentsView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("API latency");
  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );
  const ctx = {
    personaId: sessionQuery.data?.userId,
    organizationId: null,
    subjectId: null,
  };
  const listQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getIncidentsClient().list(),
    enabled: canManage.allowed,
  });
  const createMutation = useMutation({
    mutationFn: () => getIncidentsClient().create({ title, severity: "high" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "warning",
        title: t(locale, "incidents", "createSuccess"),
      });
    },
  });
  const resolveMutation = useMutation({
    mutationFn: (id: string) =>
      getIncidentsClient().updateStatus(id, "resolved"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "incidents", "resolveSuccess"),
      });
    },
  });
  const columns = useMemo<ColumnDef<Incident, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "incidents", "colTitle") },
      {
        accessorKey: "severity",
        header: t(locale, "incidents", "colSeverity"),
      },
      { accessorKey: "status", header: t(locale, "incidents", "colStatus") },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          row.original.status !== "resolved" ? (
            <Button
              type="button"
              size="sm"
              onClick={() => resolveMutation.mutate(row.original.id)}
            >
              {t(locale, "incidents", "resolve")}
            </Button>
          ) : null,
      },
    ],
    [locale, resolveMutation],
  );
  if (sessionQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (!canManage.allowed)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "incidents", "forbidden")} />
      </div>
    );
  return (
    <AdminShell locale={locale} dir={dir} active="incidents">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "incidents", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "incidents", "subtitle")}
        </p>
      </header>
      <div className="max-w-md space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="inc-title">
            {t(locale, "incidents", "titleLabel")}
          </Label>
          <Input
            id="inc-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <Button type="button" onClick={() => createMutation.mutate()}>
          {t(locale, "incidents", "create")}
        </Button>
      </div>
      {(listQuery.data?.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "incidents", "empty")} />
      ) : (
        <SoloDataTable
          data={listQuery.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "incidents", "empty")}
        />
      )}
    </AdminShell>
  );
}
