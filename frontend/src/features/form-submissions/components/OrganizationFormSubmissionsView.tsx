"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { OrgShell } from "@/features/organization";
import {
  Button,
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
  canDecideSubmission,
  getFormsClient,
  type FormSubmission,
} from "@/services/forms";

const keys = createQueryKeyFactory("form-submissions");

export function OrganizationFormSubmissionsView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [comments, setComments] = useState<Record<string, string>>({});

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
  const listQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getFormsClient().listSubmissions(orgId),
    enabled: canManage.allowed,
  });

  const columns = useMemo<ColumnDef<FormSubmission, unknown>[]>(
    () => [
      {
        accessorKey: "formTitle",
        header: t(locale, "formSubmissions", "colForm"),
      },
      {
        accessorKey: "consentName",
        header: t(locale, "formSubmissions", "colConsentName"),
      },
      {
        accessorKey: "answerText",
        header: t(locale, "formSubmissions", "colAnswer"),
      },
      {
        id: "reviewStatus",
        header: t(locale, "formSubmissions", "colStatus"),
        cell: ({ row }) =>
          t(locale, "formSubmissions", `status.${row.original.reviewStatus}`),
      },
      {
        accessorKey: "internalComment",
        header: t(locale, "formSubmissions", "colComment"),
        cell: ({ row }) => row.original.internalComment || "—",
      },
      {
        id: "actions",
        header: t(locale, "formSubmissions", "colActions"),
        cell: ({ row }) => {
          const submission = row.original;
          const id = String(submission.id);
          return (
            <div className="flex min-w-64 flex-col gap-2">
              <div className="space-y-1">
                <Label htmlFor={`cmt-${id}`}>
                  {t(locale, "formSubmissions", "commentLabel")}
                </Label>
                <Input
                  id={`cmt-${id}`}
                  value={comments[id] ?? ""}
                  onChange={(e) =>
                    setComments((prev) => ({ ...prev, [id]: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="min-h-11"
                  onClick={async () => {
                    const comment = (comments[id] ?? "").trim();
                    if (!comment) {
                      pushFeedback({
                        tone: "error",
                        title: t(
                          locale,
                          "formSubmissions",
                          "validation.comment",
                        ),
                      });
                      return;
                    }
                    await getFormsClient().commentSubmission(
                      orgId,
                      id,
                      comment,
                    );
                    pushFeedback({
                      tone: "success",
                      title: t(locale, "formSubmissions", "commentSuccess"),
                    });
                    await queryClient.invalidateQueries({
                      queryKey: keys.all(ctx),
                    });
                  }}
                >
                  {t(locale, "formSubmissions", "saveComment")}
                </Button>
                {canDecideSubmission(submission.reviewStatus) ? (
                  <>
                    <Button
                      type="button"
                      className="min-h-11"
                      onClick={async () => {
                        await getFormsClient().decideSubmission(
                          orgId,
                          id,
                          "approved",
                        );
                        pushFeedback({
                          tone: "success",
                          title: t(locale, "formSubmissions", "decideSuccess"),
                        });
                        await queryClient.invalidateQueries({
                          queryKey: keys.all(ctx),
                        });
                      }}
                    >
                      {t(locale, "formSubmissions", "approve")}
                    </Button>
                    <Button
                      type="button"
                      className="min-h-11"
                      onClick={async () => {
                        await getFormsClient().decideSubmission(
                          orgId,
                          id,
                          "rejected",
                        );
                        pushFeedback({
                          tone: "success",
                          title: t(locale, "formSubmissions", "decideSuccess"),
                        });
                        await queryClient.invalidateQueries({
                          queryKey: keys.all(ctx),
                        });
                      }}
                    >
                      {t(locale, "formSubmissions", "reject")}
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, orgId, comments],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "formSubmissions", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "formSubmissions", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="formSubmissions"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "formSubmissions", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "formSubmissions", "subtitle")}
        </p>
      </header>

      {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!listQuery.isLoading && (listQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "formSubmissions", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={listQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "formSubmissions", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
