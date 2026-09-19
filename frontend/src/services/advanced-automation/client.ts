import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";
export const itemStatusSchema = z.enum(["pass", "fail", "pending", "warn"]);
export const advancedAutomationItemSchema = z.object({
  id: opaqueIdSchema,
  title: z.string().min(1),
  status: itemStatusSchema,
  detail: z.string(),
});
export type ChecklistItem = z.infer<typeof advancedAutomationItemSchema>;
export function passedCount(items: ChecklistItem[]) {
  return items.filter((i) => i.status === "pass").length;
}
export type AdvancedAutomationClient = {
  list(): Promise<ChecklistItem[]>;
  markPass(id: string): Promise<ChecklistItem>;
};
export function createHttpAdvancedAutomationClient(): AdvancedAutomationClient {
  return {
    async list() {
      return apiRequest("/automation/advanced", {
        parse: (d) => z.array(advancedAutomationItemSchema).parse(d),
      });
    },
    async markPass(id) {
      return apiRequest(`/automation/advanced/${encodeURIComponent(id)}/pass`, {
        method: "POST",
        parse: (d) => advancedAutomationItemSchema.parse(d),
      });
    },
  };
}
export function createMockAdvancedAutomationClient(): AdvancedAutomationClient {
  const rows = new Map<string, ChecklistItem>();
  for (const row of [
    advancedAutomationItemSchema.parse({
      id: "aut_1",
      title: "High-risk payout rule",
      status: "pending",
      detail: "Requires human approval",
    }),
    advancedAutomationItemSchema.parse({
      id: "aut_2",
      title: "Welcome email flow",
      status: "pass",
      detail: "Low risk auto-run",
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
      const next = advancedAutomationItemSchema.parse({
        ...row,
        status: "pass",
      });
      rows.set(id, next);
      return next;
    },
  };
}
let active: AdvancedAutomationClient = createMockAdvancedAutomationClient();
export function setAdvancedAutomationClient(c: AdvancedAutomationClient) {
  active = c;
}
export function getAdvancedAutomationClient() {
  return active;
}
