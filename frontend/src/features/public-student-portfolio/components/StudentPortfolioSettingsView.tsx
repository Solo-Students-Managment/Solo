"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { pushFeedback } from "@/components/shared/SoloFeedback";
import { Button, ErrorState, Skeleton } from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { routes } from "@/lib/routes";
import { getAuthClient } from "@/services/auth";
import { getPublicStudentPortfolioClient } from "@/services/public-student-portfolio";

const keys = createQueryKeyFactory("student-portfolio-settings");

export function StudentPortfolioSettingsView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const ctx = {
    personaId: sessionQuery.data?.userId,
    organizationId: null,
    subjectId: null,
  };
  const portfolioQuery = useQuery({
    queryKey: keys.detail(ctx, "mine"),
    queryFn: () => getPublicStudentPortfolioClient().getMine(),
    enabled: Boolean(sessionQuery.data),
  });

  const publishMutation = useMutation({
    mutationFn: () => getPublicStudentPortfolioClient().publish(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "publicStudentPortfolio", "publishSuccess"),
      });
    },
  });
  const unpublishMutation = useMutation({
    mutationFn: () => getPublicStudentPortfolioClient().unpublish(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "warning",
        title: t(locale, "publicStudentPortfolio", "unpublishSuccess"),
      });
    },
  });

  if (sessionQuery.isLoading || portfolioQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!sessionQuery.data || !portfolioQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState
          title={t(locale, "publicStudentPortfolio", "notFoundTitle")}
        />
      </div>
    );
  }

  const portfolio = portfolioQuery.data;
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "publicStudentPortfolio", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "publicStudentPortfolio", "subtitle")}
        </p>
      </header>
      <p className="text-sm" data-testid="student-portfolio-status">
        <span className="text-muted">
          {t(locale, "publicStudentPortfolio", "statusLabel")}:{" "}
        </span>
        <strong>
          {t(locale, "publicStudentPortfolio", `status.${portfolio.status}`)}
        </strong>
      </p>
      <p className="text-muted text-xs">
        {t(locale, "publicStudentPortfolio", "minorNotice")}
      </p>
      <Link
        className="text-brand text-sm underline"
        href={`${routes.public.profile(portfolio.slug)}?lang=${locale}`}
      >
        /p/{portfolio.slug}
      </Link>
      <div>
        {portfolio.status === "published" ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => unpublishMutation.mutate()}
          >
            {t(locale, "publicStudentPortfolio", "unpublish")}
          </Button>
        ) : (
          <Button type="button" onClick={() => publishMutation.mutate()}>
            {t(locale, "publicStudentPortfolio", "publish")}
          </Button>
        )}
      </div>
    </main>
  );
}
