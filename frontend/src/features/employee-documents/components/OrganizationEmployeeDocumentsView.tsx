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
  getEmployeeDocumentsClient,
  type EmployeeDocument,
} from "@/services/employee-documents";

import {
  createEmployeeDocumentSchema,
  type CreateEmployeeDocumentValues,
} from "../schemas";

const keys = createQueryKeyFactory("employee-documents");

function DocumentFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreateEmployeeDocumentValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="edoc-staff">
          {t(locale, "employeeDocuments", "staffLabel")}
        </Label>
        <Input id="edoc-staff" {...register("staffDisplayName")} />
        <SoloFieldError name="staffDisplayName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edoc-title">
          {t(locale, "employeeDocuments", "titleLabel")}
        </Label>
        <Input id="edoc-title" {...register("title")} />
        <SoloFieldError name="title" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edoc-cat">
          {t(locale, "employeeDocuments", "categoryLabel")}
        </Label>
        <Input id="edoc-cat" {...register("category")} />
        <SoloFieldError name="category" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edoc-exp">
          {t(locale, "employeeDocuments", "expiresLabel")}
        </Label>
        <Input id="edoc-exp" type="date" {...register("expiresOn")} />
      </div>
    </>
  );
}

export function OrganizationEmployeeDocumentsView() {
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
  const docsQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getEmployeeDocumentsClient().list(orgId),
    enabled: canManage.allowed,
  });

  const columns = useMemo<ColumnDef<EmployeeDocument, unknown>[]>(
    () => [
      {
        accessorKey: "staffDisplayName",
        header: t(locale, "employeeDocuments", "colStaff"),
      },
      {
        accessorKey: "title",
        header: t(locale, "employeeDocuments", "colTitle"),
      },
      {
        accessorKey: "category",
        header: t(locale, "employeeDocuments", "colCategory"),
      },
      {
        accessorKey: "status",
        header: t(locale, "employeeDocuments", "colStatus"),
        cell: ({ row }) =>
          t(locale, "employeeDocuments", `status.${row.original.status}`),
      },
      {
        id: "expires",
        header: t(locale, "employeeDocuments", "colExpires"),
        cell: ({ row }) => row.original.expiresOn ?? "—",
      },
    ],
    [locale],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "employeeDocuments", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "employeeDocuments", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="employeeDocuments"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "employeeDocuments", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "employeeDocuments", "subtitle")}
        </p>
      </header>
      <SoloForm
        schema={createEmployeeDocumentSchema}
        defaultValues={{
          staffDisplayName: "",
          title: "",
          category: "",
          expiresOn: "",
        }}
        submitLabel={t(locale, "employeeDocuments", "createDocument")}
        onSubmit={async (values: CreateEmployeeDocumentValues) => {
          await getEmployeeDocumentsClient().create(orgId, {
            staffDisplayName: values.staffDisplayName,
            title: values.title,
            category: values.category,
            expiresOn: values.expiresOn || null,
          });
          pushFeedback({
            tone: "success",
            title: t(locale, "employeeDocuments", "documentSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <DocumentFields locale={locale} />
      </SoloForm>
      {docsQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!docsQuery.isLoading && (docsQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "employeeDocuments", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={docsQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "employeeDocuments", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
