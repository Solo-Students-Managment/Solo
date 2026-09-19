"use client";

import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { pushFeedback } from "@/components/shared/SoloFeedback";
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Label,
  Skeleton,
} from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import { getMarketplaceTaxonomyClient } from "@/services/marketplace-taxonomy";

const keys = createQueryKeyFactory("marketplace-taxonomy");
const ctx = { personaId: undefined, organizationId: null, subjectId: null };
const PRODUCT_ID = "prod_draft_1";

export function MarketplaceTaxonomyView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [name, setName] = useState("Science");

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const catsQuery = useQuery({
    queryKey: keys.list(ctx, { categories: true }),
    queryFn: () => getMarketplaceTaxonomyClient().listCategories(),
    enabled: Boolean(sessionQuery.data),
  });
  const brandsQuery = useQuery({
    queryKey: keys.list(ctx, { brands: true }),
    queryFn: () => getMarketplaceTaxonomyClient().listBrands(),
    enabled: Boolean(sessionQuery.data),
  });
  const historyQuery = useQuery({
    queryKey: keys.list(ctx, { priceHistory: PRODUCT_ID }),
    queryFn: () => getMarketplaceTaxonomyClient().listPriceHistory(PRODUCT_ID),
    enabled: Boolean(sessionQuery.data),
  });

  const createMutation = useMutation({
    mutationFn: () => getMarketplaceTaxonomyClient().createCategory(name),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "marketplaceTaxonomy", "actionSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });
  const priceMutation = useMutation({
    mutationFn: () =>
      getMarketplaceTaxonomyClient().addPriceHistory(PRODUCT_ID, {
        amount: 300000,
        currency: "EUR",
      }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) }),
  });

  if (!sessionQuery.data && !sessionQuery.isLoading) {
    return (
      <main className="mx-auto max-w-4xl p-6" dir={dir} lang={locale}>
        <EmptyState
          title={t(locale, "marketplaceTaxonomy", "signInRequired")}
        />
      </main>
    );
  }
  if (sessionQuery.isLoading || catsQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "marketplaceTaxonomy", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "marketplaceTaxonomy", "subtitle")}
        </p>
      </header>
      {catsQuery.isError ? (
        <ErrorState title={t(locale, "marketplaceTaxonomy", "errorTitle")} />
      ) : null}
      <section>
        <h2 className="font-display mb-2 text-lg font-medium">
          {t(locale, "marketplaceTaxonomy", "categoriesLabel")}
        </h2>
        <ul className="mb-3 space-y-1 text-sm">
          {catsQuery.data?.map((row) => (
            <li key={row.id}>{row.name}</li>
          ))}
        </ul>
        <h2 className="font-display mb-2 text-lg font-medium">
          {t(locale, "marketplaceTaxonomy", "brandsLabel")}
        </h2>
        <ul className="mb-3 space-y-1 text-sm">
          {brandsQuery.data?.map((row) => (
            <li key={row.id}>{row.name}</li>
          ))}
        </ul>
      </section>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="tax-name">
            {t(locale, "marketplaceTaxonomy", "nameLabel")}
          </Label>
          <Input
            id="tax-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button type="submit">
          {t(locale, "marketplaceTaxonomy", "create")}
        </Button>
      </form>
      <section>
        <h2 className="font-display mb-2 text-lg font-medium">
          {t(locale, "marketplaceTaxonomy", "priceHistoryLabel")}
        </h2>
        <ul className="mb-2 space-y-1 text-sm" data-testid="price-history">
          {historyQuery.data?.map((row) => (
            <li key={row.id}>
              {row.price.amount} {row.price.currency}
            </li>
          ))}
        </ul>
        <Button
          type="button"
          variant="secondary"
          onClick={() => priceMutation.mutate()}
        >
          {t(locale, "marketplaceTaxonomy", "addPrice")}
        </Button>
      </section>
    </main>
  );
}
