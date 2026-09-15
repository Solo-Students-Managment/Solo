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
  canTransitionTaskStatus,
  getTasksClient,
  type OrgTask,
  type TaskStatus,
} from "@/services/tasks";
import { createTaskSchema, type CreateTaskValues } from "../schemas";

const keys = createQueryKeyFactory("tasks");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function TaskFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateTaskValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="task-title">{t(locale, "tasks", "titleLabel")}</Label>
        <Input id="task-title" {...register("title")} />
        <SoloFieldError name="title" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="task-desc">
          {t(locale, "tasks", "descriptionLabel")}
        </Label>
        <textarea
          id="task-desc"
          className="border-border bg-elevated min-h-20 w-full rounded-md border px-2 py-2 text-sm"
          {...register("description")}
        />
        <SoloFieldError name="description" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="task-assignee">
          {t(locale, "tasks", "assigneeLabel")}
        </Label>
        <Input id="task-assignee" {...register("assigneeDisplayName")} />
        <SoloFieldError name="assigneeDisplayName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="task-dept">
          {t(locale, "tasks", "departmentLabel")}
        </Label>
        <Input id="task-dept" {...register("departmentName")} />
        <SoloFieldError name="departmentName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="task-priority">
          {t(locale, "tasks", "priorityLabel")}
        </Label>
        <select
          id="task-priority"
          className={selectClassName}
          {...register("priority")}
        >
          <option value="low">{t(locale, "tasks", "priority.low")}</option>
          <option value="medium">
            {t(locale, "tasks", "priority.medium")}
          </option>
          <option value="high">{t(locale, "tasks", "priority.high")}</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="task-due">{t(locale, "tasks", "dueDateLabel")}</Label>
        <Input id="task-due" type="date" {...register("dueDate")} />
        <SoloFieldError name="dueDate" />
      </div>
    </>
  );
}

export function OrganizationTasksView() {
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
    queryFn: () => getTasksClient().list(orgId),
    enabled: canManage.allowed,
  });

  async function transition(row: OrgTask, status: TaskStatus) {
    if (!canTransitionTaskStatus(row.status, status)) {
      pushFeedback({
        tone: "error",
        title: t(locale, "tasks", "invalidTransition"),
      });
      return;
    }
    await getTasksClient().updateStatus(orgId, String(row.id), status);
    pushFeedback({
      tone: "success",
      title: t(locale, "tasks", "statusSuccess"),
    });
    await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
  }

  const columns = useMemo<ColumnDef<OrgTask, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "tasks", "colTitle") },
      {
        accessorKey: "assigneeDisplayName",
        header: t(locale, "tasks", "colAssignee"),
      },
      {
        accessorKey: "departmentName",
        header: t(locale, "tasks", "colDepartment"),
      },
      {
        id: "priority",
        header: t(locale, "tasks", "colPriority"),
        cell: ({ row }) =>
          t(locale, "tasks", `priority.${row.original.priority}`),
      },
      {
        id: "status",
        header: t(locale, "tasks", "colStatus"),
        cell: ({ row }) => t(locale, "tasks", `status.${row.original.status}`),
      },
      {
        accessorKey: "dueDate",
        header: t(locale, "tasks", "colDue"),
      },
      {
        id: "actions",
        header: t(locale, "tasks", "colActions"),
        cell: ({ row }) => {
          const task = row.original;
          return (
            <div className="flex flex-wrap gap-2">
              {canTransitionTaskStatus(task.status, "in_progress") ? (
                <Button
                  type="button"
                  className="min-h-11"
                  onClick={() => void transition(task, "in_progress")}
                >
                  {t(locale, "tasks", "start")}
                </Button>
              ) : null}
              {canTransitionTaskStatus(task.status, "done") ? (
                <Button
                  type="button"
                  className="min-h-11"
                  onClick={() => void transition(task, "done")}
                >
                  {t(locale, "tasks", "complete")}
                </Button>
              ) : null}
              {canTransitionTaskStatus(task.status, "blocked") ? (
                <Button
                  type="button"
                  className="min-h-11"
                  onClick={() => void transition(task, "blocked")}
                >
                  {t(locale, "tasks", "block")}
                </Button>
              ) : null}
              {canTransitionTaskStatus(task.status, "todo") ? (
                <Button
                  type="button"
                  className="min-h-11"
                  onClick={() => void transition(task, "todo")}
                >
                  {t(locale, "tasks", "reopen")}
                </Button>
              ) : null}
            </div>
          );
        },
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
        <ErrorState title={t(locale, "tasks", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "tasks", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="tasks"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "tasks", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "tasks", "subtitle")}</p>
      </header>

      <SoloForm
        schema={createTaskSchema}
        defaultValues={{
          title: "",
          description: "",
          assigneeDisplayName: "",
          departmentName: "",
          priority: "medium",
          dueDate: "",
        }}
        submitLabel={t(locale, "tasks", "createTask")}
        onSubmit={async (values: CreateTaskValues) => {
          await getTasksClient().create(orgId, values);
          pushFeedback({
            tone: "success",
            title: t(locale, "tasks", "createSuccess"),
          });
          await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
        }}
      >
        <TaskFields locale={locale} />
      </SoloForm>

      {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!listQuery.isLoading && (listQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "tasks", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={listQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "tasks", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
