import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";
export const itemStatusSchema = z.enum(["pass", "fail", "pending", "warn"]);
export const a11yAccommodationsItemSchema = z.object({
  id: opaqueIdSchema,
  title: z.string().min(1),
  status: itemStatusSchema,
  detail: z.string(),
});
export type ChecklistItem = z.infer<typeof a11yAccommodationsItemSchema>;
export function passedCount(items: ChecklistItem[]) {
  return items.filter((i) => i.status === "pass").length;
}
export type A11yAccommodationsClient = {
  list(): Promise<ChecklistItem[]>;
  markPass(id: string): Promise<ChecklistItem>;
};
export function createHttpA11yAccommodationsClient(): A11yAccommodationsClient {
  return {
    async list() {
      return apiRequest("/accessibility/preferences", {
        parse: (d) => z.array(a11yAccommodationsItemSchema).parse(d),
      });
    },
    async markPass(id) {
      return apiRequest(
        `/accessibility/preferences/${encodeURIComponent(id)}/pass`,
        { method: "POST", parse: (d) => a11yAccommodationsItemSchema.parse(d) },
      );
    },
  };
}
export function createMockA11yAccommodationsClient(): A11yAccommodationsClient {
  const rows = new Map<string, ChecklistItem>();
  for (const row of [
    a11yAccommodationsItemSchema.parse({
      id: "a11y_1",
      title: "Reduce motion",
      status: "pending",
      detail: "Prefers-reduced-motion",
    }),
    a11yAccommodationsItemSchema.parse({
      id: "a11y_2",
      title: "High contrast",
      status: "pass",
      detail: "Enabled",
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
      const next = a11yAccommodationsItemSchema.parse({
        ...row,
        status: "pass",
      });
      rows.set(id, next);
      return next;
    },
  };
}
let active: A11yAccommodationsClient = createMockA11yAccommodationsClient();
export function setA11yAccommodationsClient(c: A11yAccommodationsClient) {
  active = c;
}
export function getA11yAccommodationsClient() {
  return active;
}
