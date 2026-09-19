import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";
export const itemStatusSchema = z.enum(["pass", "fail", "pending", "warn"]);
export const gamificationItemSchema = z.object({
  id: opaqueIdSchema,
  title: z.string().min(1),
  status: itemStatusSchema,
  detail: z.string(),
});
export type ChecklistItem = z.infer<typeof gamificationItemSchema>;
export function passedCount(items: ChecklistItem[]) {
  return items.filter((i) => i.status === "pass").length;
}
export type GamificationClient = {
  list(): Promise<ChecklistItem[]>;
  markPass(id: string): Promise<ChecklistItem>;
};
export function createHttpGamificationClient(): GamificationClient {
  return {
    async list() {
      return apiRequest("/gamification", {
        parse: (d) => z.array(gamificationItemSchema).parse(d),
      });
    },
    async markPass(id) {
      return apiRequest(`/gamification/${encodeURIComponent(id)}/pass`, {
        method: "POST",
        parse: (d) => gamificationItemSchema.parse(d),
      });
    },
  };
}
export function createMockGamificationClient(): GamificationClient {
  const rows = new Map<string, ChecklistItem>();
  for (const row of [
    gamificationItemSchema.parse({
      id: "gam_1",
      title: "Consistency badge",
      status: "pending",
      detail: "Complete 5 lessons",
    }),
    gamificationItemSchema.parse({
      id: "gam_2",
      title: "Peer helper",
      status: "pass",
      detail: "Awarded",
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
      const next = gamificationItemSchema.parse({ ...row, status: "pass" });
      rows.set(id, next);
      return next;
    },
  };
}
let active: GamificationClient = createMockGamificationClient();
export function setGamificationClient(c: GamificationClient) {
  active = c;
}
export function getGamificationClient() {
  return active;
}
