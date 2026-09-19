"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import { getMarketplaceOrdersClient } from "@/services/marketplace-orders";

const keys = createQueryKeyFactory("marketplace-orders");
const ctx = { personaId: undefined, organizationId: null, subjectId: null };

export function MarketplaceOrdersView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const listQuery = useQuery({
    queryKey: keys.list(ctx, { buyer: true }),
    queryFn: () => getMarketplaceOrdersClient().listBuyer(),
    enabled: Boolean(sessionQuery.data),
  });

  if (!sessionQuery.data && !sessionQuery.isLoading) {
    return (
      <main className="mx-auto max-w-4xl p-6" dir={dir} lang={locale}>
        <EmptyState title={t(locale, "marketplaceOrders", "signInRequired")} />
      </main>
    );
  }
  if (sessionQuery.isLoading || listQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "marketplaceOrders", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "marketplaceOrders", "subtitle")}
        </p>
      </header>
      {listQuery.isError ? (
        <ErrorState title={t(locale, "marketplaceOrders", "errorTitle")} />
      ) : null}
      {listQuery.data?.length === 0 ? (
        <EmptyState title={t(locale, "marketplaceOrders", "emptyTitle")} />
      ) : null}
      {listQuery.data && listQuery.data.length > 0 ? (
        <ul
          className="space-y-3"
          aria-label={t(locale, "marketplaceOrders", "listLabel")}
        >
          {listQuery.data.map((row) => (
            <li
              key={row.id}
              className="border-border bg-elevated rounded-md border p-4 text-sm"
            >
              <p className="font-display font-medium">{row.productTitle}</p>
              <p>
                {row.sellerName} · {t(locale, "marketplaceOrders", "status")}:{" "}
                {row.status}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
