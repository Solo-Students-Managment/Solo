"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { pushFeedback } from "@/components/shared/SoloFeedback";
import { OrgShell } from "@/features/organization";
import { Button, ErrorState, Input, Label, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";
import { getSessionsClient } from "@/services/sessions";

const sessionsQueryKeys = createQueryKeyFactory("sessions");

export function OrganizationSessionDetailView() {
  const params = useParams<{ orgId: string; sessionId: string }>();
  const { orgId, sessionId } = params;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [score, setScore] = useState("85");
  const [comment, setComment] = useState("");

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
  const detailQuery = useQuery({
    queryKey: sessionsQueryKeys.detail(ctx, sessionId),
    queryFn: () => getSessionsClient().get(orgId, sessionId),
    enabled: Boolean(sessionQuery.data),
  });

  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );

  if (sessionQuery.isLoading || orgQuery.isLoading || detailQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "sessions", "forbidden")} />
      </div>
    );
  }
  if (!orgQuery.data || !detailQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "sessions", "loadError")} />
      </div>
    );
  }

  const detail = detailQuery.data;
  const first = detail.evaluations[0];

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgId}
      orgName={orgQuery.data.name}
      active="sessions"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "sessions", "detailTitle")}
        </h1>
        <p className="font-medium">{detail.className}</p>
        <p className="text-muted text-sm">
          {detail.startsAt} → {detail.endsAt}
        </p>
        <p className="text-xs">
          {detail.reportStatus === "published"
            ? t(locale, "sessions", "reportPublished")
            : t(locale, "sessions", "reportDraft")}
        </p>
      </header>

      <section className="space-y-3" aria-labelledby="eval-title">
        <h2 id="eval-title" className="font-display text-xl font-medium">
          {t(locale, "sessions", "evaluationsTitle")}
        </h2>
        <ul className="space-y-2">
          {detail.evaluations.map((evaluation) => (
            <li
              key={evaluation.studentId}
              className="border-border rounded-md border p-3"
            >
              <p className="font-medium">{evaluation.studentDisplayName}</p>
              <p className="text-muted text-xs">
                {evaluation.score ?? "—"} · {evaluation.comment || "—"}
              </p>
            </li>
          ))}
        </ul>
        {first && detail.reportStatus === "draft" ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="eval-score">
                {t(locale, "sessions", "scoreLabel")}
              </Label>
              <Input
                id="eval-score"
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(event) => setScore(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="eval-comment">
                {t(locale, "sessions", "commentLabel")}
              </Label>
              <Input
                id="eval-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
            </div>
            <Button
              type="button"
              onClick={async () => {
                await getSessionsClient().saveEvaluation(orgId, sessionId, {
                  studentId: first.studentId,
                  studentDisplayName: first.studentDisplayName,
                  score: Number(score),
                  comment,
                });
                pushFeedback({
                  tone: "success",
                  title: t(locale, "sessions", "evaluationSaved"),
                });
                await queryClient.invalidateQueries({
                  queryKey: sessionsQueryKeys.all(ctx),
                });
              }}
            >
              {t(locale, "sessions", "saveEvaluation")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                await getSessionsClient().publishReport(orgId, sessionId);
                pushFeedback({
                  tone: "success",
                  title: t(locale, "sessions", "publishSuccess"),
                });
                await queryClient.invalidateQueries({
                  queryKey: sessionsQueryKeys.all(ctx),
                });
              }}
            >
              {t(locale, "sessions", "publishReport")}
            </Button>
          </div>
        ) : null}
      </section>
    </OrgShell>
  );
}
