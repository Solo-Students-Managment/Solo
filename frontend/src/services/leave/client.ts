import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const leaveTypeSchema = z.enum(["annual", "sick", "unpaid", "other"]);
export type LeaveType = z.infer<typeof leaveTypeSchema>;
export const leaveStatusSchema = z.enum(["pending", "approved", "rejected"]);
export type LeaveStatus = z.infer<typeof leaveStatusSchema>;

export const leaveRequestSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  staffDisplayName: z.string().min(1),
  leaveType: leaveTypeSchema,
  status: leaveStatusSchema,
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string(),
});
export type LeaveRequest = z.infer<typeof leaveRequestSchema>;
export const leaveCollectionSchema = collectionSchema(leaveRequestSchema);

export type CreateLeaveInput = {
  staffDisplayName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
};

export type LeaveClient = {
  list(organizationId: string): Promise<{
    data: LeaveRequest[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(
    organizationId: string,
    input: CreateLeaveInput,
  ): Promise<LeaveRequest>;
  approve(organizationId: string, leaveId: string): Promise<LeaveRequest>;
};

const memory = new Map<string, LeaveRequest[]>();

function meta(data: LeaveRequest[]) {
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

export function isValidLeaveRange(startDate: string, endDate: string) {
  return startDate <= endDate;
}

export function canApproveLeave(status: LeaveStatus) {
  return status === "pending";
}

export function createHttpLeaveClient(): LeaveClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/leave-requests`,
        {
          parse: (data) => leaveCollectionSchema.parse(data),
        },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/leave-requests`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => leaveRequestSchema.parse(data),
        },
      );
    },
    async approve(organizationId, leaveId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/leave-requests/${encodeURIComponent(leaveId)}/approve`,
        {
          method: "POST",
          body: JSON.stringify({}),
          parse: (data) => leaveRequestSchema.parse(data),
        },
      );
    },
  };
}

export function createMockLeaveClient(): LeaveClient {
  return {
    async list(organizationId) {
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const row = leaveRequestSchema.parse({
        id: opaqueIdSchema.parse(
          `lv_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        staffDisplayName: input.staffDisplayName.trim(),
        leaveType: input.leaveType,
        status: "pending",
        startDate: input.startDate,
        endDate: input.endDate,
        reason: input.reason.trim(),
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
    async approve(organizationId, leaveId) {
      const rows = memory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === String(leaveId));
      if (idx < 0) throw new Error("not found");
      const updated = leaveRequestSchema.parse({
        ...rows[idx],
        status: "approved",
      });
      const next = [...rows];
      next[idx] = updated;
      memory.set(organizationId, next);
      return updated;
    },
  };
}

let client: LeaveClient = createMockLeaveClient();
export function getLeaveClient() {
  return client;
}
export function setLeaveClient(next: LeaveClient) {
  client = next;
}
export function __resetMockLeave() {
  memory.clear();
  client = createMockLeaveClient();
}
