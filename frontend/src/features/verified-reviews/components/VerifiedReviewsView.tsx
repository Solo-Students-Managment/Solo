"use client";

import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { pushFeedback } from "@/components/shared/SoloFeedback";
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Label,
  Skeleton,
} from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import {
  averageRating,
  getVerifiedReviewsClient,
} from "@/services/verified-reviews";

const keys = createQueryKeyFactory("verified-reviews");

export function VerifiedReviewsView({ targetSlug }: { targetSlug?: string }) {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const slug = targetSlug ?? searchParams.get("target") ?? "sara-english";
  const queryClient = useQueryClient();
  const ctx = { personaId: undefined, organizationId: null, subjectId: null };
  const [rating, setRating] = useState("5");
  const [body, setBody] = useState("");

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const isSignedIn = Boolean(sessionQuery.data);

  const reviewsQuery = useQuery({
    queryKey: keys.list(ctx, { slug }),
    queryFn: () => getVerifiedReviewsClient().listByTarget(slug),
  });

  const eligibilityQuery = useQuery({
    queryKey: keys.detail(ctx, `eligible-${slug}`),
    queryFn: () => getVerifiedReviewsClient().canReview(slug),
    enabled: isSignedIn,
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      getVerifiedReviewsClient().submit({
        targetSlug: slug,
        rating: Number(rating),
        body,
      }),
    onSuccess: () => {
      setBody("");
      pushFeedback({
        tone: "success",
        title: t(locale, "verifiedReviews", "submitSuccess"),
      });
      void queryClient.invalidateQueries({
        queryKey: keys.list(ctx, { slug }),
      });
    },
    onError: () => {
      pushFeedback({
        tone: "error",
        title: t(locale, "verifiedReviews", "submitError"),
      });
    },
  });

  const avg = averageRating(reviewsQuery.data ?? []);
  const canSubmit = isSignedIn && eligibilityQuery.data === true;

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <p className="text-muted text-sm tracking-wide uppercase">Solo</p>
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "verifiedReviews", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "verifiedReviews", "subtitle")} ({slug})
        </p>
        {avg !== null ? (
          <p data-testid="reviews-average">
            {t(locale, "verifiedReviews", "averageLabel")}: {avg.toFixed(1)}
          </p>
        ) : null}
      </header>

      {reviewsQuery.isLoading ? <Skeleton className="h-32" /> : null}
      {reviewsQuery.isError ? (
        <ErrorState title={t(locale, "verifiedReviews", "errorTitle")} />
      ) : null}
      {reviewsQuery.isSuccess && reviewsQuery.data.length === 0 ? (
        <EmptyState title={t(locale, "verifiedReviews", "emptyTitle")} />
      ) : null}
      {reviewsQuery.isSuccess && reviewsQuery.data.length > 0 ? (
        <ul
          className="space-y-3"
          aria-label={t(locale, "verifiedReviews", "listLabel")}
        >
          {reviewsQuery.data.map((review) => (
            <li
              key={review.id}
              className="border-border bg-elevated space-y-1 rounded-md border p-4"
            >
              <p className="font-medium">
                {review.authorDisplayName} · {review.rating}/5
              </p>
              <p className="text-sm">{review.body}</p>
              <p className="text-muted text-xs">
                {t(locale, "verifiedReviews", "verifiedBadge")}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <section
        aria-label={t(locale, "verifiedReviews", "formLabel")}
        className="space-y-3"
      >
        <h2 className="font-display text-xl">
          {t(locale, "verifiedReviews", "formTitle")}
        </h2>
        {!isSignedIn ? (
          <p className="text-muted text-sm">
            {t(locale, "verifiedReviews", "signInRequired")}
          </p>
        ) : eligibilityQuery.data === false ? (
          <p className="text-muted text-sm">
            {t(locale, "verifiedReviews", "notEligible")}
          </p>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              submitMutation.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="rev-rating">
                {t(locale, "verifiedReviews", "ratingLabel")}
              </Label>
              <Input
                id="rev-rating"
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                disabled={!canSubmit}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rev-body">
                {t(locale, "verifiedReviews", "bodyLabel")}
              </Label>
              <textarea
                id="rev-body"
                className="border-border bg-elevated min-h-24 w-full rounded-md border p-2 text-sm"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={!canSubmit}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={!canSubmit || !body.trim() || submitMutation.isPending}
            >
              {t(locale, "verifiedReviews", "submit")}
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
