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
import { getMarketplacePromosClient } from "@/services/marketplace-promos";

const keys = createQueryKeyFactory("marketplace-promos");
const ctx = { personaId: undefined, organizationId: null, subjectId: null };

export function MarketplacePromosView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [code, setCode] = useState("SAVE10");

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const affiliateQuery = useQuery({
    queryKey: keys.detail(ctx, "affiliate"),
    queryFn: () => getMarketplacePromosClient().getAffiliate(),
    enabled: Boolean(sessionQuery.data),
  });
  const wishlistQuery = useQuery({
    queryKey: keys.list(ctx, { wishlist: true }),
    queryFn: () => getMarketplacePromosClient().listWishlist(),
    enabled: Boolean(sessionQuery.data),
  });
  const compareQuery = useQuery({
    queryKey: keys.list(ctx, { compare: true }),
    queryFn: () => getMarketplacePromosClient().listCompare(),
    enabled: Boolean(sessionQuery.data),
  });

  const couponMutation = useMutation({
    mutationFn: () => getMarketplacePromosClient().applyCoupon(code),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "marketplacePromos", "couponSuccess"),
      });
    },
  });
  const wishlistMutation = useMutation({
    mutationFn: () =>
      getMarketplacePromosClient().toggleWishlist("prod_1", "Algebra Workbook"),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) }),
  });
  const compareMutation = useMutation({
    mutationFn: () =>
      getMarketplacePromosClient().addToCompare("prod_1", "Algebra Workbook", {
        amount: 250000,
        currency: "IRR",
      }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) }),
  });

  if (!sessionQuery.data && !sessionQuery.isLoading) {
    return (
      <main className="mx-auto max-w-4xl p-6" dir={dir} lang={locale}>
        <EmptyState title={t(locale, "marketplacePromos", "signInRequired")} />
      </main>
    );
  }
  if (sessionQuery.isLoading) return <Skeleton className="m-6 h-40" />;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "marketplacePromos", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "marketplacePromos", "subtitle")}
        </p>
      </header>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          couponMutation.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="coupon-code">
            {t(locale, "marketplacePromos", "couponLabel")}
          </Label>
          <Input
            id="coupon-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <Button type="submit">
          {t(locale, "marketplacePromos", "applyCoupon")}
        </Button>
      </form>
      {affiliateQuery.data ? (
        <p data-testid="affiliate-code">
          {t(locale, "marketplacePromos", "affiliateLabel")}:{" "}
          {affiliateQuery.data.code}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => wishlistMutation.mutate()}
        >
          {t(locale, "marketplacePromos", "toggleWishlist")} (
          {wishlistQuery.data?.length ?? 0})
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => compareMutation.mutate()}
        >
          {t(locale, "marketplacePromos", "addCompare")} (
          {compareQuery.data?.length ?? 0}/4)
        </Button>
      </div>
      {wishlistQuery.isError || compareQuery.isError ? (
        <ErrorState title={t(locale, "marketplacePromos", "errorTitle")} />
      ) : null}
    </main>
  );
}
