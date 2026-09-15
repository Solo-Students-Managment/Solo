"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { AppShell } from "@/components/layouts";
import { Button, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { getAuthClient } from "@/services/auth";
import { getStudentClient } from "@/services/student";

export function StudentDashboardView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);

  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const session = sessionQuery.data ?? null;
  const capability = resolveCapability(session, "nav.student");

  const dashQuery = useQuery({
    queryKey: [
      "student",
      "dashboard",
      session?.userId,
      session?.organizationId,
      session?.subjectId,
    ],
    queryFn: () => getStudentClient().getDashboard(),
    enabled: Boolean(session) && capability.allowed,
  });

  if (sessionQuery.isLoading) {
    return (
      <AppShell title="Solo">
        <Skeleton className="h-32 w-full" />
      </AppShell>
    );
  }

  if (!capability.allowed) {
    return (
      <AppShell title="Solo">
        <div dir={dir} lang={locale}>
          <ErrorState title={t(locale, "student", "forbidden")} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Solo">
      <div className="space-y-6" dir={dir} lang={locale}>
        <header className="space-y-2">
          <h1 className="font-display text-2xl font-medium">
            {t(locale, "student", "title")}
          </h1>
          <p className="text-muted text-sm">
            {t(locale, "student", "subtitle")}
          </p>
        </header>
        {dashQuery.isLoading ? <Skeleton className="h-24 w-full" /> : null}
        {dashQuery.isError ? (
          <ErrorState
            title={t(locale, "student", "loadError")}
            action={
              <Button type="button" onClick={() => void dashQuery.refetch()}>
                {t(locale, "student", "retry")}
              </Button>
            }
          />
        ) : null}
        {dashQuery.data ? (
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-muted text-xs">
                {t(locale, "student", "statsSubjects")}
              </dt>
              <dd className="font-display text-2xl">
                {dashQuery.data.activeSubjectsCount}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs">
                {t(locale, "student", "statsSessions")}
              </dt>
              <dd className="font-display text-2xl">
                {dashQuery.data.upcomingSessionsCount}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs">
                {t(locale, "student", "statsAssignments")}
              </dt>
              <dd className="font-display text-2xl">
                {dashQuery.data.openAssignmentsCount}
              </dd>
            </div>
          </dl>
        ) : null}
        {dashQuery.data?.relationships.length ? (
          <section className="space-y-2" aria-labelledby="student-rels">
            <h2 id="student-rels" className="font-display text-lg font-medium">
              {t(locale, "student", "relationshipsTitle")}
            </h2>
            <ul className="space-y-2">
              {dashQuery.data.relationships.map((rel) => (
                <li
                  key={rel.id}
                  className="border-border rounded-md border p-3"
                >
                  <p className="font-medium">{rel.subjectLabel}</p>
                  <p className="text-muted text-xs">
                    {rel.organizationName} · {rel.teacherDisplayName}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {dashQuery.data && dashQuery.data.activeSubjectsCount === 0 ? (
          <EmptyState title={t(locale, "student", "empty")} />
        ) : null}
      </div>
    </AppShell>
  );
}
