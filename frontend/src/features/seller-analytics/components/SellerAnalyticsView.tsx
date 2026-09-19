"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import {
  getSellerAnalyticsClient,
  hasActiveRestrictions,
} from "@/services/seller-analytics";

const keys = createQueryKeyFactory("seller-analytics");
const ctx = { personaId: undefined, organizationId: null, subjectId: null };

export function SellerAnalyticsView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const analyticsQuery = useQuery({
    queryKey: keys.detail(ctx, "analytics"),
    queryFn: () => getSellerAnalyticsClient().get(),
    enabled: Boolean(sessionQuery.data),
  });

  if (!sessionQuery.data && !sessionQuery.isLoading) {
    return (
      <main className="mx-auto max-w-4xl p-6" dir={dir} lang={locale}>
        <EmptyState title={t(locale, "sellerAnalytics", "signInRequired")} />
      </main>
    );
  }
  if (sessionQuery.isLoading || analyticsQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;

  const data = analyticsQuery.data;
  const activeRestrictions = data
    ? hasActiveRestrictions(data.restrictions)
    : [];

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "sellerAnalytics", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "sellerAnalytics", "subtitle")}
        </p>
      </header>
      {analyticsQuery.isError ? (
        <ErrorState title={t(locale, "sellerAnalytics", "errorTitle")} />
      ) : null}
      {data ? (
        <>
          <section data-testid="seller-metrics">
            <h2 className="font-display mb-2 text-lg font-medium">
              {t(locale, "sellerAnalytics", "metricsLabel")}
            </h2>
            <ul className="space-y-1 text-sm">
              <li>
                {t(locale, "sellerAnalytics", "orders")}: {data.metrics.orders}
              </li>
              <li>
                {t(locale, "sellerAnalytics", "revenue")}:{" "}
                {data.metrics.revenue}
              </li>
              <li>
                {t(locale, "sellerAnalytics", "conversion")}:{" "}
                {(data.metrics.conversionRate * 100).toFixed(1)}%
              </li>
            </ul>
          </section>
          <section>
            <h2 className="font-display mb-2 text-lg font-medium">
              {t(locale, "sellerAnalytics", "restrictionsLabel")}
            </h2>
            <ul className="space-y-1 text-sm" data-testid="seller-restrictions">
              {activeRestrictions.map((r) => (
                <li key={r.flag}>
                  {r.flag}: {r.reason}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </main>
  );
}
