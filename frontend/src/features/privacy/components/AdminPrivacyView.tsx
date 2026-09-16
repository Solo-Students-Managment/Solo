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
import { getPrivacyClient, type PrivacyRequest } from "@/services/privacy";

const keys = createQueryKeyFactory("privacy");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

export function AdminPrivacyView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("user@example.com");
  const [type, setType] = useState<"export" | "delete">("export");
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
    queryFn: () => getPrivacyClient().list(),
    enabled: canManage.allowed,
  });
  const submitMutation = useMutation({
    mutationFn: () => getPrivacyClient().submit({ type, subjectEmail: email }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "privacy", "submitSuccess"),
      });
    },
  });
  const completeMutation = useMutation({
    mutationFn: (id: string) => getPrivacyClient().complete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "info",
        title: t(locale, "privacy", "completeSuccess"),
      });
    },
  });
  const columns = useMemo<ColumnDef<PrivacyRequest, unknown>[]>(
    () => [
      { accessorKey: "subjectEmail", header: t(locale, "privacy", "colEmail") },
      {
        id: "type",
        header: t(locale, "privacy", "colType"),
        cell: ({ row }) => t(locale, "privacy", `type.${row.original.type}`),
      },
      { accessorKey: "status", header: t(locale, "privacy", "colStatus") },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          row.original.status !== "completed" ? (
            <Button
              type="button"
              size="sm"
              onClick={() => completeMutation.mutate(row.original.id)}
            >
              {t(locale, "privacy", "complete")}
            </Button>
          ) : null,
      },
    ],
    [completeMutation, locale],
  );
  if (sessionQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (!canManage.allowed)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "privacy", "forbidden")} />
      </div>
    );
  return (
    <AdminShell locale={locale} dir={dir} active="privacy">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "privacy", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "privacy", "subtitle")}</p>
      </header>
      <div className="max-w-md space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="prv-email">
            {t(locale, "privacy", "emailLabel")}
          </Label>
          <Input
            id="prv-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="prv-type">{t(locale, "privacy", "typeLabel")}</Label>
          <select
            id="prv-type"
            className={selectClassName}
            value={type}
            onChange={(e) => setType(e.target.value as "export" | "delete")}
          >
            <option value="export">
              {t(locale, "privacy", "type.export")}
            </option>
            <option value="delete">
              {t(locale, "privacy", "type.delete")}
            </option>
          </select>
        </div>
        <Button type="button" onClick={() => submitMutation.mutate()}>
          {t(locale, "privacy", "submit")}
        </Button>
      </div>
      {(listQuery.data?.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "privacy", "empty")} />
      ) : (
        <SoloDataTable
          data={listQuery.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "privacy", "empty")}
        />
      )}
    </AdminShell>
  );
}
