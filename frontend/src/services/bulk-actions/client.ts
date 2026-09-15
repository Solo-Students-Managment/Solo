import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const bulkJobStatusSchema = z.enum([
  "pending",
  "running",
  "completed",
  "blocked",
]);
export type BulkJobStatus = z.infer<typeof bulkJobStatusSchema>;

export const bulkJobSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  moduleKey: z.string().min(1),
  actionKey: z.string().min(1),
  itemCount: z.number().int().positive(),
  status: bulkJobStatusSchema,
  requiresApproval: z.boolean(),
});
export type BulkJob = z.infer<typeof bulkJobSchema>;
export const bulkJobsCollectionSchema = collectionSchema(bulkJobSchema);

export type CreateBulkJobInput = {
  moduleKey: string;
  actionKey: string;
  itemCount: number;
};

export type RunBulkJobInput = {
  approvalGranted?: boolean;
};

export type BulkActionsClient = {
  list(organizationId: string): Promise<{
    data: BulkJob[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(organizationId: string, input: CreateBulkJobInput): Promise<BulkJob>;
  run(
    organizationId: string,
    jobId: string,
    input?: RunBulkJobInput,
  ): Promise<BulkJob>;
};

const memory = new Map<string, BulkJob[]>();

function meta(data: BulkJob[]) {
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

export function requiresBulkApproval(itemCount: number, actionKey: string) {
  return itemCount >= 10 || actionKey === "delete" || actionKey === "archive";
}

export function createHttpBulkActionsClient(): BulkActionsClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/bulk-actions`,
        { parse: (data) => bulkJobsCollectionSchema.parse(data) },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/bulk-actions`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => bulkJobSchema.parse(data),
        },
      );
    },
    async run(organizationId, jobId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/bulk-actions/${encodeURIComponent(jobId)}/run`,
        {
          method: "POST",
          body: JSON.stringify(input ?? {}),
          parse: (data) => bulkJobSchema.parse(data),
        },
      );
    },
  };
}

export function createMockBulkActionsClient(): BulkActionsClient {
  return {
    async list(organizationId) {
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const requiresApproval = requiresBulkApproval(
        input.itemCount,
        input.actionKey,
      );
      const row = bulkJobSchema.parse({
        id: opaqueIdSchema.parse(
          `bulk_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        moduleKey: input.moduleKey.trim(),
        actionKey: input.actionKey.trim(),
        itemCount: input.itemCount,
        status: requiresApproval ? "blocked" : "pending",
        requiresApproval,
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
    async run(organizationId, jobId, input) {
      const rows = memory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === String(jobId));
      if (idx < 0) throw new Error("not found");
      const current = rows[idx]!;
      if (current.status === "completed") throw new Error("done");
      if (current.requiresApproval && !input?.approvalGranted) {
        throw new Error("approval required");
      }
      const updated = bulkJobSchema.parse({
        ...current,
        status: "completed",
      });
      const next = [...rows];
      next[idx] = updated;
      memory.set(organizationId, next);
      return updated;
    },
  };
}

let client: BulkActionsClient = createMockBulkActionsClient();
export function getBulkActionsClient() {
  return client;
}
export function setBulkActionsClient(next: BulkActionsClient) {
  client = next;
}
export function __resetMockBulkActions() {
  memory.clear();
  client = createMockBulkActionsClient();
}
