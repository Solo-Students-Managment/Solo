import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";
export const itemStatusSchema = z.enum(["pass", "fail", "pending", "warn"]);
export const pwaHardeningItemSchema = z.object({
  id: opaqueIdSchema,
  title: z.string().min(1),
  status: itemStatusSchema,
  detail: z.string(),
});
export type ChecklistItem = z.infer<typeof pwaHardeningItemSchema>;
export function passedCount(items: ChecklistItem[]) {
  return items.filter((i) => i.status === "pass").length;
}
export type PwaHardeningClient = {
  list(): Promise<ChecklistItem[]>;
  markPass(id: string): Promise<ChecklistItem>;
};
export function createHttpPwaHardeningClient(): PwaHardeningClient {
  return {
    async list() {
      return apiRequest("/pwa/status", {
        parse: (d) => z.array(pwaHardeningItemSchema).parse(d),
      });
    },
    async markPass(id) {
      return apiRequest(`/pwa/status/${encodeURIComponent(id)}/pass`, {
        method: "POST",
        parse: (d) => pwaHardeningItemSchema.parse(d),
      });
    },
  };
}
export function createMockPwaHardeningClient(): PwaHardeningClient {
  const rows = new Map<string, ChecklistItem>();
  for (const row of [
    pwaHardeningItemSchema.parse({
      id: "pwa_1",
      title: "Service worker ready",
      status: "pending",
      detail: "Waiting for install",
    }),
    pwaHardeningItemSchema.parse({
      id: "pwa_2",
      title: "LCP budget",
      status: "pass",
      detail: "Under 2.5s mock",
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
      const next = pwaHardeningItemSchema.parse({ ...row, status: "pass" });
      rows.set(id, next);
      return next;
    },
  };
}
let active: PwaHardeningClient = createMockPwaHardeningClient();
export function setPwaHardeningClient(c: PwaHardeningClient) {
  active = c;
}
export function getPwaHardeningClient() {
  return active;
}
