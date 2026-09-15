"use client";

import { useMemo, useState } from "react";
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
  getAutomationClient,
  requiresApprovalGate,
  type AutomationRule,
} from "@/services/automation";
import {
  createAutomationSchema,
  type CreateAutomationValues,
} from "../schemas";

const keys = createQueryKeyFactory("automation");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function AutomationFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreateAutomationValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="aut-name">{t(locale, "automation", "nameLabel")}</Label>
        <Input id="aut-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="aut-trigger">
          {t(locale, "automation", "triggerLabel")}
        </Label>
        <select
          id="aut-trigger"
          className={selectClassName}
          {...register("triggerType")}
        >
          <option value="webhook">
            {t(locale, "automation", "trigger.webhook")}
          </option>
          <option value="schedule">
            {t(locale, "automation", "trigger.schedule")}
          </option>
          <option value="form_submitted">
            {t(locale, "automation", "trigger.form_submitted")}
          </option>
          <option value="enrollment_created">
            {t(locale, "automation", "trigger.enrollment_created")}
          </option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="aut-risk">{t(locale, "automation", "riskLabel")}</Label>
        <select
          id="aut-risk"
          className={selectClassName}
          {...register("riskLevel")}
        >
          <option value="low">{t(locale, "automation", "risk.low")}</option>
          <option value="medium">
            {t(locale, "automation", "risk.medium")}
          </option>
          <option value="high">{t(locale, "automation", "risk.high")}</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="aut-steps">
          {t(locale, "automation", "stepsLabel")}
        </Label>
        <textarea
          id="aut-steps"
          className="border-border bg-elevated min-h-20 w-full rounded-md border px-2 py-2 text-sm"
          {...register("stepsSummary")}
        />
        <SoloFieldError name="stepsSummary" />
      </div>
    </>
  );
}

function ActivateRowActions({
  rule,
  locale,
  onActivate,
}: {
  rule: AutomationRule;
  locale: ReturnType<typeof resolveLocale>;
  onActivate: (approvalGranted: boolean) => Promise<void>;
}) {
  const [approvalGranted, setApprovalGranted] = useState(false);
  const needsApproval = requiresApprovalGate(rule.riskLevel);

  if (rule.status === "active") {
    return (
      <span className="text-muted text-sm">
        {t(locale, "automation", "status.active")}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {needsApproval ? (
        <>
          <p className="text-warning text-xs">
            {t(locale, "automation", "approvalHint")}
          </p>
          <div className="flex min-h-11 items-center gap-2">
            <input
              id={`aut-approval-${String(rule.id)}`}
              type="checkbox"
              className="size-4"
              checked={approvalGranted}
              onChange={(event) => setApprovalGranted(event.target.checked)}
            />
            <Label htmlFor={`aut-approval-${String(rule.id)}`}>
              {t(locale, "automation", "approvalGrantedLabel")}
            </Label>
          </div>
        </>
      ) : null}
      <Button
        type="button"
        className="min-h-11"
        disabled={needsApproval && !approvalGranted}
        onClick={() => void onActivate(approvalGranted)}
      >
        {t(locale, "automation", "activate")}
      </Button>
    </div>
  );
}

export function OrganizationAutomationView() {
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
    queryFn: () => getAutomationClient().list(orgId),
    enabled: canManage.allowed,
  });

  async function refreshList() {
    await queryClient.refetchQueries({ queryKey: keys.lists(ctx) });
  }

  async function activateRule(rule: AutomationRule, approvalGranted: boolean) {
    try {
      await getAutomationClient().activate(orgId, String(rule.id), {
        approvalGranted: requiresApprovalGate(rule.riskLevel)
          ? approvalGranted
          : undefined,
      });
      pushFeedback({
        tone: "success",
        title: t(locale, "automation", "activateSuccess"),
      });
      await refreshList();
    } catch {
      pushFeedback({
        tone: "error",
        title: t(locale, "automation", "approvalRequired"),
      });
    }
  }

  const columns = useMemo<ColumnDef<AutomationRule, unknown>[]>(
    () => [
      { accessorKey: "name", header: t(locale, "automation", "colName") },
      {
        id: "trigger",
        header: t(locale, "automation", "colTrigger"),
        cell: ({ row }) =>
          t(locale, "automation", `trigger.${row.original.triggerType}`),
      },
      {
        id: "risk",
        header: t(locale, "automation", "colRisk"),
        cell: ({ row }) =>
          t(locale, "automation", `risk.${row.original.riskLevel}`),
      },
      {
        id: "status",
        header: t(locale, "automation", "colStatus"),
        cell: ({ row }) =>
          t(locale, "automation", `status.${row.original.status}`),
      },
      {
        accessorKey: "stepsSummary",
        header: t(locale, "automation", "colSteps"),
      },
      {
        id: "actions",
        header: t(locale, "automation", "colActions"),
        cell: ({ row }) => (
          <ActivateRowActions
            rule={row.original}
            locale={locale}
            onActivate={(approvalGranted) =>
              activateRule(row.original, approvalGranted)
            }
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, orgId, sessionQuery.data?.userId],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "automation", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "automation", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="automation"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "automation", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "automation", "subtitle")}
        </p>
      </header>

      <SoloForm
        schema={createAutomationSchema}
        defaultValues={{
          name: "",
          triggerType: "webhook",
          riskLevel: "low",
          stepsSummary: "",
        }}
        submitLabel={t(locale, "automation", "createRule")}
        onSubmit={async (values: CreateAutomationValues) => {
          await getAutomationClient().create(orgId, values);
          pushFeedback({
            tone: "success",
            title: t(locale, "automation", "createSuccess"),
          });
          await queryClient.refetchQueries({ queryKey: keys.lists(ctx) });
        }}
      >
        <AutomationFields locale={locale} />
      </SoloForm>

      {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!listQuery.isLoading && (listQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "automation", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={listQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "automation", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
