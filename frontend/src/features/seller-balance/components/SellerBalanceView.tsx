"use client";

import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { pushFeedback } from "@/components/shared/SoloFeedback";
import { Button, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import {
  getSellerBalanceClient,
  netAfterCommission,
} from "@/services/seller-balance";

const keys = createQueryKeyFactory("seller-balance");
const ctx = { personaId: undefined, organizationId: null, subjectId: null };

export function SellerBalanceView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const balanceQuery = useQuery({
    queryKey: keys.detail(ctx, "balance"),
    queryFn: () => getSellerBalanceClient().getBalance(),
    enabled: Boolean(sessionQuery.data),
  });

  const payoutMutation = useMutation({
    mutationFn: () => getSellerBalanceClient().requestPayout(100000),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "sellerBalance", "payoutSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });
  const disputeMutation = useMutation({
    mutationFn: () =>
      getSellerBalanceClient().openDispute("ord_1", "refund request"),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "sellerBalance", "disputeSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });

  if (!sessionQuery.data && !sessionQuery.isLoading) {
    return (
      <main className="mx-auto max-w-4xl p-6" dir={dir} lang={locale}>
        <EmptyState title={t(locale, "sellerBalance", "signInRequired")} />
      </main>
    );
  }
  if (sessionQuery.isLoading || balanceQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;

  const balance = balanceQuery.data;
  const net = balance
    ? netAfterCommission(balance.available.amount, balance.commissionRate)
    : 0;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "sellerBalance", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "sellerBalance", "subtitle")}
        </p>
      </header>
      {balanceQuery.isError ? (
        <ErrorState title={t(locale, "sellerBalance", "errorTitle")} />
      ) : null}
      {balance ? (
        <div className="border-border bg-elevated space-y-2 rounded-md border p-4 text-sm">
          <p data-testid="balance-available">
            {t(locale, "sellerBalance", "available")}:{" "}
            {balance.available.amount} {balance.available.currency}
          </p>
          <p>
            {t(locale, "sellerBalance", "pending")}: {balance.pending.amount}
          </p>
          <p>
            {t(locale, "sellerBalance", "commission")}:{" "}
            {(balance.commissionRate * 100).toFixed(0)}% · net {net}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" onClick={() => payoutMutation.mutate()}>
              {t(locale, "sellerBalance", "requestPayout")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => disputeMutation.mutate()}
            >
              {t(locale, "sellerBalance", "openDispute")}
            </Button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
