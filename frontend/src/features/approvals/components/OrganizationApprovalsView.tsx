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
  canActorDecide,
  getApprovalsClient,
  type ApprovalRequest,
} from "@/services/approvals";
import { createApprovalSchema, type CreateApprovalValues } from "../schemas";

const keys = createQueryKeyFactory("approvals");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function ApprovalFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<CreateApprovalValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="apr-title">
          {t(locale, "approvals", "titleLabel")}
        </Label>
        <Input id="apr-title" {...register("title")} />
        <SoloFieldError name="title" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="apr-req">
          {t(locale, "approvals", "requesterLabel")}
        </Label>
        <Input id="apr-req" {...register("requesterDisplayName")} />
        <SoloFieldError name="requesterDisplayName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="apr-mode">{t(locale, "approvals", "modeLabel")}</Label>
        <select id="apr-mode" className={selectClassName} {...register("mode")}>
          <option value="sequential">
            {t(locale, "approvals", "mode.sequential")}
          </option>
          <option value="parallel">
            {t(locale, "approvals", "mode.parallel")}
          </option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="apr-sum">
          {t(locale, "approvals", "summaryLabel")}
        </Label>
        <textarea
          id="apr-sum"
          className="border-border bg-elevated min-h-20 w-full rounded-md border px-2 py-2 text-sm"
          {...register("summary")}
        />
        <SoloFieldError name="summary" />
      </div>
    </>
  );
}

export function OrganizationApprovalsView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [actorName, setActorName] = useState("Manager");

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
    queryFn: () => getApprovalsClient().list(orgId),
    enabled: canManage.allowed,
  });

  async function decide(
    row: ApprovalRequest,
    decision: "approved" | "rejected" | "changes_requested",
  ) {
    if (!canActorDecide(row, actorName)) {
      pushFeedback({
        tone: "error",
        title: t(locale, "approvals", "selfBlocked"),
      });
      return;
    }
    await getApprovalsClient().decide(
      orgId,
      String(row.id),
      decision,
      actorName,
    );
    pushFeedback({
      tone: "success",
      title: t(locale, "approvals", "decideSuccess"),
    });
    await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
  }

  const columns = useMemo<ColumnDef<ApprovalRequest, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "approvals", "colTitle") },
      {
        accessorKey: "requesterDisplayName",
        header: t(locale, "approvals", "colRequester"),
      },
      {
        id: "mode",
        header: t(locale, "approvals", "colMode"),
        cell: ({ row }) => t(locale, "approvals", `mode.${row.original.mode}`),
      },
      {
        id: "status",
        header: t(locale, "approvals", "colStatus"),
        cell: ({ row }) =>
          t(locale, "approvals", `status.${row.original.status}`),
      },
      {
        id: "actions",
        header: t(locale, "approvals", "colActions"),
        cell: ({ row }) =>
          row.original.status === "pending" ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="min-h-11"
                onClick={() => void decide(row.original, "approved")}
              >
                {t(locale, "approvals", "approve")}
              </Button>
              <Button
                type="button"
                className="min-h-11"
                onClick={() => void decide(row.original, "rejected")}
              >
                {t(locale, "approvals", "reject")}
              </Button>
              <Button
                type="button"
                className="min-h-11"
                onClick={() => void decide(row.original, "changes_requested")}
              >
                {t(locale, "approvals", "requestChanges")}
              </Button>
            </div>
          ) : (
            "—"
          ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, actorName, orgId],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "approvals", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "approvals", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="approvals"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "approvals", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "approvals", "subtitle")}
        </p>
      </header>

      <div className="space-y-1.5">
        <Label htmlFor="apr-actor">
          {t(locale, "approvals", "actorLabel")}
        </Label>
        <Input
          id="apr-actor"
          value={actorName}
          onChange={(e) => setActorName(e.target.value)}
        />
      </div>

      <SoloForm
        schema={createApprovalSchema}
        defaultValues={{
          title: "",
          requesterDisplayName: "",
          mode: "sequential",
          summary: "",
        }}
        submitLabel={t(locale, "approvals", "createRequest")}
        onSubmit={async (values: CreateApprovalValues) => {
          await getApprovalsClient().create(orgId, values);
          pushFeedback({
            tone: "success",
            title: t(locale, "approvals", "requestSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <ApprovalFields locale={locale} />
      </SoloForm>

      {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!listQuery.isLoading && (listQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "approvals", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={listQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "approvals", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
