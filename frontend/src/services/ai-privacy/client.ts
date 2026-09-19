import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";
export const itemStatusSchema = z.enum(["pass", "fail", "pending", "warn"]);
export const aiPrivacyItemSchema = z.object({
  id: opaqueIdSchema,
  title: z.string().min(1),
  status: itemStatusSchema,
  detail: z.string(),
});
export type ChecklistItem = z.infer<typeof aiPrivacyItemSchema>;
export function passedCount(items: ChecklistItem[]) {
  return items.filter((i) => i.status === "pass").length;
}
export type AiPrivacyClient = {
  list(): Promise<ChecklistItem[]>;
  markPass(id: string): Promise<ChecklistItem>;
};
export function createHttpAiPrivacyClient(): AiPrivacyClient {
  return {
    async list() {
      return apiRequest("/ai/privacy", {
        parse: (d) => z.array(aiPrivacyItemSchema).parse(d),
      });
    },
    async markPass(id) {
      return apiRequest(`/ai/privacy/${encodeURIComponent(id)}/pass`, {
        method: "POST",
        parse: (d) => aiPrivacyItemSchema.parse(d),
      });
    },
  };
}
export function createMockAiPrivacyClient(): AiPrivacyClient {
  const rows = new Map<string, ChecklistItem>();
  for (const row of [
    aiPrivacyItemSchema.parse({
      id: "aip_1",
      title: "Training data opt-out",
      status: "pending",
      detail: "Controls whether prompts may train models",
    }),
    aiPrivacyItemSchema.parse({
      id: "aip_2",
      title: "Quota visibility",
      status: "pass",
      detail: "Monthly quota displayed to users",
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
      const next = aiPrivacyItemSchema.parse({ ...row, status: "pass" });
      rows.set(id, next);
      return next;
    },
  };
}
let active: AiPrivacyClient = createMockAiPrivacyClient();
export function setAiPrivacyClient(c: AiPrivacyClient) {
  active = c;
}
export function getAiPrivacyClient() {
  return active;
}
