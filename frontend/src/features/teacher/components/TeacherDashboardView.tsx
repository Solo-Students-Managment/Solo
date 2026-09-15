"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { AppShell } from "@/components/layouts";
import { Button, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { getAuthClient } from "@/services/auth";
import { getHomeClient } from "@/services/home";

export function TeacherDashboardView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);

  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const session = sessionQuery.data ?? null;
  const capability = resolveCapability(session, "nav.teacher");

  const dashQuery = useQuery({
    queryKey: [
      "teacher",
      "dashboard",
      session?.userId,
      session?.organizationId,
    ],
    queryFn: () => getHomeClient().getTeacherDashboard(),
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
          <ErrorState title={t(locale, "teacher", "forbidden")} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Solo">
      <div className="space-y-6" dir={dir} lang={locale}>
        <header className="space-y-2">
          <h1 className="font-display text-2xl font-medium">
            {t(locale, "teacher", "title")}
          </h1>
          <p className="text-muted text-sm">
            {t(locale, "teacher", "subtitle")}
          </p>
        </header>
        {dashQuery.isLoading ? <Skeleton className="h-24 w-full" /> : null}
        {dashQuery.isError ? (
          <ErrorState
            title={t(locale, "teacher", "loadError")}
            action={
              <Button type="button" onClick={() => void dashQuery.refetch()}>
                {t(locale, "teacher", "retry")}
              </Button>
            }
          />
        ) : null}
        {dashQuery.data ? (
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-muted text-xs">
                {t(locale, "teacher", "statsStudents")}
              </dt>
              <dd className="font-display text-2xl">
                {dashQuery.data.studentsCount}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs">
                {t(locale, "teacher", "statsClasses")}
              </dt>
              <dd className="font-display text-2xl">
                {dashQuery.data.classesCount}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs">
                {t(locale, "teacher", "statsSessions")}
              </dt>
              <dd className="font-display text-2xl">
                {dashQuery.data.upcomingSessionsCount}
              </dd>
            </div>
          </dl>
        ) : null}
        {dashQuery.data &&
        dashQuery.data.studentsCount === 0 &&
        dashQuery.data.classesCount === 0 ? (
          <EmptyState title={t(locale, "teacher", "empty")} />
        ) : null}
      </div>
    </AppShell>
  );
}
