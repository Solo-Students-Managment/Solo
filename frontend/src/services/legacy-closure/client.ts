import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";
export const itemStatusSchema = z.enum(["pass", "fail", "pending", "warn"]);
export const legacyClosureItemSchema = z.object({
  id: opaqueIdSchema,
  title: z.string().min(1),
  status: itemStatusSchema,
  detail: z.string(),
});
export type ChecklistItem = z.infer<typeof legacyClosureItemSchema>;
export function passedCount(items: ChecklistItem[]) {
  return items.filter((i) => i.status === "pass").length;
}
export type LegacyClosureClient = {
  list(): Promise<ChecklistItem[]>;
  markPass(id: string): Promise<ChecklistItem>;
};
export function createHttpLegacyClosureClient(): LegacyClosureClient {
  return {
    async list() {
      return apiRequest("/legacy/closure", {
        parse: (d) => z.array(legacyClosureItemSchema).parse(d),
      });
    },
    async markPass(id) {
      return apiRequest(`/legacy/closure/${encodeURIComponent(id)}/pass`, {
        method: "POST",
        parse: (d) => legacyClosureItemSchema.parse(d),
      });
    },
  };
}
export function createMockLegacyClosureClient(): LegacyClosureClient {
  const rows = new Map<string, ChecklistItem>();
  for (const row of [
    legacyClosureItemSchema.parse({
      id: "leg_1",
      title: "Legacy Vite app archived",
      status: "pass",
      detail: "Reference-only",
    }),
    legacyClosureItemSchema.parse({
      id: "leg_2",
      title: "Shared util migration",
      status: "pending",
      detail: "Date helpers",
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
      const next = legacyClosureItemSchema.parse({ ...row, status: "pass" });
      rows.set(id, next);
      return next;
    },
  };
}
let active: LegacyClosureClient = createMockLegacyClosureClient();
export function setLegacyClosureClient(c: LegacyClosureClient) {
  active = c;
}
export function getLegacyClosureClient() {
  return active;
}
