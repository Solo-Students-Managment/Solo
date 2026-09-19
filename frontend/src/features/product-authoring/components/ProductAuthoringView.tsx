"use client";

import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { SoloContentEditor } from "@/components/shared/SoloContentEditor";
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
  canPublish,
  getProductAuthoringClient,
} from "@/services/product-authoring";

const keys = createQueryKeyFactory("product-authoring");

export function ProductAuthoringView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const ctx = { personaId: undefined, organizationId: null, subjectId: null };
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [bodyHtml, setBodyHtml] = useState("<p></p>");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [amount, setAmount] = useState("100000");

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const listQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getProductAuthoringClient().listMine(),
    enabled: Boolean(sessionQuery.data),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      getProductAuthoringClient().create({
        title,
        slug,
        summary: summary || null,
        bodyHtml,
        price: { amount: Number(amount), currency: "IRR" },
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
      }),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "productAuthoring", "createSuccess"),
      });
      setTitle("");
      setSlug("");
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => getProductAuthoringClient().publish(id),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "productAuthoring", "publishSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });

  if (sessionQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (!sessionQuery.data) {
    return (
      <main className="mx-auto max-w-4xl p-6" dir={dir} lang={locale}>
        <EmptyState title={t(locale, "productAuthoring", "signInRequired")} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <p className="text-muted text-sm tracking-wide uppercase">Solo</p>
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "productAuthoring", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "productAuthoring", "subtitle")}
        </p>
      </header>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="prod-title">
              {t(locale, "productAuthoring", "titleLabel")}
            </Label>
            <Input
              id="prod-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prod-slug">
              {t(locale, "productAuthoring", "slugLabel")}
            </Label>
            <Input
              id="prod-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="prod-summary">
            {t(locale, "productAuthoring", "summaryLabel")}
          </Label>
          <Input
            id="prod-summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t(locale, "productAuthoring", "bodyLabel")}</Label>
          <SoloContentEditor initialHtml={bodyHtml} onChange={setBodyHtml} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="prod-price">
              {t(locale, "productAuthoring", "priceLabel")}
            </Label>
            <Input
              id="prod-price"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prod-seo-title">
              {t(locale, "productAuthoring", "seoTitleLabel")}
            </Label>
            <Input
              id="prod-seo-title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prod-seo-desc">
              {t(locale, "productAuthoring", "seoDescriptionLabel")}
            </Label>
            <Input
              id="prod-seo-desc"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" disabled={createMutation.isPending}>
          {t(locale, "productAuthoring", "create")}
        </Button>
      </form>

      {listQuery.isLoading ? <Skeleton className="h-32" /> : null}
      {listQuery.isError ? (
        <ErrorState title={t(locale, "productAuthoring", "errorTitle")} />
      ) : null}
      {listQuery.isSuccess && listQuery.data.length === 0 ? (
        <EmptyState title={t(locale, "productAuthoring", "emptyTitle")} />
      ) : null}
      {listQuery.isSuccess && listQuery.data.length > 0 ? (
        <ul
          className="space-y-3"
          aria-label={t(locale, "productAuthoring", "listLabel")}
        >
          {listQuery.data.map((product) => (
            <li
              key={product.id}
              className="border-border bg-elevated flex flex-wrap items-center justify-between gap-3 rounded-md border p-4"
            >
              <div className="space-y-1 text-sm">
                <p className="font-display text-lg font-medium">
                  {product.title}
                </p>
                <p data-testid={`product-status-${product.id}`}>
                  {t(locale, "productAuthoring", `status.${product.status}`)}
                </p>
                <p>
                  {product.price.amount} {product.price.currency}
                </p>
              </div>
              {canPublish(product) ? (
                <Button
                  type="button"
                  onClick={() => publishMutation.mutate(product.id)}
                >
                  {t(locale, "productAuthoring", "publish")}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
