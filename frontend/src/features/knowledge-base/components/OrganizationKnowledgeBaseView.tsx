"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Controller, useFormContext } from "react-hook-form";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { SoloContentEditor } from "@/components/shared/SoloContentEditor";
import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
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
  canTransitionKbStatus,
  getKnowledgeBaseClient,
  type KbArticle,
  type KbArticleStatus,
} from "@/services/knowledge-base";
import { createKbArticleSchema, type CreateKbArticleValues } from "../schemas";

const keys = createQueryKeyFactory("knowledge-base");

function ArticleFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register, control } = useFormContext<CreateKbArticleValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="kb-title">
          {t(locale, "knowledgeBase", "titleLabel")}
        </Label>
        <Input id="kb-title" {...register("title")} />
        <SoloFieldError name="title" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="kb-space">
          {t(locale, "knowledgeBase", "spaceLabel")}
        </Label>
        <Input id="kb-space" {...register("spaceName")} />
        <SoloFieldError name="spaceName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="kb-body">
          {t(locale, "knowledgeBase", "bodyLabel")}
        </Label>
        <Controller
          name="bodyHtml"
          control={control}
          render={({ field }) => (
            <SoloContentEditor
              initialHtml={field.value || "<p></p>"}
              onChange={field.onChange}
            />
          )}
        />
        <SoloFieldError name="bodyHtml" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="kb-tags">
          {t(locale, "knowledgeBase", "tagsLabel")}
        </Label>
        <Input id="kb-tags" {...register("tags")} />
      </div>
    </>
  );
}

export function OrganizationKnowledgeBaseView() {
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
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );
  const listQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getKnowledgeBaseClient().list(orgId),
    enabled: canManage.allowed,
  });

  async function transition(row: KbArticle, status: KbArticleStatus) {
    if (!canTransitionKbStatus(row.status, status)) {
      pushFeedback({
        tone: "error",
        title: t(locale, "knowledgeBase", "invalidTransition"),
      });
      return;
    }
    await getKnowledgeBaseClient().updateStatus(orgId, String(row.id), status);
    pushFeedback({
      tone: "success",
      title: t(locale, "knowledgeBase", "statusSuccess"),
    });
    await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
  }

  const columns = useMemo<ColumnDef<KbArticle, unknown>[]>(
    () => [
      {
        accessorKey: "title",
        header: t(locale, "knowledgeBase", "colTitle"),
      },
      {
        accessorKey: "spaceName",
        header: t(locale, "knowledgeBase", "colSpace"),
      },
      {
        accessorKey: "tags",
        header: t(locale, "knowledgeBase", "colTags"),
        cell: ({ row }) => row.original.tags || "—",
      },
      {
        id: "status",
        header: t(locale, "knowledgeBase", "colStatus"),
        cell: ({ row }) =>
          t(locale, "knowledgeBase", `status.${row.original.status}`),
      },
      {
        accessorKey: "version",
        header: t(locale, "knowledgeBase", "colVersion"),
      },
      {
        id: "actions",
        header: t(locale, "knowledgeBase", "colActions"),
        cell: ({ row }) => {
          const article = row.original;
          return (
            <div className="flex flex-wrap gap-2">
              {canTransitionKbStatus(article.status, "in_review") ? (
                <Button
                  type="button"
                  className="min-h-11"
                  onClick={() => void transition(article, "in_review")}
                >
                  {t(locale, "knowledgeBase", "submitReview")}
                </Button>
              ) : null}
              {canTransitionKbStatus(article.status, "published") ? (
                <Button
                  type="button"
                  className="min-h-11"
                  onClick={() => void transition(article, "published")}
                >
                  {t(locale, "knowledgeBase", "publish")}
                </Button>
              ) : null}
              {canTransitionKbStatus(article.status, "draft") ? (
                <Button
                  type="button"
                  className="min-h-11"
                  onClick={() => void transition(article, "draft")}
                >
                  {t(locale, "knowledgeBase", "revertDraft")}
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, orgId],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "knowledgeBase", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "knowledgeBase", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="knowledgeBase"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "knowledgeBase", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "knowledgeBase", "subtitle")}
        </p>
      </header>

      <SoloForm
        schema={createKbArticleSchema}
        defaultValues={{
          title: "",
          spaceName: "",
          bodyHtml: "<p></p>",
          tags: "",
        }}
        submitLabel={t(locale, "knowledgeBase", "createArticle")}
        onSubmit={async (values: CreateKbArticleValues) => {
          await getKnowledgeBaseClient().create(orgId, values);
          pushFeedback({
            tone: "success",
            title: t(locale, "knowledgeBase", "createSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <ArticleFields locale={locale} />
      </SoloForm>

      {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!listQuery.isLoading && (listQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "knowledgeBase", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={listQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "knowledgeBase", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
