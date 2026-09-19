"use client";

import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { pushFeedback } from "@/components/shared/SoloFeedback";
import { Button, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import { getWalletClient } from "@/services/wallet";

const keys = createQueryKeyFactory("wallet");
const ctx = { personaId: undefined, organizationId: null, subjectId: null };

export function WalletView() {
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
    queryFn: () => getWalletClient().getBalance(),
    enabled: Boolean(sessionQuery.data),
  });
  const ledgerQuery = useQuery({
    queryKey: keys.list(ctx, { ledger: true }),
    queryFn: () => getWalletClient().listLedger(),
    enabled: Boolean(sessionQuery.data),
  });

  const applyMutation = useMutation({
    mutationFn: () => getWalletClient().applyCreditAtCheckout(50000),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "wallet", "applySuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });

  if (!sessionQuery.data && !sessionQuery.isLoading) {
    return (
      <main className="mx-auto max-w-4xl p-6" dir={dir} lang={locale}>
        <EmptyState title={t(locale, "wallet", "signInRequired")} />
      </main>
    );
  }
  if (sessionQuery.isLoading || balanceQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "wallet", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "wallet", "subtitle")}</p>
      </header>
      {balanceQuery.isError ? (
        <ErrorState title={t(locale, "wallet", "errorTitle")} />
      ) : null}
      {balanceQuery.data ? (
        <p className="text-sm" data-testid="wallet-balance">
          {t(locale, "wallet", "balanceLabel")}:{" "}
          {balanceQuery.data.available.amount}{" "}
          {balanceQuery.data.available.currency}
        </p>
      ) : null}
      <section>
        <h2 className="font-display mb-2 text-lg font-medium">
          {t(locale, "wallet", "ledgerLabel")}
        </h2>
        {ledgerQuery.data?.length === 0 ? (
          <EmptyState title={t(locale, "wallet", "emptyTitle")} />
        ) : null}
        <ul className="space-y-1 text-sm">
          {ledgerQuery.data?.map((row) => (
            <li key={row.id}>
              {row.type}: {row.amount.amount} — {row.description}
            </li>
          ))}
        </ul>
      </section>
      <Button type="button" onClick={() => applyMutation.mutate()}>
        {t(locale, "wallet", "applyCredit")}
      </Button>
    </main>
  );
}
