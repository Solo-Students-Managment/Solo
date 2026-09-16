"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";

import { OrgShell } from "@/features/organization";
import { ErrorState, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";
import {
  getSubscriptionClient,
  isRestrictedState,
  requiresUpgrade,
} from "@/services/subscription";

const keys = createQueryKeyFactory("subscription");

export function OrganizationSubscriptionView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);

  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const orgQuery = useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => getOrganizationClient().get(orgId),
  });
  const ctx = {
    personaId: sessionQuery.data?.userId,
    organizationId: orgId,
    subjectId: null,
  };
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );
  const subQuery = useQuery({
    queryKey: keys.detail(ctx, "current"),
    queryFn: () => getSubscriptionClient().get(orgId),
    enabled: canManage.allowed,
  });

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "subscription", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "subscription", "forbidden")} />
      </div>
    );
  }

  const sub = subQuery.data;

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="subscription"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "subscription", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "subscription", "subtitle")}
        </p>
      </header>

      {subQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {subQuery.isError ? (
        <ErrorState title={t(locale, "subscription", "loadError")} />
      ) : null}

      {sub ? (
        <div className="space-y-4">
          <dl className="border-border grid gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-muted text-xs">
                {t(locale, "subscription", "planLabel")}
              </dt>
              <dd className="font-medium">
                {t(locale, "subscription", `plan.${sub.planCode}`)}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs">
                {t(locale, "subscription", "stateLabel")}
              </dt>
              <dd
                className={
                  sub.state === "active"
                    ? "text-brand font-medium"
                    : "font-medium"
                }
              >
                {t(locale, "subscription", `state.${sub.state}`)}
              </dd>
            </div>
            {sub.trialDaysLeft != null ? (
              <div>
                <dt className="text-muted text-xs">
                  {t(locale, "subscription", "trialDaysLeft")}
                </dt>
                <dd className="font-display text-2xl">{sub.trialDaysLeft}</dd>
              </div>
            ) : null}
            {sub.graceDaysLeft != null ? (
              <div>
                <dt className="text-muted text-xs">
                  {t(locale, "subscription", "graceDaysLeft")}
                </dt>
                <dd className="font-display text-2xl">{sub.graceDaysLeft}</dd>
              </div>
            ) : null}
            {sub.limitedReason ? (
              <div className="sm:col-span-2">
                <dt className="text-muted text-xs">
                  {t(locale, "subscription", "limitedReason")}
                </dt>
                <dd>{sub.limitedReason}</dd>
              </div>
            ) : null}
            {sub.renewsAt ? (
              <div>
                <dt className="text-muted text-xs">
                  {t(locale, "subscription", "renewsAt")}
                </dt>
                <dd>{new Date(sub.renewsAt).toLocaleDateString(locale)}</dd>
              </div>
            ) : null}
          </dl>

          {isRestrictedState(sub.state) ? (
            <p className="text-muted border-border rounded-md border border-dashed p-3 text-sm">
              {t(locale, "subscription", "restrictedNotice")}
            </p>
          ) : null}
          {requiresUpgrade(sub.state) ? (
            <p className="border-brand/30 bg-brand/5 text-brand rounded-md border p-3 text-sm">
              {t(locale, "subscription", "upgradeNotice")}
            </p>
          ) : null}
        </div>
      ) : null}
    </OrgShell>
  );
}
