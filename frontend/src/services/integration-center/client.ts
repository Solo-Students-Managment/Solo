import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";
export const itemStatusSchema = z.enum(["pass", "fail", "pending", "warn"]);
export const integrationCenterItemSchema = z.object({
  id: opaqueIdSchema,
  title: z.string().min(1),
  status: itemStatusSchema,
  detail: z.string(),
});
export type ChecklistItem = z.infer<typeof integrationCenterItemSchema>;
export function passedCount(items: ChecklistItem[]) {
  return items.filter((i) => i.status === "pass").length;
}
export type IntegrationCenterClient = {
  list(): Promise<ChecklistItem[]>;
  markPass(id: string): Promise<ChecklistItem>;
};
export function createHttpIntegrationCenterClient(): IntegrationCenterClient {
  return {
    async list() {
      return apiRequest("/integrations", {
        parse: (d) => z.array(integrationCenterItemSchema).parse(d),
      });
    },
    async markPass(id) {
      return apiRequest(`/integrations/${encodeURIComponent(id)}/pass`, {
        method: "POST",
        parse: (d) => integrationCenterItemSchema.parse(d),
      });
    },
  };
}
export function createMockIntegrationCenterClient(): IntegrationCenterClient {
  const rows = new Map<string, ChecklistItem>();
  for (const row of [
    integrationCenterItemSchema.parse({
      id: "int_1",
      title: "Webhook endpoint health",
      status: "pending",
      detail: "Retry queue draining",
    }),
    integrationCenterItemSchema.parse({
      id: "int_2",
      title: "API key rotation",
      status: "pass",
      detail: "Keys masked in UI",
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
      const next = integrationCenterItemSchema.parse({
        ...row,
        status: "pass",
      });
      rows.set(id, next);
      return next;
    },
  };
}
let active: IntegrationCenterClient = createMockIntegrationCenterClient();
export function setIntegrationCenterClient(c: IntegrationCenterClient) {
  active = c;
}
export function getIntegrationCenterClient() {
  return active;
}
