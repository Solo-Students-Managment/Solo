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
  getAdvancedAutomationClient,
  passedCount,
} from "@/services/advanced-automation";
const keys = createQueryKeyFactory("advanced-automation");
const ctx = { personaId: undefined, organizationId: null, subjectId: null };
export function AdvancedAutomationView() {
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
    queryFn: () => getAdvancedAutomationClient().list(),
    enabled: Boolean(sessionQuery.data),
  });
  const passMutation = useMutation({
    mutationFn: (id: string) => getAdvancedAutomationClient().markPass(id),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "advancedAutomation", "actionSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });
  if (!sessionQuery.data && !sessionQuery.isLoading)
    return (
      <main className="mx-auto max-w-4xl p-6" dir={dir} lang={locale}>
        <EmptyState title={t(locale, "advancedAutomation", "signInRequired")} />
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
          {t(locale, "advancedAutomation", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "advancedAutomation", "subtitle")}
        </p>
        <p data-testid="advanced-automation-passed">
          {t(locale, "advancedAutomation", "passedLabel")}: {passedCount(items)}
        </p>
      </header>
      {listQuery.isError ? (
        <ErrorState title={t(locale, "advancedAutomation", "errorTitle")} />
      ) : null}
      <ul
        className="space-y-3"
        aria-label={t(locale, "advancedAutomation", "listLabel")}
        data-testid="advanced-automation-list"
      >
        {items.map((row) => (
          <li
            key={row.id}
            className="border-border bg-elevated flex flex-wrap items-center justify-between gap-3 rounded-md border p-4 text-sm"
          >
            <div>
              <p className="font-medium">{row.title}</p>
              <p className="text-muted">{row.detail}</p>
              <p data-testid={`advanced-automation-status-${row.id}`}>
                {row.status}
              </p>
            </div>
            {row.status !== "pass" ? (
              <Button type="button" onClick={() => passMutation.mutate(row.id)}>
                {t(locale, "advancedAutomation", "markPass")}
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
