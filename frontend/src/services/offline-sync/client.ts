import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";
export const itemStatusSchema = z.enum(["pass", "fail", "pending", "warn"]);
export const offlineSyncItemSchema = z.object({
  id: opaqueIdSchema,
  title: z.string().min(1),
  status: itemStatusSchema,
  detail: z.string(),
});
export type ChecklistItem = z.infer<typeof offlineSyncItemSchema>;
export function passedCount(items: ChecklistItem[]) {
  return items.filter((i) => i.status === "pass").length;
}
export type OfflineSyncClient = {
  list(): Promise<ChecklistItem[]>;
  markPass(id: string): Promise<ChecklistItem>;
};
export function createHttpOfflineSyncClient(): OfflineSyncClient {
  return {
    async list() {
      return apiRequest("/offline/sync", {
        parse: (d) => z.array(offlineSyncItemSchema).parse(d),
      });
    },
    async markPass(id) {
      return apiRequest(`/offline/sync/${encodeURIComponent(id)}/pass`, {
        method: "POST",
        parse: (d) => offlineSyncItemSchema.parse(d),
      });
    },
  };
}
export function createMockOfflineSyncClient(): OfflineSyncClient {
  const rows = new Map<string, ChecklistItem>();
  for (const row of [
    offlineSyncItemSchema.parse({
      id: "off_1",
      title: "Queued enrollment update",
      status: "pending",
      detail: "Conflict: keep local or remote",
    }),
    offlineSyncItemSchema.parse({
      id: "off_2",
      title: "Cached lesson plan",
      status: "pass",
      detail: "Synced",
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
      const next = offlineSyncItemSchema.parse({ ...row, status: "pass" });
      rows.set(id, next);
      return next;
    },
  };
}
let active: OfflineSyncClient = createMockOfflineSyncClient();
export function setOfflineSyncClient(c: OfflineSyncClient) {
  active = c;
}
export function getOfflineSyncClient() {
  return active;
}
