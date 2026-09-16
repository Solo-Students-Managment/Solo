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
import { getAuthClient } from "@/services/auth";
import {
  getCancellationClient,
  type RetentionOffer,
} from "@/services/cancellation";
import { getOrganizationClient } from "@/services/organization";

const keys = createQueryKeyFactory("cancellation");

export function OrganizationCancellationView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
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
    "billing.manage",
  );
  const snapQuery = useQuery({
    queryKey: keys.detail(ctx, "snapshot"),
    queryFn: () => getCancellationClient().get(orgId),
    enabled: canManage.allowed,
  });

  const cancelMutation = useMutation({
    mutationFn: () => getCancellationClient().requestCancel(orgId, { reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "warning",
        title: t(locale, "cancel", "requestCancelSuccess"),
      });
    },
  });

  const refundMutation = useMutation({
    mutationFn: () => getCancellationClient().requestRefund(orgId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "info",
        title: t(locale, "cancel", "requestRefundSuccess"),
      });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (offerId: string) =>
      getCancellationClient().acceptOffer(orgId, offerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "cancel", "acceptOfferSuccess"),
      });
    },
  });

  const columns = useMemo<ColumnDef<RetentionOffer, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "cancel", "colOffer") },
      {
        id: "percent",
        header: t(locale, "cancel", "colPercent"),
        cell: ({ row }) => `${row.original.percentOff}%`,
      },
      {
        id: "action",
        header: "",
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            disabled={acceptMutation.isPending}
            onClick={() => acceptMutation.mutate(row.original.id)}
          >
            {t(locale, "cancel", "acceptOffer")}
          </Button>
        ),
      },
    ],
    [acceptMutation, locale],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data || !canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "cancel", "forbidden")} />
      </div>
    );
  }

  const snap = snapQuery.data;
  const status = snap?.state.status ?? "active";

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="cancellation"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "cancel", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "cancel", "subtitle")}</p>
      </header>

      {snapQuery.isLoading || !snap ? (
        <Skeleton className="h-32" />
      ) : (
        <section
          className="space-y-4"
          aria-label={t(locale, "cancel", "title")}
        >
          <p className="text-sm">
            <span className="text-muted">
              {t(locale, "cancel", "statusLabel")}:{" "}
            </span>
            <strong data-testid="cancel-status">
              {t(locale, "cancel", `status.${status}`)}
            </strong>
          </p>
          {snap.state.refundRequested ? (
            <p className="text-sm" data-testid="refund-pending">
              {t(locale, "cancel", "refundPending")}
            </p>
          ) : null}

          {status === "active" ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="cancel-reason">
                  {t(locale, "cancel", "reasonLabel")}
                </Label>
                <Input
                  id="cancel-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <Button
                type="button"
                disabled={cancelMutation.isPending || reason.trim().length < 3}
                onClick={() => cancelMutation.mutate()}
              >
                {t(locale, "cancel", "requestCancel")}
              </Button>
            </div>
          ) : null}

          {status === "pending_cancel" && !snap.state.refundRequested ? (
            <Button
              type="button"
              disabled={refundMutation.isPending}
              onClick={() => refundMutation.mutate()}
            >
              {t(locale, "cancel", "requestRefund")}
            </Button>
          ) : null}

          <div className="space-y-2">
            <h2 className="font-display text-lg">
              {t(locale, "cancel", "offersTitle")}
            </h2>
            {snap.offers.length === 0 ? (
              <EmptyState title={t(locale, "cancel", "noOffers")} />
            ) : (
              <SoloDataTable
                data={snap.offers}
                columns={columns}
                emptyLabel={t(locale, "cancel", "noOffers")}
              />
            )}
          </div>
        </section>
      )}
    </OrgShell>
  );
}
