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
  cartTotal,
  getMarketplaceCartClient,
  groupBySeller,
} from "@/services/marketplace-cart";

const keys = createQueryKeyFactory("marketplace-cart");
const ctx = { personaId: undefined, organizationId: null, subjectId: null };

export function MarketplaceCartView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const cartQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getMarketplaceCartClient().list(),
    enabled: Boolean(sessionQuery.data),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => getMarketplaceCartClient().remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) }),
  });
  const checkoutMutation = useMutation({
    mutationFn: () => getMarketplaceCartClient().checkout(),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "marketplaceCart", "checkoutSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });

  if (!sessionQuery.data && !sessionQuery.isLoading) {
    return (
      <main className="mx-auto max-w-4xl p-6" dir={dir} lang={locale}>
        <EmptyState title={t(locale, "marketplaceCart", "signInRequired")} />
      </main>
    );
  }
  if (sessionQuery.isLoading || cartQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;

  const items = cartQuery.data?.items ?? [];
  const groups = groupBySeller(items);
  const total = cartTotal(items);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <p className="text-muted text-sm tracking-wide uppercase">Solo</p>
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "marketplaceCart", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "marketplaceCart", "subtitle")}
        </p>
      </header>
      {cartQuery.isError ? (
        <ErrorState title={t(locale, "marketplaceCart", "errorTitle")} />
      ) : null}
      {items.length === 0 ? (
        <EmptyState title={t(locale, "marketplaceCart", "emptyTitle")} />
      ) : null}
      {items.length > 0 ? (
        <>
          <ul
            className="space-y-6"
            aria-label={t(locale, "marketplaceCart", "listLabel")}
          >
            {Array.from(groups.entries()).map(([sellerId, sellerItems]) => (
              <li
                key={sellerId}
                className="border-border bg-elevated rounded-md border p-4"
              >
                <p className="font-display mb-3 font-medium">
                  {t(locale, "marketplaceCart", "sellerGroup")}:{" "}
                  {sellerItems[0]?.sellerName}
                </p>
                <ul className="space-y-2">
                  {sellerItems.map((row) => (
                    <li
                      key={row.id}
                      className="flex flex-wrap items-center justify-between gap-2 text-sm"
                    >
                      <span>
                        {row.productTitle} × {row.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => removeMutation.mutate(row.id)}
                      >
                        {t(locale, "marketplaceCart", "remove")}
                      </Button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <p className="text-sm" data-testid="cart-total">
            {t(locale, "marketplaceCart", "total")}: {total.amount}{" "}
            {total.currency}
          </p>
          <Button type="button" onClick={() => checkoutMutation.mutate()}>
            {t(locale, "marketplaceCart", "checkout")}
          </Button>
        </>
      ) : null}
    </main>
  );
}
