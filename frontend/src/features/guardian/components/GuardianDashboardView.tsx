"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { AppShell } from "@/components/layouts";
import { Button, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { getAuthClient } from "@/services/auth";
import { getGuardianClient } from "@/services/guardian";

export function GuardianDashboardView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);

  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const session = sessionQuery.data ?? null;
  const capability = resolveCapability(session, "nav.guardian");

  const dashQuery = useQuery({
    queryKey: ["guardian", "dashboard", session?.userId],
    queryFn: () => getGuardianClient().getDashboard(),
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
          <ErrorState title={t(locale, "guardian", "forbidden")} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Solo">
      <div className="space-y-6" dir={dir} lang={locale}>
        <header className="space-y-2">
          <h1 className="font-display text-2xl font-medium">
            {t(locale, "guardian", "title")}
          </h1>
          <p className="text-muted text-sm">
            {t(locale, "guardian", "subtitle")}
          </p>
        </header>
        {dashQuery.isLoading ? <Skeleton className="h-24 w-full" /> : null}
        {dashQuery.isError ? (
          <ErrorState
            title={t(locale, "guardian", "loadError")}
            action={
              <Button type="button" onClick={() => void dashQuery.refetch()}>
                {t(locale, "guardian", "retry")}
              </Button>
            }
          />
        ) : null}
        {dashQuery.data ? (
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-muted text-xs">
                {t(locale, "guardian", "statsStudents")}
              </dt>
              <dd className="font-display text-2xl">
                {dashQuery.data.linkedStudentsCount}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs">
                {t(locale, "guardian", "statsSessions")}
              </dt>
              <dd className="font-display text-2xl">
                {dashQuery.data.upcomingSessionsCount}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs">
                {t(locale, "guardian", "statsUpdates")}
              </dt>
              <dd className="font-display text-2xl">
                {dashQuery.data.unreadUpdatesCount}
              </dd>
            </div>
          </dl>
        ) : null}
        {dashQuery.data?.relationships.length ? (
          <section className="space-y-2" aria-labelledby="guardian-rels">
            <h2 id="guardian-rels" className="font-display text-lg font-medium">
              {t(locale, "guardian", "relationshipsTitle")}
            </h2>
            <ul className="space-y-2">
              {dashQuery.data.relationships.map((rel) => (
                <li
                  key={rel.id}
                  className="border-border rounded-md border p-3"
                >
                  <p className="font-medium">{rel.studentDisplayName}</p>
                  <p className="text-muted text-xs">
                    {rel.relationshipLabel} · {rel.organizationName}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {dashQuery.data && dashQuery.data.linkedStudentsCount === 0 ? (
          <EmptyState title={t(locale, "guardian", "empty")} />
        ) : null}
      </div>
    </AppShell>
  );
}
