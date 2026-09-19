"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { pushFeedback } from "@/components/shared/SoloFeedback";
import { Button, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { routes } from "@/lib/routes";
import { getAuthClient } from "@/services/auth";
import {
  canJoinWaitlist,
  canRequestEnrollment,
  getPublicCatalogClient,
  seatsRemaining,
} from "@/services/public-catalog";

const keys = createQueryKeyFactory("public-catalog");

export function PublicCatalogDetailView() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const ctx = { personaId: undefined, organizationId: null, subjectId: null };

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const isSignedIn = Boolean(sessionQuery.data);

  const entryQuery = useQuery({
    queryKey: keys.detail(ctx, slug),
    queryFn: async () => {
      try {
        return await getPublicCatalogClient().getBySlug(slug);
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "not_found");
      }
    },
    retry: false,
  });

  const enrollMutation = useMutation({
    mutationFn: (id: string) => getPublicCatalogClient().requestEnrollment(id),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "publicCatalog", "enrollSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.detail(ctx, slug) });
    },
    onError: () => {
      pushFeedback({
        tone: "error",
        title: t(locale, "publicCatalog", "enrollError"),
      });
    },
  });

  const waitlistMutation = useMutation({
    mutationFn: (id: string) => getPublicCatalogClient().joinWaitlist(id),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "publicCatalog", "waitlistSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.detail(ctx, slug) });
    },
    onError: () => {
      pushFeedback({
        tone: "error",
        title: t(locale, "publicCatalog", "waitlistError"),
      });
    },
  });

  if (entryQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (entryQuery.isError) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "publicCatalog", "notFoundTitle")} />
      </main>
    );
  }
  const entry = entryQuery.data;
  if (!entry) {
    return (
      <main className="p-6" dir={dir} lang={locale}>
        <EmptyState title={t(locale, "publicCatalog", "notFoundTitle")} />
      </main>
    );
  }

  const enrollOk = canRequestEnrollment(entry);
  const waitOk = canJoinWaitlist(entry);

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6" dir={dir} lang={locale}>
      <p>
        <Link
          href={`${routes.public.catalog()}?lang=${locale}`}
          className="text-sm underline-offset-2 hover:underline"
        >
          {t(locale, "publicCatalog", "backToCatalog")}
        </Link>
      </p>
      <header className="space-y-2">
        <p className="text-muted text-sm tracking-wide uppercase">Solo</p>
        <h1 className="font-display text-3xl font-medium">{entry.title}</h1>
        <p className="text-muted text-sm">
          {entry.providerName} · {entry.subject}
        </p>
      </header>
      {entry.summary ? (
        <p className="text-sm leading-relaxed">{entry.summary}</p>
      ) : null}
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">
            {t(locale, "publicCatalog", "statusLabel")}
          </dt>
          <dd data-testid="catalog-status">
            {t(locale, "publicCatalog", `status.${entry.status}`)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">
            {t(locale, "publicCatalog", "seatsLabel")}
          </dt>
          <dd>
            {seatsRemaining(entry)} / {entry.seatsTotal}
          </dd>
        </div>
        <div>
          <dt className="text-muted">
            {t(locale, "publicCatalog", "waitlistLabel")}
          </dt>
          <dd data-testid="catalog-waitlist">
            {entry.waitlistEnabled
              ? `${t(locale, "publicCatalog", "waitlistOn")}: ${entry.waitlistCount}`
              : t(locale, "publicCatalog", "waitlistOff")}
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={!isSignedIn || !enrollOk || enrollMutation.isPending}
          title={
            !isSignedIn
              ? t(locale, "publicCatalog", "signInRequired")
              : !enrollOk
                ? t(locale, "publicCatalog", "enrollUnavailable")
                : undefined
          }
          onClick={() => enrollMutation.mutate(entry.id)}
        >
          {t(locale, "publicCatalog", "requestEnrollment")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={!isSignedIn || !waitOk || waitlistMutation.isPending}
          title={
            !isSignedIn
              ? t(locale, "publicCatalog", "signInRequired")
              : !waitOk
                ? t(locale, "publicCatalog", "waitlistUnavailable")
                : undefined
          }
          onClick={() => waitlistMutation.mutate(entry.id)}
        >
          {t(locale, "publicCatalog", "joinWaitlist")}
        </Button>
      </div>
    </main>
  );
}
