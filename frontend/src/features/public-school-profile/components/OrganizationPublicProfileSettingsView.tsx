"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { pushFeedback } from "@/components/shared/SoloFeedback";
import { OrgShell } from "@/features/organization";
import { Button, ErrorState, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { routes } from "@/lib/routes";
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";
import { getPublicSchoolProfileClient } from "@/services/public-school-profile";

const keys = createQueryKeyFactory("org-public-profile");

export function OrganizationPublicProfileSettingsView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const orgQuery = useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => getOrganizationClient().get(orgId),
  });
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );
  const ctx = {
    personaId: sessionQuery.data?.userId,
    organizationId: orgId,
    subjectId: null,
  };
  const profileQuery = useQuery({
    queryKey: keys.detail(ctx, "profile"),
    queryFn: () => getPublicSchoolProfileClient().getForOrg(orgId),
    enabled: canManage.allowed,
  });

  const publishMutation = useMutation({
    mutationFn: () => getPublicSchoolProfileClient().publish(orgId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "publicSchoolProfile", "publishSuccess"),
      });
    },
  });
  const unpublishMutation = useMutation({
    mutationFn: () => getPublicSchoolProfileClient().unpublish(orgId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "warning",
        title: t(locale, "publicSchoolProfile", "unpublishSuccess"),
      });
    },
  });

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!orgQuery.data || !canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "publicSchoolProfile", "forbidden")} />
      </div>
    );
  }

  const profile = profileQuery.data;

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="publicProfile"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "publicSchoolProfile", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "publicSchoolProfile", "subtitle")}
        </p>
      </header>
      {profileQuery.isLoading || !profile ? (
        <Skeleton className="h-24" />
      ) : (
        <section className="space-y-4">
          <p className="text-sm" data-testid="school-profile-status">
            <span className="text-muted">
              {t(locale, "publicSchoolProfile", "statusLabel")}:{" "}
            </span>
            <strong>
              {t(locale, "publicSchoolProfile", `status.${profile.status}`)}
            </strong>
          </p>
          <p className="text-sm">
            <Link
              className="text-brand underline"
              href={`${routes.public.profile(profile.slug)}?lang=${locale}`}
            >
              /p/{profile.slug}
            </Link>
          </p>
          {profile.status === "published" ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => unpublishMutation.mutate()}
            >
              {t(locale, "publicSchoolProfile", "unpublish")}
            </Button>
          ) : (
            <Button type="button" onClick={() => publishMutation.mutate()}>
              {t(locale, "publicSchoolProfile", "publish")}
            </Button>
          )}
        </section>
      )}
    </OrgShell>
  );
}
