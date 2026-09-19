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
import { getArticlesFeedClient } from "@/services/articles-feed";

const keys = createQueryKeyFactory("articles-feed");
const ctx = { personaId: undefined, organizationId: null, subjectId: null };

type Props = { slug: string };

export function ArticlesFeedDetailView({ slug }: Props) {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const detailQuery = useQuery({
    queryKey: keys.detail(ctx, slug),
    queryFn: () => getArticlesFeedClient().getBySlug(slug),
  });

  const commentMutation = useMutation({
    mutationFn: () =>
      getArticlesFeedClient().addComment(String(detailQuery.data!.id), comment),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "articlesFeed", "commentSuccess"),
      });
      setComment("");
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });
  const bookmarkMutation = useMutation({
    mutationFn: () =>
      getArticlesFeedClient().toggleBookmark(String(detailQuery.data!.id)),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: keys.detail(ctx, slug) }),
  });

  if (detailQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <main className="mx-auto max-w-4xl p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "articlesFeed", "errorTitle")} />
      </main>
    );
  }

  const article = detailQuery.data;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-medium">{article.title}</h1>
        <p className="text-muted text-sm">{article.authorName}</p>
      </header>
      <div
        className="prose text-sm"
        dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
      />
      {sessionQuery.data ? (
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={() => bookmarkMutation.mutate()}
          >
            {t(locale, "articlesFeed", "bookmark")}{" "}
            {article.bookmarked ? "✓" : ""}
          </Button>
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              commentMutation.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="comment-body">
                {t(locale, "articlesFeed", "commentLabel")}
              </Label>
              <Input
                id="comment-body"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>
            <Button type="submit">
              {t(locale, "articlesFeed", "addComment")}
            </Button>
          </form>
        </>
      ) : (
        <EmptyState title={t(locale, "articlesFeed", "signInRequired")} />
      )}
    </main>
  );
}
