"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useFormContext } from "react-hook-form";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { PhoneFields, toE164 } from "@/features/auth";
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
import { studentsQueryKeys } from "@/lib/query/keys";
import { routes } from "@/lib/routes";
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";
import {
  getStudentsManageClient,
  type ManagedStudent,
} from "@/services/students";

import {
  createManagedStudentSchema,
  type CreateManagedStudentValues,
} from "../schemas";

function CreateFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreateManagedStudentValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="student-display-name">
          {t(locale, "students", "displayNameLabel")}
        </Label>
        <Input id="student-display-name" {...register("displayName")} />
        <SoloFieldError name="displayName" />
      </div>
      <PhoneFields locale={locale} />
    </>
  );
}

export function OrganizationStudentsView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const langQuery = locale === "en" ? "?lang=en" : "?lang=fa";

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
    queryKey: studentsQueryKeys.list(ctx, { scope: "org" }),
    queryFn: () => getStudentsManageClient().list(orgId),
    enabled: Boolean(sessionQuery.data),
  });

  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );

  const columns = useMemo<ColumnDef<ManagedStudent, unknown>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: t(locale, "students", "colName"),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.displayName}</p>
            <p className="text-muted text-xs">{row.original.phoneMasked}</p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t(locale, "students", "colStatus"),
        cell: ({ row }) =>
          t(locale, "students", `status.${row.original.status}`),
      },
      {
        accessorKey: "guardiansCount",
        header: t(locale, "students", "colGuardians"),
      },
      {
        id: "open",
        header: "",
        cell: ({ row }) => (
          <Link
            className="text-brand text-sm underline"
            href={`${routes.organization.student(orgId, row.original.id)}${langQuery}`}
          >
            {t(locale, "students", "openDetail")}
          </Link>
        ),
      },
    ],
    [locale, orgId, langQuery],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }

  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "students", "loadError")} />
      </div>
    );
  }

  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "students", "forbidden")} />
      </div>
    );
  }

  const rows = listQuery.data?.data ?? [];

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgId}
      orgName={orgQuery.data.name}
      active="students"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "students", "listTitle")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "students", "listSubtitle")}
        </p>
      </header>

      <section className="space-y-3" aria-labelledby="add-student">
        <h2 id="add-student" className="font-display text-xl font-medium">
          {t(locale, "students", "createTitle")}
        </h2>
        <SoloForm
          schema={createManagedStudentSchema}
          defaultValues={{
            displayName: "",
            callingCode: "+98",
            nationalNumber: "",
          }}
          submitLabel={t(locale, "students", "createSubmit")}
          onSubmit={async (values) => {
            await getStudentsManageClient().create(orgId, {
              displayName: values.displayName,
              phoneE164: toE164(values.callingCode, values.nationalNumber),
            });
            pushFeedback({
              tone: "success",
              title: t(locale, "students", "createSuccess"),
            });
            await queryClient.invalidateQueries({
              queryKey: studentsQueryKeys.all(ctx),
            });
          }}
        >
          <CreateFields locale={locale} />
        </SoloForm>
      </section>

      <section className="space-y-3">
        {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
        {listQuery.isError ? (
          <ErrorState title={t(locale, "students", "loadError")} />
        ) : null}
        {!listQuery.isLoading && rows.length === 0 ? (
          <EmptyState title={t(locale, "students", "empty")} />
        ) : (
          <SoloDataTable
            data={rows}
            columns={columns}
            emptyLabel={t(locale, "students", "empty")}
          />
        )}
      </section>
    </OrgShell>
  );
}
