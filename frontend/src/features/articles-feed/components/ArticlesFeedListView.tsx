"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { routes } from "@/lib/routes";
import { getArticlesFeedClient } from "@/services/articles-feed";

const keys = createQueryKeyFactory("articles-feed");
const ctx = { personaId: undefined, organizationId: null, subjectId: null };

export function ArticlesFeedListView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);

  const listQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getArticlesFeedClient().list(),
  });

  if (listQuery.isLoading) return <Skeleton className="m-6 h-40" />;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "articlesFeed", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "articlesFeed", "subtitle")}
        </p>
      </header>
      {listQuery.isError ? (
        <ErrorState title={t(locale, "articlesFeed", "errorTitle")} />
      ) : null}
      {listQuery.data?.length === 0 ? (
        <EmptyState title={t(locale, "articlesFeed", "emptyTitle")} />
      ) : null}
      {listQuery.data && listQuery.data.length > 0 ? (
        <ul
          className="space-y-3"
          aria-label={t(locale, "articlesFeed", "listLabel")}
        >
          {listQuery.data.map((row) => (
            <li
              key={row.id}
              className="border-border bg-elevated rounded-md border p-4"
            >
              <Link
                href={`${routes.public.articlesDetail(row.slug)}?lang=${locale}`}
                className="font-display text-lg font-medium hover:underline"
              >
                {row.title}
              </Link>
              <p className="text-muted mt-1 text-sm">{row.excerpt}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
