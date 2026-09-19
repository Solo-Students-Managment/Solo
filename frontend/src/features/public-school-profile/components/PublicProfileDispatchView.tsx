"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";

import { PublicSchoolProfileView } from "@/features/public-school-profile";
import { PublicTeacherProfileView } from "@/features/public-teacher-profile";
import { ErrorState, Skeleton } from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getPublicSchoolProfileClient } from "@/services/public-school-profile";
import { getPublicTeacherProfileClient } from "@/services/public-teacher-profile";

const keys = createQueryKeyFactory("public-profile-dispatch");

type Kind = "teacher" | "school" | "missing" | "unpublished" | "moderated";

async function resolveKind(slug: string): Promise<Kind> {
  try {
    await getPublicTeacherProfileClient().getBySlug(slug);
    return "teacher";
  } catch (teacherError) {
    const teacherReason =
      teacherError instanceof Error ? teacherError.message : "not_found";
    if (teacherReason === "unpublished" || teacherReason === "moderated") {
      return teacherReason;
    }
  }
  try {
    await getPublicSchoolProfileClient().getBySlug(slug);
    return "school";
  } catch (schoolError) {
    const schoolReason =
      schoolError instanceof Error ? schoolError.message : "not_found";
    if (schoolReason === "unpublished" || schoolReason === "moderated") {
      return schoolReason;
    }
    return "missing";
  }
}

export function PublicProfileDispatchView() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);

  const kindQuery = useQuery({
    queryKey: keys.detail(
      { personaId: undefined, organizationId: null, subjectId: null },
      slug,
    ),
    queryFn: () => resolveKind(slug),
    retry: false,
  });

  if (kindQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  const kind = kindQuery.data;

  if (kind === "teacher") return <PublicTeacherProfileView />;
  if (kind === "school") return <PublicSchoolProfileView slug={slug} />;

  const ns =
    kind === "unpublished" || kind === "moderated"
      ? "publicTeacherProfile"
      : "publicTeacherProfile";
  const titleKey =
    kind === "unpublished"
      ? "unpublishedTitle"
      : kind === "moderated"
        ? "moderatedTitle"
        : "notFoundTitle";

  return (
    <main className="mx-auto max-w-3xl p-6" dir={dir} lang={locale}>
      <ErrorState title={t(locale, ns, titleKey)} />
    </main>
  );
}
