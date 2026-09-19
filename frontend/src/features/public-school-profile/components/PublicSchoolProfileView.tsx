"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";

import { ErrorState, Skeleton } from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getPublicSchoolProfileClient } from "@/services/public-school-profile";

const keys = createQueryKeyFactory("public-school-profile");

export function PublicSchoolProfileView({ slug }: { slug?: string }) {
  const params = useParams<{ slug: string }>();
  const resolvedSlug = slug ?? params.slug;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);

  const profileQuery = useQuery({
    queryKey: keys.detail(
      { personaId: undefined, organizationId: null, subjectId: null },
      resolvedSlug,
    ),
    queryFn: async () => {
      try {
        return await getPublicSchoolProfileClient().getBySlug(resolvedSlug);
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "not_found");
      }
    },
    retry: false,
  });

  if (profileQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (profileQuery.isError) {
    const reason = profileQuery.error.message;
    const titleKey =
      reason === "unpublished"
        ? "unpublishedTitle"
        : reason === "moderated"
          ? "moderatedTitle"
          : "notFoundTitle";
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "publicSchoolProfile", titleKey)} />
      </main>
    );
  }

  const profile = profileQuery.data!;
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <p className="text-muted text-sm tracking-wide uppercase">Solo</p>
        <p className="text-muted text-sm">
          {t(locale, "publicSchoolProfile", `kind.${profile.kind}`)}
        </p>
        <h1 className="font-display text-3xl font-medium">
          {profile.displayName}
        </h1>
        {profile.headline ? (
          <p className="text-muted text-lg">{profile.headline}</p>
        ) : null}
      </header>
      {profile.about ? (
        <section aria-label={t(locale, "publicSchoolProfile", "about")}>
          <h2 className="font-display text-lg">
            {t(locale, "publicSchoolProfile", "about")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed">{profile.about}</p>
        </section>
      ) : null}
      {profile.city ? (
        <p className="text-muted text-sm" data-testid="school-city">
          {t(locale, "publicSchoolProfile", "city")}: {profile.city}
        </p>
      ) : null}
    </main>
  );
}
