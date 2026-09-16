"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";

import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { OrgShell } from "@/features/organization";
import { Button, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import { formatInvoiceMoney } from "@/services/billing";
import {
  getCheckoutClient,
  type CheckoutProvider,
  type CheckoutSession,
  type PaymentProvider,
} from "@/services/checkout";
import { getOrganizationClient } from "@/services/organization";

const keys = createQueryKeyFactory("checkout");

export function OrganizationCheckoutView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const ctx = {
    personaId: undefined as string | undefined,
    organizationId: orgId,
    subjectId: null,
  };

  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  ctx.personaId = sessionQuery.data?.userId;
  const orgQuery = useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => getOrganizationClient().get(orgId),
  });
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "billing.manage",
  );
  const providersQuery = useQuery({
    queryKey: keys.detail(ctx, "providers"),
    queryFn: () => getCheckoutClient().listProviders(orgId),
    enabled: canManage.allowed,
  });
  const sessionsQuery = useQuery({
    queryKey: keys.list(ctx, { kind: "sessions" }),
    queryFn: () => getCheckoutClient().listSessions(orgId),
    enabled: canManage.allowed,
  });

  const createMutation = useMutation({
    mutationFn: (provider: PaymentProvider) =>
      getCheckoutClient().createSession(orgId, { provider }),
    onSuccess: (session) => {
      setActiveSessionId(session.id);
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "info",
        title: t(locale, "checkout", "sessionCreated"),
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (sessionId: string) =>
      getCheckoutClient().completeSession(orgId, sessionId),
    onSuccess: () => {
      setActiveSessionId(null);
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "checkout", "sessionCompleted"),
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (sessionId: string) =>
      getCheckoutClient().cancelSession(orgId, sessionId),
    onSuccess: () => {
      setActiveSessionId(null);
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "warning",
        title: t(locale, "checkout", "sessionCancelled"),
      });
    },
  });

  const providerColumns = useMemo<ColumnDef<CheckoutProvider, unknown>[]>(
    () => [
      { accessorKey: "label", header: t(locale, "checkout", "colProvider") },
      {
        id: "available",
        header: t(locale, "checkout", "colAvailable"),
        cell: ({ row }) =>
          row.original.available
            ? t(locale, "checkout", "available")
            : t(locale, "checkout", "unavailable"),
      },
      {
        id: "action",
        header: "",
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            disabled={!row.original.available || createMutation.isPending}
            onClick={() => createMutation.mutate(row.original.id)}
          >
            {t(locale, "checkout", "startCheckout")}
          </Button>
        ),
      },
    ],
    [createMutation.isPending, createMutation.mutate, locale],
  );

  const sessionColumns = useMemo<ColumnDef<CheckoutSession, unknown>[]>(
    () => [
      { accessorKey: "provider", header: t(locale, "checkout", "colProvider") },
      {
        id: "status",
        header: t(locale, "checkout", "colStatus"),
        cell: ({ row }) =>
          t(locale, "checkout", `status.${row.original.status}`),
      },
      {
        id: "amount",
        header: t(locale, "checkout", "colAmount"),
        cell: ({ row }) =>
          formatInvoiceMoney(
            row.original.amount.amount,
            row.original.amount.currency as "IRR" | "USD",
          ),
      },
      {
        id: "created",
        header: t(locale, "checkout", "colCreated"),
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(locale),
      },
      {
        id: "action",
        header: "",
        cell: ({ row }) =>
          row.original.status === "pending" ? (
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                disabled={completeMutation.isPending}
                onClick={() => completeMutation.mutate(row.original.id)}
              >
                {t(locale, "checkout", "completePayment")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(row.original.id)}
              >
                {t(locale, "checkout", "cancelSession")}
              </Button>
            </div>
          ) : null,
      },
    ],
    [
      cancelMutation.isPending,
      cancelMutation.mutate,
      completeMutation.isPending,
      completeMutation.mutate,
      locale,
    ],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data || !canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "checkout", "forbidden")} />
      </div>
    );
  }

  const sessions = sessionsQuery.data ?? [];

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="checkout"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "checkout", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "checkout", "subtitle")}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">
          {t(locale, "checkout", "providersTitle")}
        </h2>
        {providersQuery.isLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <SoloDataTable
            columns={providerColumns}
            data={providersQuery.data ?? []}
          />
        )}
      </section>

      {activeSessionId ? (
        <p className="text-brand text-sm" data-testid="active-checkout-session">
          {activeSessionId}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">
          {t(locale, "checkout", "sessionsTitle")}
        </h2>
        {sessionsQuery.isLoading ? (
          <Skeleton className="h-32" />
        ) : sessions.length === 0 ? (
          <EmptyState title={t(locale, "checkout", "emptySessions")} />
        ) : (
          <SoloDataTable columns={sessionColumns} data={sessions} />
        )}
      </section>
    </OrgShell>
  );
}
