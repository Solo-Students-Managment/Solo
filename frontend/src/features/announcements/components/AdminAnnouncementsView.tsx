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
import {
  getAnnouncementsClient,
  type Announcement,
} from "@/services/announcements";
import { getAuthClient } from "@/services/auth";

const keys = createQueryKeyFactory("announcements");

export function AdminAnnouncementsView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("Maintenance window");
  const [body, setBody] = useState("Platform maintenance tonight.");
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
    queryFn: () => getAnnouncementsClient().list(),
    enabled: canManage.allowed,
  });
  const createMutation = useMutation({
    mutationFn: () => getAnnouncementsClient().create({ title, body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "announcements", "createSuccess"),
      });
    },
  });
  const publishMutation = useMutation({
    mutationFn: (id: string) => getAnnouncementsClient().publish(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "info",
        title: t(locale, "announcements", "publishSuccess"),
      });
    },
  });
  const columns = useMemo<ColumnDef<Announcement, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "announcements", "colTitle") },
      {
        accessorKey: "status",
        header: t(locale, "announcements", "colStatus"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          row.original.status === "draft" ? (
            <Button
              type="button"
              size="sm"
              onClick={() => publishMutation.mutate(row.original.id)}
            >
              {t(locale, "announcements", "publish")}
            </Button>
          ) : null,
      },
    ],
    [locale, publishMutation],
  );
  if (sessionQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (!canManage.allowed)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "announcements", "forbidden")} />
      </div>
    );
  return (
    <AdminShell locale={locale} dir={dir} active="announcements">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "announcements", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "announcements", "subtitle")}
        </p>
      </header>
      <div className="max-w-md space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="ann-title">
            {t(locale, "announcements", "titleLabel")}
          </Label>
          <Input
            id="ann-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ann-body">
            {t(locale, "announcements", "bodyLabel")}
          </Label>
          <Input
            id="ann-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <Button type="button" onClick={() => createMutation.mutate()}>
          {t(locale, "announcements", "create")}
        </Button>
      </div>
      {(listQuery.data?.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "announcements", "empty")} />
      ) : (
        <SoloDataTable
          data={listQuery.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "announcements", "empty")}
        />
      )}
    </AdminShell>
  );
}
