"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Button, ErrorState, Skeleton } from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { cn } from "@/lib/utils/cn";
import { getOrganizationClient } from "@/services/organization";

import { OrgShell } from "./OrgShell";

export function OrganizationDashboardView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);

  const orgQuery = useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => getOrganizationClient().get(orgId),
  });

  if (orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }

  if (orgQuery.isError || !orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState
          title={t(locale, "organization", "loadError")}
          action={
            <Button type="button" onClick={() => void orgQuery.refetch()}>
              {t(locale, "organization", "retry")}
            </Button>
          }
        />
      </div>
    );
  }

  const org = orgQuery.data;

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={org.id}
      orgName={org.name}
      active="home"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "organization", "dashboardTitle")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "organization", "dashboardSubtitle", { name: org.name })}
        </p>
        <p className="text-xs">
          {t(locale, "organization", `type.${org.type}`)} ·{" "}
          {t(locale, "organization", "ownerRole")} ·{" "}
          {t(locale, "organization", "mainBranch")}: {org.mainBranchName}
        </p>
        <p
          className={cn(
            "text-xs font-medium",
            org.trialDaysLeft > 0 ? "text-brand" : "text-muted",
          )}
        >
          {t(locale, "organization", "trialActive")} ·{" "}
          {t(locale, "organization", "statTrial")}: {org.trialDaysLeft}
        </p>
      </header>
      <dl className="grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-muted text-xs">
            {t(locale, "organization", "statBranches")}
          </dt>
          <dd className="font-display text-2xl">{org.branchesCount}</dd>
        </div>
        <div>
          <dt className="text-muted text-xs">
            {t(locale, "organization", "statMembers")}
          </dt>
          <dd className="font-display text-2xl">{org.membersCount}</dd>
        </div>
        <div>
          <dt className="text-muted text-xs">
            {t(locale, "organization", "statTrial")}
          </dt>
          <dd className="font-display text-2xl">{org.trialDaysLeft}</dd>
        </div>
      </dl>
    </OrgShell>
  );
}
