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
  canSell,
  getSellerOnboardingClient,
  needsOnboarding,
} from "@/services/seller-onboarding";

const keys = createQueryKeyFactory("seller-onboarding");

export function SellerOnboardingView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const ctx = { personaId: undefined, organizationId: null, subjectId: null };
  const [displayName, setDisplayName] = useState("");
  const [shopSlug, setShopSlug] = useState("");
  const [bio, setBio] = useState("");

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const profileQuery = useQuery({
    queryKey: keys.detail(ctx, "mine"),
    queryFn: () => getSellerOnboardingClient().getMine(),
    enabled: Boolean(sessionQuery.data),
  });

  const startMutation = useMutation({
    mutationFn: () =>
      getSellerOnboardingClient().startOnboarding({
        displayName,
        shopSlug,
        bio: bio || null,
      }),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "sellerOnboarding", "startSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
    onError: () => {
      pushFeedback({
        tone: "error",
        title: t(locale, "sellerOnboarding", "startError"),
      });
    },
  });

  if (sessionQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (!sessionQuery.data) {
    return (
      <main className="mx-auto max-w-3xl p-6" dir={dir} lang={locale}>
        <EmptyState title={t(locale, "sellerOnboarding", "signInRequired")} />
      </main>
    );
  }
  if (profileQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (profileQuery.isError) {
    return (
      <main className="mx-auto max-w-3xl p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "sellerOnboarding", "errorTitle")} />
      </main>
    );
  }
  const profile = profileQuery.data!;

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <p className="text-muted text-sm tracking-wide uppercase">Solo</p>
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "sellerOnboarding", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "sellerOnboarding", "subtitle")}
        </p>
      </header>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">
            {t(locale, "sellerOnboarding", "statusLabel")}
          </dt>
          <dd data-testid="seller-status">
            {t(locale, "sellerOnboarding", `status.${profile.status}`)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">
            {t(locale, "sellerOnboarding", "shopLabel")}
          </dt>
          <dd>{profile.shopSlug ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">
            {t(locale, "sellerOnboarding", "sellLabel")}
          </dt>
          <dd>
            {canSell(profile)
              ? t(locale, "sellerOnboarding", "canSellYes")
              : t(locale, "sellerOnboarding", "canSellNo")}
          </dd>
        </div>
      </dl>

      {needsOnboarding(profile) ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            startMutation.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="seller-name">
              {t(locale, "sellerOnboarding", "displayNameLabel")}
            </Label>
            <Input
              id="seller-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seller-slug">
              {t(locale, "sellerOnboarding", "shopSlugLabel")}
            </Label>
            <Input
              id="seller-slug"
              value={shopSlug}
              onChange={(e) => setShopSlug(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seller-bio">
              {t(locale, "sellerOnboarding", "bioLabel")}
            </Label>
            <textarea
              id="seller-bio"
              className="border-border bg-elevated min-h-24 w-full rounded-md border p-2 text-sm"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={startMutation.isPending}>
            {t(locale, "sellerOnboarding", "start")}
          </Button>
        </form>
      ) : (
        <p className="text-sm">
          {t(locale, "sellerOnboarding", "pendingBody")}
        </p>
      )}
    </main>
  );
}
