import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const calendarEventSchema = z.object({
  id: opaqueIdSchema,
  title: z.string().min(1),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  kind: z.enum(["session", "assignment", "reminder"]),
});
export type CalendarEvent = z.infer<typeof calendarEventSchema>;
export const calendarEventsCollectionSchema =
  collectionSchema(calendarEventSchema);

export type CalendarClient = {
  listUpcoming(): Promise<z.infer<typeof calendarEventsCollectionSchema>>;
};

const seed: CalendarEvent[] = [
  {
    id: opaqueIdSchema.parse("cal_demo1"),
    title: "Math session",
    startsAt: new Date(Date.now() + 86400000).toISOString(),
    endsAt: new Date(Date.now() + 90000000).toISOString(),
    kind: "session",
  },
];

export function createHttpCalendarClient(): CalendarClient {
  return {
    async listUpcoming() {
      return apiRequest("/calendar/upcoming", {
        parse: (data) => calendarEventsCollectionSchema.parse(data),
      });
    },
  };
}

export function createMockCalendarClient(): CalendarClient {
  return {
    async listUpcoming() {
      return {
        data: [...seed],
        meta: {
          page: 1,
          pageSize: Math.max(seed.length, 1),
          totalItems: seed.length,
          totalPages: 1,
        },
      };
    },
  };
}

let client: CalendarClient = createMockCalendarClient();
export function getCalendarClient() {
  return client;
}
export function setCalendarClient(next: CalendarClient) {
  client = next;
}
