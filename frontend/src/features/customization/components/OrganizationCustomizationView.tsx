"use client";

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
import { getCustomizationClient } from "@/services/customization";
import {
  createFieldSchema,
  createStatusSchema,
  createTagSchema,
  type CreateFieldValues,
  type CreateStatusValues,
  type CreateTagValues,
} from "../schemas";

const keys = createQueryKeyFactory("customization");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function FieldFormFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreateFieldValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="cf-name">
          {t(locale, "customization", "nameLabel")}
        </Label>
        <Input id="cf-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cf-type">
          {t(locale, "customization", "typeLabel")}
        </Label>
        <select
          id="cf-type"
          className={selectClassName}
          {...register("fieldType")}
        >
          <option value="text">
            {t(locale, "customization", "type.text")}
          </option>
          <option value="number">
            {t(locale, "customization", "type.number")}
          </option>
          <option value="select">
            {t(locale, "customization", "type.select")}
          </option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cf-entity">
          {t(locale, "customization", "entityLabel")}
        </Label>
        <select
          id="cf-entity"
          className={selectClassName}
          {...register("entityTarget")}
        >
          <option value="student">
            {t(locale, "customization", "entity.student")}
          </option>
          <option value="task">
            {t(locale, "customization", "entity.task")}
          </option>
          <option value="form">
            {t(locale, "customization", "entity.form")}
          </option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cf-options">
          {t(locale, "customization", "optionsLabel")}
        </Label>
        <Input id="cf-options" {...register("options")} />
        <SoloFieldError name="options" />
      </div>
      <div className="flex min-h-11 items-center gap-2">
        <input
          id="cf-req"
          type="checkbox"
          className="size-4"
          {...register("required")}
        />
        <Label htmlFor="cf-req">
          {t(locale, "customization", "requiredLabel")}
        </Label>
      </div>
    </>
  );
}

function StatusFormFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreateStatusValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="cs-name">
          {t(locale, "customization", "nameLabel")}
        </Label>
        <Input id="cs-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cs-entity">
          {t(locale, "customization", "entityLabel")}
        </Label>
        <select
          id="cs-entity"
          className={selectClassName}
          {...register("entityTarget")}
        >
          <option value="student">
            {t(locale, "customization", "entity.student")}
          </option>
          <option value="task">
            {t(locale, "customization", "entity.task")}
          </option>
          <option value="form">
            {t(locale, "customization", "entity.form")}
          </option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cs-color">
          {t(locale, "customization", "colorLabel")}
        </Label>
        <Input id="cs-color" {...register("colorKey")} />
        <SoloFieldError name="colorKey" />
      </div>
    </>
  );
}

function TagFormFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreateTagValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="tg-name">
          {t(locale, "customization", "nameLabel")}
        </Label>
        <Input id="tg-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tg-color">
          {t(locale, "customization", "colorLabel")}
        </Label>
        <Input id="tg-color" {...register("colorKey")} />
        <SoloFieldError name="colorKey" />
      </div>
    </>
  );
}

export function OrganizationCustomizationView() {
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
  const bundleQuery = useQuery({
    queryKey: keys.detail(ctx, "bundle"),
    queryFn: () => getCustomizationClient().get(orgId),
    enabled: canManage.allowed,
  });

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "customization", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "customization", "forbidden")} />
      </div>
    );
  }

  const bundle = bundleQuery.data;

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="customization"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "customization", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "customization", "subtitle")}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-lg">
          {t(locale, "customization", "fieldsHeading")}
        </h2>
        <SoloForm
          schema={createFieldSchema}
          defaultValues={{
            name: "",
            fieldType: "text",
            entityTarget: "student",
            options: "",
            required: false,
          }}
          submitLabel={t(locale, "customization", "createField")}
          onSubmit={async (values: CreateFieldValues) => {
            await getCustomizationClient().createField(orgId, values);
            pushFeedback({
              tone: "success",
              title: t(locale, "customization", "fieldSuccess"),
            });
            await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
          }}
        >
          <FieldFormFields locale={locale} />
        </SoloForm>
        {!bundleQuery.isLoading && (bundle?.fields.length ?? 0) === 0 ? (
          <EmptyState title={t(locale, "customization", "fieldsEmpty")} />
        ) : (
          <SoloDataTable
            data={bundle?.fields ?? []}
            columns={[
              {
                accessorKey: "name",
                header: t(locale, "customization", "colName"),
              },
              {
                id: "type",
                header: t(locale, "customization", "colType"),
                cell: ({ row }) =>
                  t(locale, "customization", `type.${row.original.fieldType}`),
              },
              {
                id: "entity",
                header: t(locale, "customization", "colEntity"),
                cell: ({ row }) =>
                  t(
                    locale,
                    "customization",
                    `entity.${row.original.entityTarget}`,
                  ),
              },
            ]}
            emptyLabel={t(locale, "customization", "fieldsEmpty")}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg">
          {t(locale, "customization", "statusesHeading")}
        </h2>
        <SoloForm
          schema={createStatusSchema}
          defaultValues={{
            name: "",
            entityTarget: "task",
            colorKey: "teal",
          }}
          submitLabel={t(locale, "customization", "createStatus")}
          onSubmit={async (values: CreateStatusValues) => {
            await getCustomizationClient().createStatus(orgId, values);
            pushFeedback({
              tone: "success",
              title: t(locale, "customization", "statusSuccess"),
            });
            await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
          }}
        >
          <StatusFormFields locale={locale} />
        </SoloForm>
        <SoloDataTable
          data={bundle?.statuses ?? []}
          columns={[
            {
              accessorKey: "name",
              header: t(locale, "customization", "colName"),
            },
            {
              accessorKey: "colorKey",
              header: t(locale, "customization", "colColor"),
            },
          ]}
          emptyLabel={t(locale, "customization", "statusesEmpty")}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg">
          {t(locale, "customization", "tagsHeading")}
        </h2>
        <SoloForm
          schema={createTagSchema}
          defaultValues={{ name: "", colorKey: "slate" }}
          submitLabel={t(locale, "customization", "createTag")}
          onSubmit={async (values: CreateTagValues) => {
            await getCustomizationClient().createTag(orgId, values);
            pushFeedback({
              tone: "success",
              title: t(locale, "customization", "tagSuccess"),
            });
            await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
          }}
        >
          <TagFormFields locale={locale} />
        </SoloForm>
        <SoloDataTable
          data={bundle?.tags ?? []}
          columns={[
            {
              accessorKey: "name",
              header: t(locale, "customization", "colName"),
            },
            {
              accessorKey: "colorKey",
              header: t(locale, "customization", "colColor"),
            },
          ]}
          emptyLabel={t(locale, "customization", "tagsEmpty")}
        />
      </section>
    </OrgShell>
  );
}
