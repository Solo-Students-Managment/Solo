import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const orgEventSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  title: z.string().min(1),
  startsAt: z.string().min(1),
  capacity: z.number().int().positive(),
  rsvpCount: z.number().int().nonnegative(),
  checkedInCount: z.number().int().nonnegative(),
  waitlistEnabled: z.boolean(),
});
export type OrgEvent = z.infer<typeof orgEventSchema>;
export const orgEventsCollectionSchema = collectionSchema(orgEventSchema);

export type CreateOrgEventInput = {
  title: string;
  startsAt: string;
  capacity: number;
  waitlistEnabled: boolean;
};

export type EventsClient = {
  list(organizationId: string): Promise<{
    data: OrgEvent[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(organizationId: string, input: CreateOrgEventInput): Promise<OrgEvent>;
  rsvp(organizationId: string, eventId: string): Promise<OrgEvent>;
  checkIn(organizationId: string, eventId: string): Promise<OrgEvent>;
};

const memory = new Map<string, OrgEvent[]>();

function meta(data: OrgEvent[]) {
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

export function canRsvp(event: OrgEvent) {
  if (event.rsvpCount < event.capacity) return true;
  return event.waitlistEnabled;
}

export function createHttpEventsClient(): EventsClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/events`,
        { parse: (data) => orgEventsCollectionSchema.parse(data) },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/events`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => orgEventSchema.parse(data),
        },
      );
    },
    async rsvp(organizationId, eventId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/events/${encodeURIComponent(eventId)}/rsvp`,
        { method: "POST", parse: (data) => orgEventSchema.parse(data) },
      );
    },
    async checkIn(organizationId, eventId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/events/${encodeURIComponent(eventId)}/check-in`,
        { method: "POST", parse: (data) => orgEventSchema.parse(data) },
      );
    },
  };
}

export function createMockEventsClient(): EventsClient {
  return {
    async list(organizationId) {
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const row = orgEventSchema.parse({
        id: opaqueIdSchema.parse(
          `evt_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        title: input.title.trim(),
        startsAt: input.startsAt,
        capacity: input.capacity,
        rsvpCount: 0,
        checkedInCount: 0,
        waitlistEnabled: input.waitlistEnabled,
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
    async rsvp(organizationId, eventId) {
      const rows = memory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === String(eventId));
      if (idx < 0) throw new Error("not found");
      const current = rows[idx]!;
      if (!canRsvp(current)) throw new Error("full");
      const updated = orgEventSchema.parse({
        ...current,
        rsvpCount: current.rsvpCount + 1,
      });
      const next = [...rows];
      next[idx] = updated;
      memory.set(organizationId, next);
      return updated;
    },
    async checkIn(organizationId, eventId) {
      const rows = memory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === String(eventId));
      if (idx < 0) throw new Error("not found");
      const current = rows[idx]!;
      if (current.checkedInCount >= current.rsvpCount) {
        throw new Error("no rsvps");
      }
      const updated = orgEventSchema.parse({
        ...current,
        checkedInCount: current.checkedInCount + 1,
      });
      const next = [...rows];
      next[idx] = updated;
      memory.set(organizationId, next);
      return updated;
    },
  };
}

let client: EventsClient = createMockEventsClient();
export function getEventsClient() {
  return client;
}
export function setEventsClient(next: EventsClient) {
  client = next;
}
export function __resetMockEvents() {
  memory.clear();
  client = createMockEventsClient();
}
