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
import { getAdminUsersClient, type AdminUser } from "@/services/admin-users";
import { getAuthClient } from "@/services/auth";

const keys = createQueryKeyFactory("admin-users");

export function AdminUsersView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("policy violation");
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
    queryFn: () => getAdminUsersClient().list(),
    enabled: canManage.allowed,
  });

  const restrictMutation = useMutation({
    mutationFn: (userId: string) =>
      getAdminUsersClient().restrict(userId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "warning",
        title: t(locale, "adminUsers", "restrictSuccess"),
      });
    },
  });
  const unrestrictMutation = useMutation({
    mutationFn: (userId: string) => getAdminUsersClient().unrestrict(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "adminUsers", "unrestrictSuccess"),
      });
    },
  });

  const columns = useMemo<ColumnDef<AdminUser, unknown>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: t(locale, "adminUsers", "colName"),
      },
      { accessorKey: "email", header: t(locale, "adminUsers", "colEmail") },
      {
        id: "status",
        header: t(locale, "adminUsers", "colStatus"),
        cell: ({ row }) =>
          t(
            locale,
            "adminUsers",
            row.original.restricted ? "status.restricted" : "status.active",
          ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          row.original.restricted ? (
            <Button
              type="button"
              size="sm"
              onClick={() => unrestrictMutation.mutate(row.original.id)}
            >
              {t(locale, "adminUsers", "unrestrict")}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => restrictMutation.mutate(row.original.id)}
            >
              {t(locale, "adminUsers", "restrict")}
            </Button>
          ),
      },
    ],
    [locale, restrictMutation, unrestrictMutation],
  );

  if (sessionQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "adminUsers", "forbidden")} />
      </div>
    );
  }

  return (
    <AdminShell locale={locale} dir={dir} active="users">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "adminUsers", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "adminUsers", "subtitle")}
        </p>
      </header>
      <div className="max-w-md space-y-1.5">
        <Label htmlFor="restrict-reason">
          {t(locale, "adminUsers", "reasonLabel")}
        </Label>
        <Input
          id="restrict-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      {(listQuery.data?.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "adminUsers", "empty")} />
      ) : (
        <SoloDataTable
          data={listQuery.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "adminUsers", "empty")}
        />
      )}
    </AdminShell>
  );
}
