import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const dataJobTypeSchema = z.enum([
  "import",
  "export",
  "backup",
  "restore",
]);
export type DataJobType = z.infer<typeof dataJobTypeSchema>;

export const dataJobStatusSchema = z.enum([
  "queued",
  "running",
  "completed",
  "failed",
]);
export type DataJobStatus = z.infer<typeof dataJobStatusSchema>;

export const dataJobSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  jobType: dataJobTypeSchema,
  resourceKey: z.string().min(1),
  status: dataJobStatusSchema,
});
export type DataJob = z.infer<typeof dataJobSchema>;
export const dataJobsCollectionSchema = collectionSchema(dataJobSchema);

export type CreateDataJobInput = {
  jobType: DataJobType;
  resourceKey: string;
};

export type DataOpsClient = {
  list(organizationId: string): Promise<{
    data: DataJob[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(organizationId: string, input: CreateDataJobInput): Promise<DataJob>;
  advance(organizationId: string, jobId: string): Promise<DataJob>;
};

const memory = new Map<string, DataJob[]>();

function meta(data: DataJob[]) {
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

export function nextDataJobStatus(status: DataJobStatus): DataJobStatus | null {
  if (status === "queued") return "running";
  if (status === "running") return "completed";
  return null;
}

export function isTerminalDataJobStatus(status: DataJobStatus) {
  return status === "completed" || status === "failed";
}

export function createHttpDataOpsClient(): DataOpsClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/data-ops`,
        { parse: (data) => dataJobsCollectionSchema.parse(data) },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/data-ops`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => dataJobSchema.parse(data),
        },
      );
    },
    async advance(organizationId, jobId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/data-ops/${encodeURIComponent(jobId)}/advance`,
        {
          method: "POST",
          parse: (data) => dataJobSchema.parse(data),
        },
      );
    },
  };
}

export function createMockDataOpsClient(): DataOpsClient {
  return {
    async list(organizationId) {
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const row = dataJobSchema.parse({
        id: opaqueIdSchema.parse(
          `djob_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        jobType: input.jobType,
        resourceKey: input.resourceKey.trim(),
        status: "queued",
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
    async advance(organizationId, jobId) {
      const rows = memory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === String(jobId));
      if (idx < 0) throw new Error("not found");
      const current = rows[idx]!;
      const next = nextDataJobStatus(current.status);
      if (!next) throw new Error("terminal");
      const updated = dataJobSchema.parse({ ...current, status: next });
      const copy = [...rows];
      copy[idx] = updated;
      memory.set(organizationId, copy);
      return updated;
    },
  };
}

let client: DataOpsClient = createMockDataOpsClient();
export function getDataOpsClient() {
  return client;
}
export function setDataOpsClient(next: DataOpsClient) {
  client = next;
}
export function __resetMockDataOps() {
  memory.clear();
  client = createMockDataOpsClient();
}
