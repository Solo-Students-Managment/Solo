import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const clockEventTypeSchema = z.enum(["clock_in", "clock_out"]);
export type ClockEventType = z.infer<typeof clockEventTypeSchema>;

export const staffClockEventSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  staffDisplayName: z.string().min(1),
  eventType: clockEventTypeSchema,
  recordedAt: z.string().min(1),
  branchName: z.string().min(1),
});
export type StaffClockEvent = z.infer<typeof staffClockEventSchema>;
export const staffClockCollectionSchema = collectionSchema(
  staffClockEventSchema,
);

export type CreateClockEventInput = {
  staffDisplayName: string;
  eventType: ClockEventType;
  branchName: string;
};

export type StaffAttendanceClient = {
  list(organizationId: string): Promise<{
    data: StaffClockEvent[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(
    organizationId: string,
    input: CreateClockEventInput,
  ): Promise<StaffClockEvent>;
};

const memory = new Map<string, StaffClockEvent[]>();

function meta(data: StaffClockEvent[]) {
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

export function nextExpectedClockEvent(
  events: Pick<StaffClockEvent, "eventType">[],
): ClockEventType {
  const last = events.at(-1)?.eventType;
  return last === "clock_in" ? "clock_out" : "clock_in";
}

export function createHttpStaffAttendanceClient(): StaffAttendanceClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/staff-attendance`,
        {
          parse: (data) => staffClockCollectionSchema.parse(data),
        },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/staff-attendance`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => staffClockEventSchema.parse(data),
        },
      );
    },
  };
}

export function createMockStaffAttendanceClient(): StaffAttendanceClient {
  return {
    async list(organizationId) {
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const row = staffClockEventSchema.parse({
        id: opaqueIdSchema.parse(
          `clk_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        staffDisplayName: input.staffDisplayName.trim(),
        eventType: input.eventType,
        recordedAt: new Date().toISOString(),
        branchName: input.branchName.trim(),
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
  };
}

let client: StaffAttendanceClient = createMockStaffAttendanceClient();
export function getStaffAttendanceClient() {
  return client;
}
export function setStaffAttendanceClient(next: StaffAttendanceClient) {
  client = next;
}
export function __resetMockStaffAttendance() {
  memory.clear();
  client = createMockStaffAttendanceClient();
}
