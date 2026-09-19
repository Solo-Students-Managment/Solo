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
  getAiGradingClient,
  requiresHumanApproval,
} from "@/services/ai-grading";
const keys = createQueryKeyFactory("ai-grading");
const ctx = { personaId: undefined, organizationId: null, subjectId: null };
export function AiGradingView() {
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
    queryFn: () => getAiGradingClient().list(),
    enabled: Boolean(sessionQuery.data),
  });
  const approveMutation = useMutation({
    mutationFn: (id: string) => getAiGradingClient().approve(id),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "aiGrading", "approveSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });
  if (!sessionQuery.data && !sessionQuery.isLoading)
    return (
      <main className="mx-auto max-w-4xl p-6" dir={dir} lang={locale}>
        <EmptyState title={t(locale, "aiGrading", "signInRequired")} />
      </main>
    );
  if (sessionQuery.isLoading || listQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <p className="text-muted text-sm tracking-wide uppercase">Solo</p>
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "aiGrading", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "aiGrading", "subtitle")}
        </p>
      </header>
      {listQuery.isError ? (
        <ErrorState title={t(locale, "aiGrading", "errorTitle")} />
      ) : null}
      <ul
        className="space-y-3"
        aria-label={t(locale, "aiGrading", "listLabel")}
        data-testid="ai-grading-list"
      >
        {(listQuery.data ?? []).map((row) => (
          <li
            key={row.id}
            className="border-border bg-elevated flex flex-wrap items-center justify-between gap-3 rounded-md border p-4 text-sm"
          >
            <div>
              <p className="font-display text-lg font-medium">
                {row.assignmentTitle} · {row.studentLabel}
              </p>
              <p>
                {t(locale, "aiGrading", "scoreLabel")}: {row.suggestedScore}
              </p>
              <p>
                {t(locale, "aiGrading", "similarityLabel")}:{" "}
                {(row.similarityScore * 100).toFixed(0)}%
              </p>
              <p data-testid={`grade-status-${row.id}`}>{row.status}</p>
            </div>
            {requiresHumanApproval(row) ? (
              <Button
                type="button"
                onClick={() => approveMutation.mutate(row.id)}
              >
                {t(locale, "aiGrading", "approve")}
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
