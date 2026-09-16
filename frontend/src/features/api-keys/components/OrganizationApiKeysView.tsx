"use client";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { OrgShell } from "@/features/organization";
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
import { getApiKeysClient, type ApiKey } from "@/services/api-keys";
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";

const keys = createQueryKeyFactory("api-keys");

export function OrganizationApiKeysView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [name, setName] = useState("CI bot");
  const [lastSecret, setLastSecret] = useState<string | null>(null);
  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const orgQuery = useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => getOrganizationClient().get(orgId),
  });
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );
  const ctx = {
    personaId: sessionQuery.data?.userId,
    organizationId: orgId,
    subjectId: null,
  };
  const listQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getApiKeysClient().list(orgId),
    enabled: canManage.allowed,
  });
  const createMutation = useMutation({
    mutationFn: () => getApiKeysClient().create(orgId, { name }),
    onSuccess: (created) => {
      setLastSecret(created.secret);
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "apiKeys", "createSuccess"),
      });
    },
  });
  const revokeMutation = useMutation({
    mutationFn: (id: string) => getApiKeysClient().revoke(orgId, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "warning",
        title: t(locale, "apiKeys", "revokeSuccess"),
      });
    },
  });
  const columns = useMemo<ColumnDef<ApiKey, unknown>[]>(
    () => [
      { accessorKey: "name", header: t(locale, "apiKeys", "colName") },
      { accessorKey: "prefix", header: t(locale, "apiKeys", "colPrefix") },
      {
        id: "status",
        header: t(locale, "apiKeys", "colStatus"),
        cell: ({ row }) =>
          t(
            locale,
            "apiKeys",
            row.original.revokedAt ? "status.revoked" : "status.active",
          ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          !row.original.revokedAt ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => revokeMutation.mutate(row.original.id)}
            >
              {t(locale, "apiKeys", "revoke")}
            </Button>
          ) : null,
      },
    ],
    [locale, revokeMutation],
  );
  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data || !canManage.allowed)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "apiKeys", "forbidden")} />
      </div>
    );
  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="apiKeys"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "apiKeys", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "apiKeys", "subtitle")}</p>
      </header>
      <div className="max-w-md space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="key-name">{t(locale, "apiKeys", "nameLabel")}</Label>
          <Input
            id="key-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button type="button" onClick={() => createMutation.mutate()}>
          {t(locale, "apiKeys", "create")}
        </Button>
      </div>
      {lastSecret ? (
        <p data-testid="api-key-secret" className="text-sm">
          <strong>{t(locale, "apiKeys", "secretOnce")}</strong>{" "}
          <code>{lastSecret}</code>
        </p>
      ) : null}
      {(listQuery.data?.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "apiKeys", "empty")} />
      ) : (
        <SoloDataTable
          data={listQuery.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "apiKeys", "empty")}
        />
      )}
    </OrgShell>
  );
}
