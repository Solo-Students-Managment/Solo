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
import { getSupportClient, type SupportTicket } from "@/services/support";

const keys = createQueryKeyFactory("support");

export function AdminSupportView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("Billing help");
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
  const ticketsQuery = useQuery({
    queryKey: keys.list(ctx, { kind: "tickets" }),
    queryFn: () => getSupportClient().listTickets(),
    enabled: canManage.allowed,
  });
  const modeQuery = useQuery({
    queryKey: keys.detail(ctx, "mode"),
    queryFn: () => getSupportClient().getSupportMode(),
    enabled: canManage.allowed,
  });

  const openMutation = useMutation({
    mutationFn: () => getSupportClient().openTicket({ subject }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "support", "openSuccess"),
      });
    },
  });
  const enterMutation = useMutation({
    mutationFn: () =>
      getSupportClient().enterSupportMode({
        targetOrgId: "org_support_demo",
        minutes: 30,
      }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) }),
  });
  const exitMutation = useMutation({
    mutationFn: () => getSupportClient().exitSupportMode(),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) }),
  });

  const columns = useMemo<ColumnDef<SupportTicket, unknown>[]>(
    () => [
      { accessorKey: "subject", header: t(locale, "support", "colSubject") },
      { accessorKey: "status", header: t(locale, "support", "colStatus") },
    ],
    [locale],
  );

  if (sessionQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "support", "forbidden")} />
      </div>
    );
  }

  const mode = modeQuery.data;

  return (
    <AdminShell locale={locale} dir={dir} active="support">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "support", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "support", "subtitle")}</p>
      </header>
      <p data-testid="support-mode" className="text-sm">
        {mode?.active
          ? t(locale, "support", "modeActive")
          : t(locale, "support", "modeInactive")}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => enterMutation.mutate()}
          disabled={mode?.active}
        >
          {t(locale, "support", "enterMode")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => exitMutation.mutate()}
          disabled={!mode?.active}
        >
          {t(locale, "support", "exitMode")}
        </Button>
      </div>
      <div className="max-w-md space-y-1.5">
        <Label htmlFor="ticket-subject">
          {t(locale, "support", "subjectLabel")}
        </Label>
        <Input
          id="ticket-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <Button
        type="button"
        onClick={() => openMutation.mutate()}
        disabled={subject.trim().length < 3}
      >
        {t(locale, "support", "openTicket")}
      </Button>
      {(ticketsQuery.data?.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "support", "empty")} />
      ) : (
        <SoloDataTable
          data={ticketsQuery.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "support", "empty")}
        />
      )}
    </AdminShell>
  );
}
