import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";
export const itemStatusSchema = z.enum(["pass", "fail", "pending", "warn"]);
export const collabEditingItemSchema = z.object({
  id: opaqueIdSchema,
  title: z.string().min(1),
  status: itemStatusSchema,
  detail: z.string(),
});
export type ChecklistItem = z.infer<typeof collabEditingItemSchema>;
export function passedCount(items: ChecklistItem[]) {
  return items.filter((i) => i.status === "pass").length;
}
export type CollabEditingClient = {
  list(): Promise<ChecklistItem[]>;
  markPass(id: string): Promise<ChecklistItem>;
};
export function createHttpCollabEditingClient(): CollabEditingClient {
  return {
    async list() {
      return apiRequest("/collab/sessions", {
        parse: (d) => z.array(collabEditingItemSchema).parse(d),
      });
    },
    async markPass(id) {
      return apiRequest(`/collab/sessions/${encodeURIComponent(id)}/pass`, {
        method: "POST",
        parse: (d) => collabEditingItemSchema.parse(d),
      });
    },
  };
}
export function createMockCollabEditingClient(): CollabEditingClient {
  const rows = new Map<string, ChecklistItem>();
  for (const row of [
    collabEditingItemSchema.parse({
      id: "col_1",
      title: "Lesson plan doc lock",
      status: "pending",
      detail: "Section A locked by Neda",
    }),
    collabEditingItemSchema.parse({
      id: "col_2",
      title: "Curriculum outline",
      status: "pass",
      detail: "No active locks",
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
      const next = collabEditingItemSchema.parse({ ...row, status: "pass" });
      rows.set(id, next);
      return next;
    },
  };
}
let active: CollabEditingClient = createMockCollabEditingClient();
export function setCollabEditingClient(c: CollabEditingClient) {
  active = c;
}
export function getCollabEditingClient() {
  return active;
}
