"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { OrgShell } from "@/features/organization";
import { Button, ErrorState, Input, Label, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";
import { getOrgLifecycleClient } from "@/services/org-lifecycle";

const keys = createQueryKeyFactory("org-lifecycle");

export function OrganizationLifecycleView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [ownerId, setOwnerId] = useState("usr_new_owner");
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
  const snapQuery = useQuery({
    queryKey: keys.detail(ctx, "snapshot"),
    queryFn: () => getOrgLifecycleClient().get(orgId),
    enabled: canManage.allowed,
  });
  const archiveMutation = useMutation({
    mutationFn: () => getOrgLifecycleClient().archive(orgId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "warning",
        title: t(locale, "orgLifecycle", "archiveSuccess"),
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => getOrgLifecycleClient().requestDelete(orgId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "warning",
        title: t(locale, "orgLifecycle", "deleteSuccess"),
      });
    },
  });
  const transferMutation = useMutation({
    mutationFn: () => getOrgLifecycleClient().transferOwnership(orgId, ownerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
      pushFeedback({
        tone: "success",
        title: t(locale, "orgLifecycle", "transferSuccess"),
      });
    },
  });
  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data || !canManage.allowed)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "orgLifecycle", "forbidden")} />
      </div>
    );
  const snap = snapQuery.data;
  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="orgLifecycle"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "orgLifecycle", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "orgLifecycle", "subtitle")}
        </p>
      </header>
      {!snap ? (
        <Skeleton className="h-32" />
      ) : (
        <section className="space-y-4">
          <p data-testid="lifecycle-state" className="text-sm">
            <span className="text-muted">
              {t(locale, "orgLifecycle", "stateLabel")}:{" "}
            </span>
            <strong>{snap.state}</strong>
          </p>
          <div className="space-y-1" data-testid="lifecycle-impact">
            <h2 className="font-display text-lg">
              {t(locale, "orgLifecycle", "impactTitle")}
            </h2>
            <ul className="list-disc ps-5 text-sm">
              <li>
                {t(locale, "orgLifecycle", "members")}: {snap.impact.members}
              </li>
              <li>
                {t(locale, "orgLifecycle", "students")}: {snap.impact.students}
              </li>
              <li>
                {t(locale, "orgLifecycle", "files")}: {snap.impact.files}
              </li>
              <li>
                {t(locale, "orgLifecycle", "billingOpen")}:{" "}
                {String(snap.impact.billingOpen)}
              </li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => archiveMutation.mutate()}>
              {t(locale, "orgLifecycle", "archive")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => deleteMutation.mutate()}
            >
              {t(locale, "orgLifecycle", "delete")}
            </Button>
          </div>
          <div className="max-w-md space-y-2">
            <Label htmlFor="new-owner">
              {t(locale, "orgLifecycle", "ownerLabel")}
            </Label>
            <Input
              id="new-owner"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
            />
            <Button type="button" onClick={() => transferMutation.mutate()}>
              {t(locale, "orgLifecycle", "transfer")}
            </Button>
          </div>
        </section>
      )}
    </OrgShell>
  );
}
