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
  getQuestionBankClient,
  parseQuestionTags,
  stripHtml,
  type BankQuestion,
} from "@/services/question-bank";

import {
  createBankQuestionSchema,
  hasMeaningfulPrompt,
  type CreateBankQuestionValues,
} from "../schemas";

const keys = createQueryKeyFactory("question-bank");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

const QUESTION_TYPES = [
  "mcq",
  "multi_select",
  "true_false",
  "short",
  "essay",
  "fill",
  "match",
  "order",
  "file",
  "audio",
  "image",
] as const;

const VISIBILITIES = [
  "private",
  "personal",
  "shared",
  "school",
  "public",
] as const;

function QuestionFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register, control } = useFormContext<CreateBankQuestionValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="qb-prompt">
          {t(locale, "questionBank", "promptLabel")}
        </Label>
        <Controller
          name="promptHtml"
          control={control}
          render={({ field }) => (
            <SoloContentEditor
              initialHtml={field.value || "<p></p>"}
              onChange={field.onChange}
            />
          )}
        />
        <SoloFieldError name="promptHtml" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qb-type">
          {t(locale, "questionBank", "typeLabel")}
        </Label>
        <select id="qb-type" className={selectClassName} {...register("type")}>
          {QUESTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(locale, "questionBank", `type.${type}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qb-visibility">
          {t(locale, "questionBank", "visibilityLabel")}
        </Label>
        <select
          id="qb-visibility"
          className={selectClassName}
          {...register("visibility")}
        >
          {VISIBILITIES.map((visibility) => (
            <option key={visibility} value={visibility}>
              {t(locale, "questionBank", `visibility.${visibility}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qb-tags">
          {t(locale, "questionBank", "tagsLabel")}
        </Label>
        <Input id="qb-tags" {...register("tags")} />
        <p className="text-muted text-xs">
          {t(locale, "questionBank", "tagsHint")}
        </p>
      </div>
    </>
  );
}

export function OrganizationQuestionBankView() {
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
    queryKey: keys.list(ctx, { resource: "questions" }),
    queryFn: () => getQuestionBankClient().list(orgId),
    enabled: Boolean(sessionQuery.data),
  });
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );

  const columns = useMemo<ColumnDef<BankQuestion, unknown>[]>(
    () => [
      {
        accessorKey: "promptHtml",
        header: t(locale, "questionBank", "colPrompt"),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">
              {stripHtml(row.original.promptHtml) || "—"}
            </p>
            <p className="text-muted text-xs">
              v{row.original.version}
              {row.original.forkedFromId
                ? ` · ${t(locale, "questionBank", "forkedBadge")}`
                : ""}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: t(locale, "questionBank", "colType"),
        cell: ({ row }) =>
          t(locale, "questionBank", `type.${row.original.type}`),
      },
      {
        accessorKey: "visibility",
        header: t(locale, "questionBank", "colVisibility"),
        cell: ({ row }) =>
          t(locale, "questionBank", `visibility.${row.original.visibility}`),
      },
      {
        accessorKey: "tags",
        header: t(locale, "questionBank", "colTags"),
        cell: ({ row }) =>
          row.original.tags.length > 0 ? row.original.tags.join(", ") : "—",
      },
      {
        id: "actions",
        header: t(locale, "questionBank", "colActions"),
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={async () => {
              await getQuestionBankClient().fork(
                orgId,
                String(row.original.id),
              );
              pushFeedback({
                tone: "success",
                title: t(locale, "questionBank", "forkSuccess"),
              });
              await queryClient.invalidateQueries({
                queryKey: keys.all({
                  personaId: sessionQuery.data?.userId,
                  organizationId: orgId,
                  subjectId: null,
                }),
              });
            }}
          >
            {t(locale, "questionBank", "forkSubmit")}
          </Button>
        ),
      },
    ],
    [locale, orgId, queryClient, sessionQuery.data?.userId],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "questionBank", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "questionBank", "forbidden")} />
      </div>
    );
  }

  const rows = listQuery.data?.data ?? [];

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="questionBank"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "questionBank", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "questionBank", "subtitle")}
        </p>
      </header>

      <section className="space-y-3" aria-labelledby="qb-create">
        <h2 id="qb-create" className="font-display text-xl font-medium">
          {t(locale, "questionBank", "createTitle")}
        </h2>
        <SoloForm
          schema={createBankQuestionSchema}
          defaultValues={{
            promptHtml: "<p></p>",
            type: "mcq",
            visibility: "school",
            tags: "",
          }}
          submitLabel={t(locale, "questionBank", "createSubmit")}
          onSubmit={async (values: CreateBankQuestionValues) => {
            if (!hasMeaningfulPrompt(values.promptHtml)) {
              pushFeedback({
                tone: "error",
                title: t(locale, "questionBank", "validation.prompt"),
              });
              return;
            }
            await getQuestionBankClient().create(orgId, {
              promptHtml: values.promptHtml,
              type: values.type,
              visibility: values.visibility,
              tags: parseQuestionTags(values.tags ?? ""),
            });
            pushFeedback({
              tone: "success",
              title: t(locale, "questionBank", "createSuccess"),
            });
            await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
          }}
        >
          <QuestionFields locale={locale} />
        </SoloForm>
      </section>

      <section className="space-y-3" aria-labelledby="qb-list">
        <h2 id="qb-list" className="font-display text-xl font-medium">
          {t(locale, "questionBank", "listTitle")}
        </h2>
        {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
        {listQuery.isError ? (
          <ErrorState title={t(locale, "questionBank", "loadError")} />
        ) : null}
        {!listQuery.isLoading && rows.length === 0 ? (
          <EmptyState title={t(locale, "questionBank", "empty")} />
        ) : (
          <div className="overflow-x-auto">
            <SoloDataTable
              data={rows}
              columns={columns}
              emptyLabel={t(locale, "questionBank", "empty")}
            />
          </div>
        )}
      </section>
    </OrgShell>
  );
}
