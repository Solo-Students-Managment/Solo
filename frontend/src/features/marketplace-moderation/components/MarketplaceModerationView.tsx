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
  getMarketplaceModerationClient,
  isPending,
} from "@/services/marketplace-moderation";

const keys = createQueryKeyFactory("marketplace-moderation");
const ctx = { personaId: undefined, organizationId: null, subjectId: null };

export function MarketplaceModerationView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const queueQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getMarketplaceModerationClient().listQueue(),
    enabled: Boolean(sessionQuery.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => getMarketplaceModerationClient().approve(id),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "marketplaceModeration", "approveSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) =>
      getMarketplaceModerationClient().reject(id, "policy"),
    onSuccess: () => {
      pushFeedback({
        tone: "warning",
        title: t(locale, "marketplaceModeration", "rejectSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });

  if (!sessionQuery.data && !sessionQuery.isLoading) {
    return (
      <main className="mx-auto max-w-4xl p-6" dir={dir} lang={locale}>
        <EmptyState
          title={t(locale, "marketplaceModeration", "signInRequired")}
        />
      </main>
    );
  }
  if (sessionQuery.isLoading || queueQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <p className="text-muted text-sm tracking-wide uppercase">Solo</p>
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "marketplaceModeration", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "marketplaceModeration", "subtitle")}
        </p>
      </header>
      {queueQuery.isError ? (
        <ErrorState title={t(locale, "marketplaceModeration", "errorTitle")} />
      ) : null}
      {queueQuery.data?.length === 0 ? (
        <EmptyState title={t(locale, "marketplaceModeration", "emptyTitle")} />
      ) : null}
      {queueQuery.data && queueQuery.data.length > 0 ? (
        <ul
          className="space-y-3"
          aria-label={t(locale, "marketplaceModeration", "queueLabel")}
        >
          {queueQuery.data.map((row) => (
            <li
              key={row.id}
              className="border-border bg-elevated flex flex-wrap items-center justify-between gap-3 rounded-md border p-4 text-sm"
            >
              <div>
                <p className="font-display font-medium">{row.title}</p>
                <p data-testid={`mod-status-${row.id}`}>
                  {row.type} · {row.sellerName} · {row.status}
                </p>
              </div>
              {isPending(row) ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => approveMutation.mutate(row.id)}
                  >
                    {t(locale, "marketplaceModeration", "approve")}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => rejectMutation.mutate(row.id)}
                  >
                    {t(locale, "marketplaceModeration", "reject")}
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
