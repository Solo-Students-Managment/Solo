import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const taskStatusSchema = z.enum([
  "todo",
  "in_progress",
  "blocked",
  "done",
]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskPrioritySchema = z.enum(["low", "medium", "high"]);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

export const orgTaskSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  title: z.string().min(1),
  description: z.string(),
  assigneeDisplayName: z.string().min(1),
  departmentName: z.string().min(1),
  priority: taskPrioritySchema,
  status: taskStatusSchema,
  dueDate: z.string().min(1),
});
export type OrgTask = z.infer<typeof orgTaskSchema>;
export const tasksCollectionSchema = collectionSchema(orgTaskSchema);

export type CreateTaskInput = {
  title: string;
  description: string;
  assigneeDisplayName: string;
  departmentName: string;
  priority: TaskPriority;
  dueDate: string;
};

export type TasksClient = {
  list(organizationId: string): Promise<{
    data: OrgTask[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(organizationId: string, input: CreateTaskInput): Promise<OrgTask>;
  updateStatus(
    organizationId: string,
    taskId: string,
    status: TaskStatus,
  ): Promise<OrgTask>;
};

const memory = new Map<string, OrgTask[]>();
function meta(data: OrgTask[]) {
  return {
    data,
    meta: {
      page: 1,
      pageSize: Math.max(data.length, 1),
      totalItems: data.length,
      totalPages: 1,
    },
  };
}

const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ["in_progress", "blocked"],
  in_progress: ["done", "blocked", "todo"],
  blocked: ["in_progress", "todo"],
  done: ["todo"],
};

/** Status transitions for the shared task work primitive. */
export function canTransitionTaskStatus(from: TaskStatus, to: TaskStatus) {
  if (from === to) return false;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function createHttpTasksClient(): TasksClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/tasks`,
        {
          parse: (data) => tasksCollectionSchema.parse(data),
        },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/tasks`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => orgTaskSchema.parse(data),
        },
      );
    },
    async updateStatus(organizationId, taskId, status) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/tasks/${encodeURIComponent(taskId)}/status`,
        {
          method: "POST",
          body: JSON.stringify({ status }),
          parse: (data) => orgTaskSchema.parse(data),
        },
      );
    },
  };
}

export function createMockTasksClient(): TasksClient {
  return {
    async list(organizationId) {
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const row = orgTaskSchema.parse({
        id: opaqueIdSchema.parse(
          `tsk_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        title: input.title.trim(),
        description: input.description.trim(),
        assigneeDisplayName: input.assigneeDisplayName.trim(),
        departmentName: input.departmentName.trim(),
        priority: input.priority,
        status: "todo",
        dueDate: input.dueDate,
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
    async updateStatus(organizationId, taskId, status) {
      const rows = memory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === String(taskId));
      if (idx < 0) throw new Error("not found");
      const current = rows[idx]!;
      if (!canTransitionTaskStatus(current.status, status)) {
        throw new Error("invalid transition");
      }
      const updated = orgTaskSchema.parse({ ...current, status });
      const next = [...rows];
      next[idx] = updated;
      memory.set(organizationId, next);
      return updated;
    },
  };
}

let client: TasksClient = createMockTasksClient();
export function getTasksClient() {
  return client;
}
export function setTasksClient(next: TasksClient) {
  client = next;
}
export function __resetMockTasks() {
  memory.clear();
  client = createMockTasksClient();
}
