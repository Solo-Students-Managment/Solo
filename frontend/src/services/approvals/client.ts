import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const approvalStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "changes_requested",
]);
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;
export const approvalModeSchema = z.enum(["sequential", "parallel"]);
export type ApprovalMode = z.infer<typeof approvalModeSchema>;

export const approvalRequestSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  title: z.string().min(1),
  requesterDisplayName: z.string().min(1),
  mode: approvalModeSchema,
  status: approvalStatusSchema,
  summary: z.string(),
});
export type ApprovalRequest = z.infer<typeof approvalRequestSchema>;
export const approvalsCollectionSchema = collectionSchema(
  approvalRequestSchema,
);

export type CreateApprovalInput = {
  title: string;
  requesterDisplayName: string;
  mode: ApprovalMode;
  summary: string;
};

export type ApprovalsClient = {
  list(organizationId: string): Promise<{
    data: ApprovalRequest[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(
    organizationId: string,
    input: CreateApprovalInput,
  ): Promise<ApprovalRequest>;
  decide(
    organizationId: string,
    approvalId: string,
    decision: "approved" | "rejected" | "changes_requested",
    actorDisplayName: string,
  ): Promise<ApprovalRequest>;
};

const memory = new Map<string, ApprovalRequest[]>();
function meta(data: ApprovalRequest[]) {
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

/** Self-approval is blocked when actor matches requester. */
export function canActorDecide(
  request: Pick<ApprovalRequest, "requesterDisplayName" | "status">,
  actorDisplayName: string,
) {
  if (request.status !== "pending") return false;
  return (
    request.requesterDisplayName.trim().toLowerCase() !==
    actorDisplayName.trim().toLowerCase()
  );
}

export function createHttpApprovalsClient(): ApprovalsClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/approvals`,
        {
          parse: (data) => approvalsCollectionSchema.parse(data),
        },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/approvals`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => approvalRequestSchema.parse(data),
        },
      );
    },
    async decide(organizationId, approvalId, decision, actorDisplayName) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/approvals/${encodeURIComponent(approvalId)}/decide`,
        {
          method: "POST",
          body: JSON.stringify({ decision, actorDisplayName }),
          parse: (data) => approvalRequestSchema.parse(data),
        },
      );
    },
  };
}

export function createMockApprovalsClient(): ApprovalsClient {
  return {
    async list(organizationId) {
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const row = approvalRequestSchema.parse({
        id: opaqueIdSchema.parse(
          `apr_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        title: input.title.trim(),
        requesterDisplayName: input.requesterDisplayName.trim(),
        mode: input.mode,
        status: "pending",
        summary: input.summary.trim(),
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
    async decide(organizationId, approvalId, decision, actorDisplayName) {
      const rows = memory.get(organizationId) ?? [];
      const idx = rows.findIndex(
        (row) => String(row.id) === String(approvalId),
      );
      if (idx < 0) throw new Error("not found");
      const current = rows[idx]!;
      if (!canActorDecide(current, actorDisplayName))
        throw new Error("self-approval blocked");
      const updated = approvalRequestSchema.parse({
        ...current,
        status: decision,
      });
      const next = [...rows];
      next[idx] = updated;
      memory.set(organizationId, next);
      return updated;
    },
  };
}

let client: ApprovalsClient = createMockApprovalsClient();
export function getApprovalsClient() {
  return client;
}
export function setApprovalsClient(next: ApprovalsClient) {
  client = next;
}
export function __resetMockApprovals() {
  memory.clear();
  client = createMockApprovalsClient();
}
