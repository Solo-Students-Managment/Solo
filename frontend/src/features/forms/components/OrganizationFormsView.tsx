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
import { routes } from "@/lib/routes";
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";
import { getFormsClient, type SurveyForm } from "@/services/forms";
import {
  createSurveyFormSchema,
  type CreateSurveyFormValues,
} from "../schemas";

const keys = createQueryKeyFactory("forms");

function FormFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateSurveyFormValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="frm-title">{t(locale, "forms", "titleLabel")}</Label>
        <Input id="frm-title" {...register("title")} />
        <SoloFieldError name="title" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="frm-desc">
          {t(locale, "forms", "descriptionLabel")}
        </Label>
        <Input id="frm-desc" {...register("description")} />
        <SoloFieldError name="description" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="frm-q">{t(locale, "forms", "questionLabel")}</Label>
        <Input id="frm-q" {...register("questionText")} />
        <SoloFieldError name="questionText" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="frm-slug">{t(locale, "forms", "slugLabel")}</Label>
        <Input id="frm-slug" {...register("slug")} />
        <SoloFieldError name="slug" />
      </div>
    </>
  );
}

export function OrganizationFormsView() {
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
    queryFn: () => getFormsClient().list(orgId),
    enabled: canManage.allowed,
  });

  const columns = useMemo<ColumnDef<SurveyForm, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "forms", "colTitle") },
      { accessorKey: "slug", header: t(locale, "forms", "colSlug") },
      {
        id: "status",
        header: t(locale, "forms", "colStatus"),
        cell: ({ row }) => t(locale, "forms", `status.${row.original.status}`),
      },
      {
        id: "actions",
        header: t(locale, "forms", "colActions"),
        cell: ({ row }) =>
          row.original.status === "draft" ? (
            <Button
              type="button"
              className="min-h-11"
              onClick={async () => {
                await getFormsClient().publish(orgId, String(row.original.id));
                pushFeedback({
                  tone: "success",
                  title: t(locale, "forms", "publishSuccess"),
                });
                await queryClient.invalidateQueries({
                  queryKey: keys.all(ctx),
                });
              }}
            >
              {t(locale, "forms", "publish")}
            </Button>
          ) : (
            <a
              className="text-brand underline"
              href={routes.public.form(row.original.slug)}
              target="_blank"
              rel="noreferrer"
            >
              {t(locale, "forms", "openPublic")}
            </a>
          ),
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
        <ErrorState title={t(locale, "forms", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "forms", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="forms"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "forms", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "forms", "subtitle")}</p>
      </header>

      <SoloForm
        schema={createSurveyFormSchema}
        defaultValues={{
          title: "",
          description: "",
          questionText: "",
          slug: "",
        }}
        submitLabel={t(locale, "forms", "createForm")}
        onSubmit={async (values: CreateSurveyFormValues) => {
          await getFormsClient().create(orgId, values);
          pushFeedback({
            tone: "success",
            title: t(locale, "forms", "createSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <FormFields locale={locale} />
      </SoloForm>

      {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!listQuery.isLoading && (listQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "forms", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={listQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "forms", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
