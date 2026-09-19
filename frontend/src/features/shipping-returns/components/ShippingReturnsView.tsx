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
import { getShippingReturnsClient } from "@/services/shipping-returns";

const keys = createQueryKeyFactory("shipping-returns");
const ctx = { personaId: undefined, organizationId: null, subjectId: null };

export function ShippingReturnsView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [label, setLabel] = useState("Office");

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const addrQuery = useQuery({
    queryKey: keys.list(ctx, { addresses: true }),
    queryFn: () => getShippingReturnsClient().listAddresses(),
    enabled: Boolean(sessionQuery.data),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      getShippingReturnsClient().createAddress({
        label,
        line1: "789 New St",
        city: "Tehran",
        postalCode: "11111",
        country: "IR",
        isDefault: false,
      }),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "shippingReturns", "actionSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });
  const returnMutation = useMutation({
    mutationFn: () =>
      getShippingReturnsClient().requestReturn("ord_1", "damaged"),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "shippingReturns", "actionSuccess"),
      });
    },
  });

  if (!sessionQuery.data && !sessionQuery.isLoading) {
    return (
      <main className="mx-auto max-w-4xl p-6" dir={dir} lang={locale}>
        <EmptyState title={t(locale, "shippingReturns", "signInRequired")} />
      </main>
    );
  }
  if (sessionQuery.isLoading || addrQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "shippingReturns", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "shippingReturns", "subtitle")}
        </p>
      </header>
      {addrQuery.isError ? (
        <ErrorState title={t(locale, "shippingReturns", "errorTitle")} />
      ) : null}
      <section>
        <h2 className="font-display mb-3 text-lg font-medium">
          {t(locale, "shippingReturns", "addressesLabel")}
        </h2>
        {addrQuery.data?.length === 0 ? (
          <EmptyState title={t(locale, "shippingReturns", "emptyTitle")} />
        ) : null}
        <ul className="mb-4 space-y-2">
          {addrQuery.data?.map((row) => (
            <li
              key={row.id}
              className="border-border bg-elevated rounded-md border p-3 text-sm"
            >
              {row.label}: {row.line1}, {row.city}
            </li>
          ))}
        </ul>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="addr-label">
              {t(locale, "shippingReturns", "addAddress")}
            </Label>
            <Input
              id="addr-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <Button type="submit">
            {t(locale, "shippingReturns", "addAddress")}
          </Button>
        </form>
      </section>
      <Button
        type="button"
        variant="secondary"
        onClick={() => returnMutation.mutate()}
      >
        {t(locale, "shippingReturns", "requestReturn")}
      </Button>
    </main>
  );
}
