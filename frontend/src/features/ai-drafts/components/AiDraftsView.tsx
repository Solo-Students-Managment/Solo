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
import { canApprove, getAiDraftsClient } from "@/services/ai-drafts";

const keys = createQueryKeyFactory("ai-drafts");
const ctx = { personaId: undefined, organizationId: null, subjectId: null };

export function AiDraftsView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("Geometry lesson draft");
  const [content, setContent] = useState("Draft content requiring review");

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const listQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getAiDraftsClient().list(),
    enabled: Boolean(sessionQuery.data),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      getAiDraftsClient().create({ type: "lesson", title, content }),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "aiDrafts", "createSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });
  const approveMutation = useMutation({
    mutationFn: (id: string) => getAiDraftsClient().approve(id),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "aiDrafts", "approveSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });
  const submitMutation = useMutation({
    mutationFn: (id: string) => getAiDraftsClient().submitForReview(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) }),
  });

  if (!sessionQuery.data && !sessionQuery.isLoading) {
    return (
      <main className="mx-auto max-w-4xl p-6" dir={dir} lang={locale}>
        <EmptyState title={t(locale, "aiDrafts", "signInRequired")} />
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
          {t(locale, "aiDrafts", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "aiDrafts", "subtitle")}
        </p>
        <p className="text-muted text-xs" role="note">
          {t(locale, "aiDrafts", "reviewNote")}
        </p>
      </header>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="draft-title">
            {t(locale, "aiDrafts", "titleLabel")}
          </Label>
          <Input
            id="draft-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="draft-content">
            {t(locale, "aiDrafts", "contentLabel")}
          </Label>
          <textarea
            id="draft-content"
            className="border-border bg-elevated min-h-24 w-full rounded-md border p-2 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <Button type="submit">{t(locale, "aiDrafts", "create")}</Button>
      </form>
      {listQuery.isError ? (
        <ErrorState title={t(locale, "aiDrafts", "errorTitle")} />
      ) : null}
      {listQuery.data?.length === 0 ? (
        <EmptyState title={t(locale, "aiDrafts", "emptyTitle")} />
      ) : null}
      {listQuery.data && listQuery.data.length > 0 ? (
        <ul
          className="space-y-3"
          aria-label={t(locale, "aiDrafts", "listLabel")}
        >
          {listQuery.data.map((row) => (
            <li
              key={row.id}
              className="border-border bg-elevated flex flex-wrap items-center justify-between gap-3 rounded-md border p-4"
            >
              <div className="space-y-1 text-sm">
                <p className="font-display text-lg font-medium">{row.title}</p>
                <p data-testid={`draft-status-${row.id}`}>{row.status}</p>
              </div>
              <div className="flex gap-2">
                {row.status === "draft" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => submitMutation.mutate(row.id)}
                  >
                    {t(locale, "aiDrafts", "submit")}
                  </Button>
                ) : null}
                {canApprove(row) ? (
                  <Button
                    type="button"
                    onClick={() => approveMutation.mutate(row.id)}
                  >
                    {t(locale, "aiDrafts", "approve")}
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
