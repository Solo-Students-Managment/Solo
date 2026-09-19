"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { pushFeedback } from "@/components/shared/SoloFeedback";
import { Button, ErrorState, Input, Label, Skeleton } from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { routes } from "@/lib/routes";
import { getAuthClient } from "@/services/auth";
import { getPublicTeacherProfileClient } from "@/services/public-teacher-profile";

const keys = createQueryKeyFactory("teacher-public-profile-settings");

export function TeacherPublicProfileSettingsView() {
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
  const profileQuery = useQuery({
    queryKey: keys.detail(ctx, "mine"),
    queryFn: () => getPublicTeacherProfileClient().getMine(),
    enabled: Boolean(sessionQuery.data),
  });
  const [headline, setHeadline] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: () =>
      getPublicTeacherProfileClient().updateMine({
        headline: headline ?? profileQuery.data?.headline ?? null,
        bio: bio ?? profileQuery.data?.bio ?? null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "publicTeacherProfile", "saveSuccess"),
      });
    },
  });
  const publishMutation = useMutation({
    mutationFn: () => getPublicTeacherProfileClient().publish(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "publicTeacherProfile", "publishSuccess"),
      });
    },
  });
  const unpublishMutation = useMutation({
    mutationFn: () => getPublicTeacherProfileClient().unpublish(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "warning",
        title: t(locale, "publicTeacherProfile", "unpublishSuccess"),
      });
    },
  });

  if (sessionQuery.isLoading || profileQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!sessionQuery.data || !profileQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState
          title={t(locale, "publicTeacherProfile", "notFoundTitle")}
        />
      </div>
    );
  }

  const profile = profileQuery.data;
  const headlineValue = headline ?? profile.headline ?? "";
  const bioValue = bio ?? profile.bio ?? "";

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "publicTeacherProfile", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "publicTeacherProfile", "subtitle")}
        </p>
      </header>

      <p className="text-sm" data-testid="teacher-profile-status">
        <span className="text-muted">
          {t(locale, "publicTeacherProfile", "statusLabel")}:{" "}
        </span>
        <strong>
          {t(locale, "publicTeacherProfile", `status.${profile.status}`)}
        </strong>
      </p>

      <p className="text-sm">
        <span className="text-muted">
          {t(locale, "publicTeacherProfile", "publicLink")}:{" "}
        </span>
        <Link
          className="text-brand underline"
          href={`${routes.public.profile(profile.slug)}?lang=${locale}`}
        >
          /p/{profile.slug}
        </Link>
      </p>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="tp-headline">
            {t(locale, "publicTeacherProfile", "headline")}
          </Label>
          <Input
            id="tp-headline"
            value={headlineValue}
            onChange={(e) => setHeadline(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tp-bio">
            {t(locale, "publicTeacherProfile", "bio")}
          </Label>
          <Input
            id="tp-bio"
            value={bioValue}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        <Button type="button" onClick={() => saveMutation.mutate()}>
          {t(locale, "publicTeacherProfile", "save")}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {profile.status === "published" ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => unpublishMutation.mutate()}
          >
            {t(locale, "publicTeacherProfile", "unpublish")}
          </Button>
        ) : (
          <Button type="button" onClick={() => publishMutation.mutate()}>
            {t(locale, "publicTeacherProfile", "publish")}
          </Button>
        )}
      </div>
    </main>
  );
}
