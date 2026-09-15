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
  getOnboardingClient,
  type OnboardingCase,
} from "@/services/onboarding";

import {
  createOnboardingSchema,
  type CreateOnboardingValues,
} from "../schemas";

const keys = createQueryKeyFactory("onboarding");

function OnboardingFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreateOnboardingValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="onb-staff">
          {t(locale, "onboarding", "staffLabel")}
        </Label>
        <Input id="onb-staff" {...register("staffDisplayName")} />
        <SoloFieldError name="staffDisplayName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="onb-role">{t(locale, "onboarding", "roleLabel")}</Label>
        <Input id="onb-role" {...register("roleTemplate")} />
        <SoloFieldError name="roleTemplate" />
      </div>
    </>
  );
}

export function OrganizationOnboardingView() {
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
    queryFn: () => getOnboardingClient().list(orgId),
    enabled: canManage.allowed,
  });

  const columns = useMemo<ColumnDef<OnboardingCase, unknown>[]>(
    () => [
      {
        accessorKey: "staffDisplayName",
        header: t(locale, "onboarding", "colStaff"),
      },
      {
        accessorKey: "roleTemplate",
        header: t(locale, "onboarding", "colRole"),
      },
      {
        id: "status",
        header: t(locale, "onboarding", "colStatus"),
        cell: ({ row }) =>
          t(locale, "onboarding", `status.${row.original.status}`),
      },
      {
        id: "step",
        header: t(locale, "onboarding", "colStep"),
        cell: ({ row }) =>
          t(locale, "onboarding", `step.${row.original.currentStep}`),
      },
      {
        id: "actions",
        header: t(locale, "onboarding", "colActions"),
        cell: ({ row }) =>
          row.original.status === "in_progress" ? (
            <Button
              type="button"
              className="min-h-11"
              onClick={async () => {
                await getOnboardingClient().advance(
                  orgId,
                  String(row.original.id),
                );
                pushFeedback({
                  tone: "success",
                  title: t(locale, "onboarding", "advanceSuccess"),
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
              {t(locale, "onboarding", "advance")}
            </Button>
          ) : (
            "—"
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
        <ErrorState title={t(locale, "onboarding", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "onboarding", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="onboarding"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "onboarding", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "onboarding", "subtitle")}
        </p>
      </header>

      <SoloForm
        schema={createOnboardingSchema}
        defaultValues={{ staffDisplayName: "", roleTemplate: "teacher" }}
        submitLabel={t(locale, "onboarding", "createCase")}
        onSubmit={async (values: CreateOnboardingValues) => {
          await getOnboardingClient().create(orgId, {
            staffDisplayName: values.staffDisplayName,
            roleTemplate: values.roleTemplate,
          });
          pushFeedback({
            tone: "success",
            title: t(locale, "onboarding", "caseSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <OnboardingFields locale={locale} />
      </SoloForm>

      {casesQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!casesQuery.isLoading && (casesQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "onboarding", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={casesQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "onboarding", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
