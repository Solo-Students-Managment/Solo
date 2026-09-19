import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";
export const itemStatusSchema = z.enum(["pass", "fail", "pending", "warn"]);
export const presenceCalendarItemSchema = z.object({
  id: opaqueIdSchema,
  title: z.string().min(1),
  status: itemStatusSchema,
  detail: z.string(),
});
export type ChecklistItem = z.infer<typeof presenceCalendarItemSchema>;
export function passedCount(items: ChecklistItem[]) {
  return items.filter((i) => i.status === "pass").length;
}
export type PresenceCalendarClient = {
  list(): Promise<ChecklistItem[]>;
  markPass(id: string): Promise<ChecklistItem>;
};
export function createHttpPresenceCalendarClient(): PresenceCalendarClient {
  return {
    async list() {
      return apiRequest("/presence/calendar", {
        parse: (d) => z.array(presenceCalendarItemSchema).parse(d),
      });
    },
    async markPass(id) {
      return apiRequest(`/presence/calendar/${encodeURIComponent(id)}/pass`, {
        method: "POST",
        parse: (d) => presenceCalendarItemSchema.parse(d),
      });
    },
  };
}
export function createMockPresenceCalendarClient(): PresenceCalendarClient {
  const rows = new Map<string, ChecklistItem>();
  for (const row of [
    presenceCalendarItemSchema.parse({
      id: "pre_1",
      title: "DND during teaching block",
      status: "pending",
      detail: "13:00-14:00 local",
    }),
    presenceCalendarItemSchema.parse({
      id: "pre_2",
      title: "Available mornings",
      status: "pass",
      detail: "Configured",
    }),
  ])
    rows.set(String(row.id), row);
  return {
    async list() {
      return Array.from(rows.values());
    },
    async markPass(id) {
      const row = rows.get(id);
      if (!row) throw new Error("not_found");
      const next = presenceCalendarItemSchema.parse({ ...row, status: "pass" });
      rows.set(id, next);
      return next;
    },
  };
}
let active: PresenceCalendarClient = createMockPresenceCalendarClient();
export function setPresenceCalendarClient(c: PresenceCalendarClient) {
  active = c;
}
export function getPresenceCalendarClient() {
  return active;
}
