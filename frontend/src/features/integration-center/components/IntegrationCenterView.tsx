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
  getIntegrationCenterClient,
  passedCount,
} from "@/services/integration-center";
const keys = createQueryKeyFactory("integration-center");
const ctx = { personaId: undefined, organizationId: null, subjectId: null };
export function IntegrationCenterView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const listQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getIntegrationCenterClient().list(),
    enabled: Boolean(sessionQuery.data),
  });
  const passMutation = useMutation({
    mutationFn: (id: string) => getIntegrationCenterClient().markPass(id),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "integrationCenter", "actionSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });
  if (!sessionQuery.data && !sessionQuery.isLoading)
    return (
      <main className="mx-auto max-w-4xl p-6" dir={dir} lang={locale}>
        <EmptyState title={t(locale, "integrationCenter", "signInRequired")} />
      </main>
    );
  if (sessionQuery.isLoading || listQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  const items = listQuery.data ?? [];
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <p className="text-muted text-sm tracking-wide uppercase">Solo</p>
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "integrationCenter", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "integrationCenter", "subtitle")}
        </p>
        <p data-testid="integration-center-passed">
          {t(locale, "integrationCenter", "passedLabel")}: {passedCount(items)}
        </p>
      </header>
      {listQuery.isError ? (
        <ErrorState title={t(locale, "integrationCenter", "errorTitle")} />
      ) : null}
      <ul
        className="space-y-3"
        aria-label={t(locale, "integrationCenter", "listLabel")}
        data-testid="integration-center-list"
      >
        {items.map((row) => (
          <li
            key={row.id}
            className="border-border bg-elevated flex flex-wrap items-center justify-between gap-3 rounded-md border p-4 text-sm"
          >
            <div>
              <p className="font-medium">{row.title}</p>
              <p className="text-muted">{row.detail}</p>
              <p data-testid={`integration-center-status-${row.id}`}>
                {row.status}
              </p>
            </div>
            {row.status !== "pass" ? (
              <Button type="button" onClick={() => passMutation.mutate(row.id)}>
                {t(locale, "integrationCenter", "markPass")}
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
