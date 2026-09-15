"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useFormContext } from "react-hook-form";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { OrgShell } from "@/features/organization";
import {
  EmptyState,
  ErrorState,
  Input,
  Label,
  Skeleton,
} from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";
import {
  canRequestRevision,
  getAssignmentsClient,
  type Assignment,
} from "@/services/assignments";
import {
  createAssignmentSchema,
  createTeamSchema,
  findAssignmentByTitle,
  parseMemberNames,
  peerReviewSchema,
  recordSubmissionSchema,
  releaseGradesSchema,
  revisionRequestSchema,
  type CreateAssignmentValues,
  type CreateTeamValues,
  type PeerReviewValues,
  type RecordSubmissionValues,
  type ReleaseGradesValues,
  type RevisionRequestValues,
} from "../schemas";

const keys = createQueryKeyFactory("assignments");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function Fields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateAssignmentValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="asg-title">
          {t(locale, "assignments", "titleLabel")}
        </Label>
        <Input id="asg-title" {...register("title")} />
        <SoloFieldError name="title" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asg-type">
          {t(locale, "assignments", "typeLabel")}
        </Label>
        <select id="asg-type" className={selectClassName} {...register("type")}>
          {(
            [
              "homework",
              "project",
              "essay",
              "presentation",
              "research",
              "practice",
              "custom",
            ] as const
          ).map((type) => (
            <option key={type} value={type}>
              {t(locale, "assignments", `type.${type}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asg-due">{t(locale, "assignments", "dueLabel")}</Label>
        <Input id="asg-due" type="datetime-local" {...register("dueAt")} />
        <SoloFieldError name="dueAt" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asg-mode">
          {t(locale, "assignments", "collaborationLabel")}
        </Label>
        <select
          id="asg-mode"
          className={selectClassName}
          {...register("collaborationMode")}
        >
          <option value="individual">
            {t(locale, "assignments", "collaboration.individual")}
          </option>
          <option value="group">
            {t(locale, "assignments", "collaboration.group")}
          </option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asg-peer">
          {t(locale, "assignments", "peerReviewLabel")}
        </Label>
        <select
          id="asg-peer"
          className={selectClassName}
          {...register("peerReviewEnabled")}
        >
          <option value="no">
            {t(locale, "assignments", "peerReview.no")}
          </option>
          <option value="yes">
            {t(locale, "assignments", "peerReview.yes")}
          </option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asg-revisions">
          {t(locale, "assignments", "maxRevisionsLabel")}
        </Label>
        <Input
          id="asg-revisions"
          type="number"
          min={0}
          max={10}
          {...register("maxRevisions")}
        />
        <SoloFieldError name="maxRevisions" />
      </div>
    </>
  );
}

function SubmissionFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<RecordSubmissionValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="asg-sub-title">
          {t(locale, "assignments", "assignmentTitleLabel")}
        </Label>
        <Input id="asg-sub-title" {...register("assignmentTitle")} />
        <SoloFieldError name="assignmentTitle" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asg-sub-student">
          {t(locale, "assignments", "studentLabel")}
        </Label>
        <Input id="asg-sub-student" {...register("studentDisplayName")} />
        <SoloFieldError name="studentDisplayName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asg-sub-mime">
          {t(locale, "assignments", "mimeLabel")}
        </Label>
        <select
          id="asg-sub-mime"
          className={selectClassName}
          {...register("mimeHint")}
        >
          {(["pdf", "word", "image", "audio"] as const).map((mime) => (
            <option key={mime} value={mime}>
              {t(locale, "assignments", `mime.${mime}`)}
            </option>
          ))}
        </select>
        <SoloFieldError name="mimeHint" />
      </div>
    </>
  );
}

function TeamFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateTeamValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="asg-team-title">
          {t(locale, "assignments", "assignmentTitleLabel")}
        </Label>
        <Input id="asg-team-title" {...register("assignmentTitle")} />
        <SoloFieldError name="assignmentTitle" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asg-team-name">
          {t(locale, "assignments", "teamNameLabel")}
        </Label>
        <Input id="asg-team-name" {...register("teamName")} />
        <SoloFieldError name="teamName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asg-team-members">
          {t(locale, "assignments", "membersLabel")}
        </Label>
        <Input id="asg-team-members" {...register("memberNames")} />
        <p className="text-muted text-xs">
          {t(locale, "assignments", "membersHint")}
        </p>
        <SoloFieldError name="memberNames" />
      </div>
    </>
  );
}

function PeerFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<PeerReviewValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="asg-peer-title">
          {t(locale, "assignments", "assignmentTitleLabel")}
        </Label>
        <Input id="asg-peer-title" {...register("assignmentTitle")} />
        <SoloFieldError name="assignmentTitle" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asg-peer-reviewer">
          {t(locale, "assignments", "reviewerLabel")}
        </Label>
        <Input id="asg-peer-reviewer" {...register("reviewerName")} />
        <SoloFieldError name="reviewerName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asg-peer-reviewee">
          {t(locale, "assignments", "revieweeLabel")}
        </Label>
        <Input id="asg-peer-reviewee" {...register("revieweeName")} />
        <SoloFieldError name="revieweeName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asg-peer-score">
          {t(locale, "assignments", "peerScoreLabel")}
        </Label>
        <Input
          id="asg-peer-score"
          type="number"
          min={0}
          max={100}
          {...register("score")}
        />
        <SoloFieldError name="score" />
      </div>
    </>
  );
}

function RevisionFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<RevisionRequestValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="asg-rev-title">
          {t(locale, "assignments", "assignmentTitleLabel")}
        </Label>
        <Input id="asg-rev-title" {...register("assignmentTitle")} />
        <SoloFieldError name="assignmentTitle" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asg-rev-student">
          {t(locale, "assignments", "studentLabel")}
        </Label>
        <Input id="asg-rev-student" {...register("studentDisplayName")} />
        <SoloFieldError name="studentDisplayName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asg-rev-note">
          {t(locale, "assignments", "revisionNoteLabel")}
        </Label>
        <Input id="asg-rev-note" {...register("note")} />
      </div>
    </>
  );
}

function ReleaseFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<ReleaseGradesValues>();
  return (
    <div className="space-y-1.5">
      <Label htmlFor="asg-release-title">
        {t(locale, "assignments", "assignmentTitleLabel")}
      </Label>
      <Input id="asg-release-title" {...register("assignmentTitle")} />
      <SoloFieldError name="assignmentTitle" />
    </div>
  );
}

export function OrganizationAssignmentsView() {
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
  const ctx = {
    personaId: sessionQuery.data?.userId,
    organizationId: orgId,
    subjectId: null,
  };
  const listQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "assignments" }),
    queryFn: () => getAssignmentsClient().list(orgId),
    enabled: Boolean(sessionQuery.data),
  });
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );
  const rows = listQuery.data?.data ?? [];

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
  }

  function requireAssignment(title: string) {
    const match = findAssignmentByTitle(rows, title);
    if (!match) {
      pushFeedback({
        tone: "error",
        title: t(locale, "assignments", "submitNotFound"),
      });
      return null;
    }
    return match;
  }

  const columns = useMemo<ColumnDef<Assignment, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "assignments", "colTitle") },
      {
        accessorKey: "type",
        header: t(locale, "assignments", "colType"),
        cell: ({ row }) =>
          t(locale, "assignments", `type.${row.original.type}`),
      },
      {
        accessorKey: "collaborationMode",
        header: t(locale, "assignments", "colMode"),
        cell: ({ row }) =>
          t(
            locale,
            "assignments",
            `collaboration.${row.original.collaborationMode}`,
          ),
      },
      {
        accessorKey: "gradeRelease",
        header: t(locale, "assignments", "colRelease"),
        cell: ({ row }) =>
          t(locale, "assignments", `gradeRelease.${row.original.gradeRelease}`),
      },
      { accessorKey: "dueAt", header: t(locale, "assignments", "colDue") },
      {
        accessorKey: "submissionsCount",
        header: t(locale, "assignments", "colSubmissions"),
      },
      {
        accessorKey: "teamsCount",
        header: t(locale, "assignments", "colTeams"),
      },
      {
        accessorKey: "peerReviewsCount",
        header: t(locale, "assignments", "colPeerReviews"),
      },
      {
        accessorKey: "revisionsCount",
        header: t(locale, "assignments", "colRevisions"),
      },
    ],
    [locale],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "assignments", "loadError")} />
      </div>
    );
  if (!canManage.allowed)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "assignments", "forbidden")} />
      </div>
    );

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgId}
      orgName={orgQuery.data.name}
      active="assignments"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "assignments", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "assignments", "subtitle")}
        </p>
      </header>
      <SoloForm
        schema={createAssignmentSchema}
        defaultValues={{
          title: "",
          type: "homework",
          dueAt: "",
          collaborationMode: "individual",
          peerReviewEnabled: "no",
          maxRevisions: 1,
        }}
        submitLabel={t(locale, "assignments", "createSubmit")}
        onSubmit={async (values: CreateAssignmentValues) => {
          await getAssignmentsClient().create(orgId, {
            title: values.title,
            type: values.type,
            dueAt: new Date(values.dueAt).toISOString(),
            collaborationMode: values.collaborationMode,
            peerReviewEnabled: values.peerReviewEnabled === "yes",
            maxRevisions: values.maxRevisions,
          });
          pushFeedback({
            tone: "success",
            title: t(locale, "assignments", "createSuccess"),
          });
          await invalidate();
        }}
      >
        <Fields locale={locale} />
      </SoloForm>

      <section className="space-y-3" aria-labelledby="asg-submit-heading">
        <h2 id="asg-submit-heading" className="text-lg font-medium">
          {t(locale, "assignments", "submitTitle")}
        </h2>
        <SoloForm
          schema={recordSubmissionSchema}
          defaultValues={{
            assignmentTitle: "",
            studentDisplayName: "",
            mimeHint: "pdf",
          }}
          submitLabel={t(locale, "assignments", "submitSubmit")}
          onSubmit={async (values: RecordSubmissionValues) => {
            const match = requireAssignment(values.assignmentTitle);
            if (!match) return;
            await getAssignmentsClient().submit(orgId, String(match.id), {
              studentDisplayName: values.studentDisplayName,
              mimeHint: values.mimeHint,
            });
            pushFeedback({
              tone: "success",
              title: t(locale, "assignments", "submitSuccess"),
            });
            await invalidate();
          }}
        >
          <SubmissionFields locale={locale} />
        </SoloForm>
      </section>

      <section className="space-y-3" aria-labelledby="asg-team-heading">
        <h2 id="asg-team-heading" className="text-lg font-medium">
          {t(locale, "assignments", "teamTitle")}
        </h2>
        <SoloForm
          schema={createTeamSchema}
          defaultValues={{
            assignmentTitle: "",
            teamName: "",
            memberNames: "",
          }}
          submitLabel={t(locale, "assignments", "teamSubmit")}
          onSubmit={async (values: CreateTeamValues) => {
            const match = requireAssignment(values.assignmentTitle);
            if (!match) return;
            if (match.collaborationMode !== "group") {
              pushFeedback({
                tone: "error",
                title: t(locale, "assignments", "teamNotGroup"),
              });
              return;
            }
            await getAssignmentsClient().createTeam(orgId, String(match.id), {
              name: values.teamName,
              memberNames: parseMemberNames(values.memberNames),
            });
            pushFeedback({
              tone: "success",
              title: t(locale, "assignments", "teamSuccess"),
            });
            await invalidate();
          }}
        >
          <TeamFields locale={locale} />
        </SoloForm>
      </section>

      <section className="space-y-3" aria-labelledby="asg-peer-heading">
        <h2 id="asg-peer-heading" className="text-lg font-medium">
          {t(locale, "assignments", "peerTitle")}
        </h2>
        <SoloForm
          schema={peerReviewSchema}
          defaultValues={{
            assignmentTitle: "",
            reviewerName: "",
            revieweeName: "",
            score: 80,
          }}
          submitLabel={t(locale, "assignments", "peerSubmit")}
          onSubmit={async (values: PeerReviewValues) => {
            const match = requireAssignment(values.assignmentTitle);
            if (!match) return;
            if (!match.peerReviewEnabled) {
              pushFeedback({
                tone: "error",
                title: t(locale, "assignments", "peerDisabled"),
              });
              return;
            }
            await getAssignmentsClient().addPeerReview(
              orgId,
              String(match.id),
              {
                reviewerName: values.reviewerName,
                revieweeName: values.revieweeName,
                score: values.score,
              },
            );
            pushFeedback({
              tone: "success",
              title: t(locale, "assignments", "peerSuccess"),
            });
            await invalidate();
          }}
        >
          <PeerFields locale={locale} />
        </SoloForm>
      </section>

      <section className="space-y-3" aria-labelledby="asg-revision-heading">
        <h2 id="asg-revision-heading" className="text-lg font-medium">
          {t(locale, "assignments", "revisionTitle")}
        </h2>
        <SoloForm
          schema={revisionRequestSchema}
          defaultValues={{
            assignmentTitle: "",
            studentDisplayName: "",
            note: "",
          }}
          submitLabel={t(locale, "assignments", "revisionSubmit")}
          onSubmit={async (values: RevisionRequestValues) => {
            const match = requireAssignment(values.assignmentTitle);
            if (!match) return;
            if (!canRequestRevision(match)) {
              pushFeedback({
                tone: "error",
                title: t(locale, "assignments", "revisionLimit"),
              });
              return;
            }
            await getAssignmentsClient().requestRevision(
              orgId,
              String(match.id),
              {
                studentDisplayName: values.studentDisplayName,
                note: values.note,
              },
            );
            pushFeedback({
              tone: "success",
              title: t(locale, "assignments", "revisionSuccess"),
            });
            await invalidate();
          }}
        >
          <RevisionFields locale={locale} />
        </SoloForm>
      </section>

      <section className="space-y-3" aria-labelledby="asg-release-heading">
        <h2 id="asg-release-heading" className="text-lg font-medium">
          {t(locale, "assignments", "releaseTitle")}
        </h2>
        <SoloForm
          schema={releaseGradesSchema}
          defaultValues={{ assignmentTitle: "" }}
          submitLabel={t(locale, "assignments", "releaseSubmit")}
          onSubmit={async (values: ReleaseGradesValues) => {
            const match = requireAssignment(values.assignmentTitle);
            if (!match) return;
            await getAssignmentsClient().releaseGrades(orgId, String(match.id));
            pushFeedback({
              tone: "success",
              title: t(locale, "assignments", "releaseSuccess"),
            });
            await invalidate();
          }}
        >
          <ReleaseFields locale={locale} />
        </SoloForm>
      </section>

      <div className="overflow-x-auto">
        {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
        {!listQuery.isLoading && rows.length === 0 ? (
          <EmptyState title={t(locale, "assignments", "empty")} />
        ) : (
          <SoloDataTable
            data={rows}
            columns={columns}
            emptyLabel={t(locale, "assignments", "empty")}
          />
        )}
      </div>
    </OrgShell>
  );
}
