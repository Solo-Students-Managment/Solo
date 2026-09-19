import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";
export const itemStatusSchema = z.enum(["pass", "fail", "pending", "warn"]);
export const securityHardeningItemSchema = z.object({
  id: opaqueIdSchema,
  title: z.string().min(1),
  status: itemStatusSchema,
  detail: z.string(),
});
export type ChecklistItem = z.infer<typeof securityHardeningItemSchema>;
export function passedCount(items: ChecklistItem[]) {
  return items.filter((i) => i.status === "pass").length;
}
export type SecurityHardeningClient = {
  list(): Promise<ChecklistItem[]>;
  markPass(id: string): Promise<ChecklistItem>;
};
export function createHttpSecurityHardeningClient(): SecurityHardeningClient {
  return {
    async list() {
      return apiRequest("/security/review", {
        parse: (d) => z.array(securityHardeningItemSchema).parse(d),
      });
    },
    async markPass(id) {
      return apiRequest(`/security/review/${encodeURIComponent(id)}/pass`, {
        method: "POST",
        parse: (d) => securityHardeningItemSchema.parse(d),
      });
    },
  };
}
export function createMockSecurityHardeningClient(): SecurityHardeningClient {
  const rows = new Map<string, ChecklistItem>();
  for (const row of [
    securityHardeningItemSchema.parse({
      id: "sec_1",
      title: "No tokens in localStorage",
      status: "pass",
      detail: "Verified",
    }),
    securityHardeningItemSchema.parse({
      id: "sec_2",
      title: "CSP report-only",
      status: "pending",
      detail: "Enable enforce",
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
      const next = securityHardeningItemSchema.parse({
        ...row,
        status: "pass",
      });
      rows.set(id, next);
      return next;
    },
  };
}
let active: SecurityHardeningClient = createMockSecurityHardeningClient();
export function setSecurityHardeningClient(c: SecurityHardeningClient) {
  active = c;
}
export function getSecurityHardeningClient() {
  return active;
}
