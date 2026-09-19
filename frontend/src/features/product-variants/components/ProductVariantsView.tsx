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
import {
  getProductVariantsClient,
  isInStock,
} from "@/services/product-variants";

const keys = createQueryKeyFactory("product-variants");
const PRODUCT_ID = "prod_draft_1";

export function ProductVariantsView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const ctx = { personaId: undefined, organizationId: null, subjectId: null };
  const [sku, setSku] = useState("");
  const [label, setLabel] = useState("");

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const listQuery = useQuery({
    queryKey: keys.list(ctx, { PRODUCT_ID }),
    queryFn: () => getProductVariantsClient().list(PRODUCT_ID),
    enabled: Boolean(sessionQuery.data),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      getProductVariantsClient().create({
        productId: PRODUCT_ID,
        sku,
        label,
        inventory: 5,
        price: { amount: 200000, currency: "IRR" },
        delivery: "physical",
      }),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "productVariants", "actionSuccess"),
      });
      setSku("");
      setLabel("");
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });

  const adjustMutation = useMutation({
    mutationFn: (id: string) =>
      getProductVariantsClient().adjustInventory(id, -1),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });

  if (!sessionQuery.data && !sessionQuery.isLoading) {
    return (
      <main className="mx-auto max-w-4xl p-6" dir={dir} lang={locale}>
        <EmptyState title={t(locale, "productVariants", "signInRequired")} />
      </main>
    );
  }
  if (sessionQuery.isLoading || listQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <p className="text-muted text-sm tracking-wide uppercase">Solo</p>
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "productVariants", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "productVariants", "subtitle")}
        </p>
      </header>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="var-sku">
            {t(locale, "productVariants", "skuLabel")}
          </Label>
          <Input
            id="var-sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="var-label">
            {t(locale, "productVariants", "labelLabel")}
          </Label>
          <Input
            id="var-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
        </div>
        <Button type="submit">{t(locale, "productVariants", "create")}</Button>
      </form>
      {listQuery.isError ? (
        <ErrorState title={t(locale, "productVariants", "errorTitle")} />
      ) : null}
      {listQuery.data && listQuery.data.length === 0 ? (
        <EmptyState title={t(locale, "productVariants", "emptyTitle")} />
      ) : null}
      {listQuery.data && listQuery.data.length > 0 ? (
        <ul
          className="space-y-3"
          aria-label={t(locale, "productVariants", "listLabel")}
        >
          {listQuery.data.map((row) => (
            <li
              key={row.id}
              className="border-border bg-elevated flex flex-wrap items-center justify-between gap-3 rounded-md border p-4"
            >
              <div className="space-y-1 text-sm">
                <p className="font-display text-lg font-medium">{row.label}</p>
                <p>
                  {row.sku} · {row.delivery} · inv {row.inventory}
                </p>
                <p data-testid={`stock-${row.id}`}>
                  {isInStock(row)
                    ? t(locale, "productVariants", "inStock")
                    : t(locale, "productVariants", "outOfStock")}
                </p>
              </div>
              {row.delivery === "physical" ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => adjustMutation.mutate(row.id)}
                >
                  {t(locale, "productVariants", "decrement")}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
