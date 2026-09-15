import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const shiftSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  branchName: z.string().min(1),
});
export type StaffShift = z.infer<typeof shiftSchema>;
export const shiftsCollectionSchema = collectionSchema(shiftSchema);

export type CreateShiftInput = {
  name: string;
  weekday: number;
  startTime: string;
  endTime: string;
  branchName: string;
};

export type ShiftsClient = {
  list(organizationId: string): Promise<{
    data: StaffShift[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(organizationId: string, input: CreateShiftInput): Promise<StaffShift>;
};

const memory = new Map<string, StaffShift[]>();

function meta(data: StaffShift[]) {
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

export function isValidShiftWindow(startTime: string, endTime: string) {
  return startTime < endTime;
}

export function createHttpShiftsClient(): ShiftsClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/shifts`,
        {
          parse: (data) => shiftsCollectionSchema.parse(data),
        },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/shifts`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => shiftSchema.parse(data),
        },
      );
    },
  };
}

export function createMockShiftsClient(): ShiftsClient {
  return {
    async list(organizationId) {
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const row = shiftSchema.parse({
        id: opaqueIdSchema.parse(
          `shf_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        weekday: input.weekday,
        startTime: input.startTime,
        endTime: input.endTime,
        branchName: input.branchName.trim(),
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
  };
}

let client: ShiftsClient = createMockShiftsClient();
export function getShiftsClient() {
  return client;
}
export function setShiftsClient(next: ShiftsClient) {
  client = next;
}
export function __resetMockShifts() {
  memory.clear();
  client = createMockShiftsClient();
}
