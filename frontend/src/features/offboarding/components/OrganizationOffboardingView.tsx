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
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";
import {
  getOffboardingClient,
  type OffboardingCase,
} from "@/services/offboarding";
import {
  createOffboardingSchema,
  type CreateOffboardingValues,
} from "../schemas";

const keys = createQueryKeyFactory("offboarding");

function OffboardingFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreateOffboardingValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="off-staff">
          {t(locale, "offboarding", "staffLabel")}
        </Label>
        <Input id="off-staff" {...register("staffDisplayName")} />
        <SoloFieldError name="staffDisplayName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="off-day">{t(locale, "offboarding", "dayLabel")}</Label>
        <Input id="off-day" type="date" {...register("lastWorkingDay")} />
        <SoloFieldError name="lastWorkingDay" />
      </div>
    </>
  );
}

export function OrganizationOffboardingView() {
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
  const casesQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getOffboardingClient().list(orgId),
    enabled: canManage.allowed,
  });

  const columns = useMemo<ColumnDef<OffboardingCase, unknown>[]>(
    () => [
      {
        accessorKey: "staffDisplayName",
        header: t(locale, "offboarding", "colStaff"),
      },
      {
        accessorKey: "lastWorkingDay",
        header: t(locale, "offboarding", "colDay"),
      },
      {
        id: "status",
        header: t(locale, "offboarding", "colStatus"),
        cell: ({ row }) =>
          t(locale, "offboarding", `status.${row.original.status}`),
      },
      {
        id: "step",
        header: t(locale, "offboarding", "colStep"),
        cell: ({ row }) =>
          t(locale, "offboarding", `step.${row.original.currentStep}`),
      },
      {
        id: "actions",
        header: t(locale, "offboarding", "colActions"),
        cell: ({ row }) =>
          row.original.status === "in_progress" ? (
            <Button
              type="button"
              className="min-h-11"
              onClick={async () => {
                await getOffboardingClient().advance(
                  orgId,
                  String(row.original.id),
                );
                pushFeedback({
                  tone: "success",
                  title: t(locale, "offboarding", "advanceSuccess"),
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
              {t(locale, "offboarding", "advance")}
            </Button>
          ) : (
            "—"
          ),
      },
    ],
    [locale, orgId, queryClient, sessionQuery.data?.userId],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "offboarding", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "offboarding", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="offboarding"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "offboarding", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "offboarding", "subtitle")}
        </p>
      </header>
      <SoloForm
        schema={createOffboardingSchema}
        defaultValues={{
          staffDisplayName: "",
          lastWorkingDay: new Date().toISOString().slice(0, 10),
        }}
        submitLabel={t(locale, "offboarding", "createCase")}
        onSubmit={async (values: CreateOffboardingValues) => {
          await getOffboardingClient().create(orgId, {
            staffDisplayName: values.staffDisplayName,
            lastWorkingDay: values.lastWorkingDay,
          });
          pushFeedback({
            tone: "success",
            title: t(locale, "offboarding", "caseSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <OffboardingFields locale={locale} />
      </SoloForm>
      {casesQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!casesQuery.isLoading && (casesQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "offboarding", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={casesQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "offboarding", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
