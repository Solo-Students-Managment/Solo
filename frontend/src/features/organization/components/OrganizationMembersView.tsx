"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { Button, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities/engine";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { organizationMembersQueryKeys } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import {
  ASSIGNABLE_ORG_ROLES,
  getOrganizationClient,
  getOrganizationMembersClient,
  type OrgMember,
  type OrgRole,
} from "@/services/organization";

import { InviteStaffForm } from "./InviteStaffForm";
import { OrgShell } from "./OrgShell";

export function OrganizationMembersView() {
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

  const membersQuery = useQuery({
    queryKey: organizationMembersQueryKeys.list(ctx, { status: "all" }),
    queryFn: () => getOrganizationMembersClient().listMembers(orgId),
    enabled: Boolean(sessionQuery.data),
  });

  const canView = resolveCapability(
    sessionQuery.data ?? null,
    "org.members.view",
  );
  const canInvite = resolveCapability(
    sessionQuery.data ?? null,
    "org.members.invite",
  );
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "org.members.manage",
  );
  const canAssignRoles = resolveCapability(
    sessionQuery.data ?? null,
    "org.roles.assign",
  );

  async function invalidateMembers() {
    await queryClient.invalidateQueries({
      queryKey: organizationMembersQueryKeys.all(ctx),
    });
    await queryClient.invalidateQueries({ queryKey: ["organization", orgId] });
  }

  const columns = useMemo<ColumnDef<OrgMember, unknown>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: t(locale, "organization", "colName"),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.displayName}</p>
            <p className="text-muted text-xs">{row.original.phoneMasked}</p>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: t(locale, "organization", "colRole"),
        cell: ({ row }) =>
          canAssignRoles.allowed &&
          canManage.allowed &&
          row.original.role !== "owner" ? (
            <label className="sr-only">
              {t(locale, "organization", "colRole")}
              <select
                aria-label={`${t(locale, "organization", "colRole")}: ${row.original.displayName}`}
                className="border-border bg-elevated h-9 rounded-md border px-2 text-sm"
                value={row.original.role}
                onChange={(event) => {
                  const role = event.target.value as OrgRole;
                  void (async () => {
                    try {
                      await getOrganizationMembersClient().updateMemberRole(
                        orgId,
                        row.original.id,
                        role,
                      );
                      pushFeedback({
                        tone: "success",
                        title: t(locale, "organization", "roleUpdated"),
                      });
                      await invalidateMembers();
                    } catch {
                      pushFeedback({
                        tone: "error",
                        title: t(locale, "organization", "roleUpdateError"),
                      });
                    }
                  })();
                }}
              >
                {ASSIGNABLE_ORG_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {t(locale, "organization", `role.${role}`)}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span>
              {t(locale, "organization", `role.${row.original.role}`)}
            </span>
          ),
      },
      {
        accessorKey: "status",
        header: t(locale, "organization", "colStatus"),
        cell: ({ row }) =>
          t(locale, "organization", `status.${row.original.status}`),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          canManage.allowed && row.original.role !== "owner" ? (
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={() => {
                void (async () => {
                  try {
                    await getOrganizationMembersClient().revokeMember(
                      orgId,
                      row.original.id,
                    );
                    pushFeedback({
                      tone: "success",
                      title: t(locale, "organization", "memberRevoked"),
                    });
                    await invalidateMembers();
                  } catch {
                    pushFeedback({
                      tone: "error",
                      title: t(locale, "organization", "memberRevokeError"),
                    });
                  }
                })();
              }}
            >
              {t(locale, "organization", "revoke")}
            </Button>
          ) : null,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- invalidate closes over stable orgId/locale
    [locale, orgId, canAssignRoles.allowed, canManage.allowed],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }

  if (orgQuery.isError || !orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState
          title={t(locale, "organization", "loadError")}
          action={
            <Button type="button" onClick={() => void orgQuery.refetch()}>
              {t(locale, "organization", "retry")}
            </Button>
          }
        />
      </div>
    );
  }

  if (!canView.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "organization", "membersForbidden")} />
      </div>
    );
  }

  const org = orgQuery.data;
  const members = membersQuery.data?.data ?? [];

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={org.id}
      orgName={org.name}
      active="members"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "organization", "membersTitle")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "organization", "membersSubtitle")}
        </p>
      </header>

      <InviteStaffForm
        locale={locale}
        orgId={org.id}
        canInvite={canInvite.allowed}
        onInvited={invalidateMembers}
      />

      <section className="space-y-3" aria-labelledby="members-list-title">
        <h2
          id="members-list-title"
          className="font-display text-xl font-medium"
        >
          {t(locale, "organization", "membersListTitle")}
        </h2>
        {membersQuery.isLoading ? (
          <Skeleton className="h-32" />
        ) : membersQuery.isError ? (
          <ErrorState
            title={t(locale, "organization", "membersLoadError")}
            action={
              <Button type="button" onClick={() => void membersQuery.refetch()}>
                {t(locale, "organization", "retry")}
              </Button>
            }
          />
        ) : members.length === 0 ? (
          <EmptyState
            title={t(locale, "organization", "membersEmpty")}
            description={t(locale, "organization", "membersEmptyHint")}
          />
        ) : (
          <SoloDataTable
            data={members}
            columns={columns}
            emptyLabel={t(locale, "organization", "membersEmpty")}
          />
        )}
      </section>
    </OrgShell>
  );
}
