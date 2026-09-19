"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";

import { ErrorState, Skeleton } from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getPublicStudentPortfolioClient } from "@/services/public-student-portfolio";

const keys = createQueryKeyFactory("public-student-portfolio");

export function PublicStudentPortfolioView({ slug }: { slug?: string }) {
  const params = useParams<{ slug: string }>();
  const resolvedSlug = slug ?? params.slug;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);

  const query = useQuery({
    queryKey: keys.detail(
      { personaId: undefined, organizationId: null, subjectId: null },
      resolvedSlug,
    ),
    queryFn: async () => {
      try {
        return await getPublicStudentPortfolioClient().getBySlug(resolvedSlug);
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "not_found");
      }
    },
    retry: false,
  });

  if (query.isLoading) return <Skeleton className="m-6 h-40" />;
  if (query.isError) {
    const reason = query.error.message;
    return (
      <main className="mx-auto max-w-3xl p-6" dir={dir} lang={locale}>
        <ErrorState
          title={t(
            locale,
            "publicStudentPortfolio",
            reason === "unpublished" ? "unpublishedTitle" : "notFoundTitle",
          )}
        />
      </main>
    );
  }

  const portfolio = query.data!;
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <p className="text-muted text-sm tracking-wide uppercase">Solo</p>
        <h1 className="font-display text-3xl font-medium">
          {portfolio.displayName}
        </h1>
        {portfolio.headline ? (
          <p className="text-muted text-lg">{portfolio.headline}</p>
        ) : null}
        {portfolio.isMinor ? (
          <p className="text-muted text-xs" data-testid="minor-notice">
            {t(locale, "publicStudentPortfolio", "minorNotice")}
          </p>
        ) : null}
      </header>
      {portfolio.about ? (
        <p className="text-sm leading-relaxed">{portfolio.about}</p>
      ) : null}
      <section aria-label={t(locale, "publicStudentPortfolio", "interests")}>
        <h2 className="font-display text-lg">
          {t(locale, "publicStudentPortfolio", "interests")}
        </h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {portfolio.interests.map((interest) => (
            <li
              key={interest}
              className="border-border bg-elevated rounded-md border px-3 py-1 text-sm"
            >
              {interest}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
