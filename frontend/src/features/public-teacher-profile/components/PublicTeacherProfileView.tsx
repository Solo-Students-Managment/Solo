"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";

import { EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getPublicTeacherProfileClient } from "@/services/public-teacher-profile";

const keys = createQueryKeyFactory("public-teacher-profile");

export function PublicTeacherProfileView() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);

  const profileQuery = useQuery({
    queryKey: keys.detail(
      { personaId: undefined, organizationId: null, subjectId: null },
      slug,
    ),
    queryFn: async () => {
      try {
        return await getPublicTeacherProfileClient().getBySlug(slug);
      } catch (error) {
        const message = error instanceof Error ? error.message : "not_found";
        throw new Error(message);
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
    const bodyKey =
      reason === "unpublished"
        ? "unpublishedBody"
        : reason === "moderated"
          ? "moderatedBody"
          : "notFoundTitle";
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "publicTeacherProfile", titleKey)} />
        <p className="text-muted text-sm">
          {t(locale, "publicTeacherProfile", bodyKey)}
        </p>
      </main>
    );
  }

  const profile = profileQuery.data;
  if (!profile) {
    return (
      <main className="p-6" dir={dir} lang={locale}>
        <EmptyState
          title={t(locale, "publicTeacherProfile", "notFoundTitle")}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <p className="text-muted text-sm tracking-wide uppercase">Solo</p>
        <h1 className="font-display text-3xl font-medium">
          {profile.displayName}
        </h1>
        {profile.headline ? (
          <p className="text-muted text-lg">{profile.headline}</p>
        ) : null}
      </header>
      {profile.bio ? (
        <p className="text-sm leading-relaxed">{profile.bio}</p>
      ) : null}
      <section aria-label={t(locale, "publicTeacherProfile", "subjectsLabel")}>
        <h2 className="font-display text-lg">
          {t(locale, "publicTeacherProfile", "subjectsLabel")}
        </h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {profile.subjects.map((subject) => (
            <li
              key={subject}
              className="border-border bg-elevated rounded-md border px-3 py-1 text-sm"
            >
              {subject}
            </li>
          ))}
        </ul>
      </section>
      {profile.locationLabel ? (
        <p className="text-muted text-sm" data-testid="teacher-location">
          {profile.locationLabel}
        </p>
      ) : null}
    </main>
  );
}
