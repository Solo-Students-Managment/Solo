import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";
export const itemStatusSchema = z.enum(["pass", "fail", "pending", "warn"]);
export const releaseReadinessItemSchema = z.object({
  id: opaqueIdSchema,
  title: z.string().min(1),
  status: itemStatusSchema,
  detail: z.string(),
});
export type ChecklistItem = z.infer<typeof releaseReadinessItemSchema>;
export function passedCount(items: ChecklistItem[]) {
  return items.filter((i) => i.status === "pass").length;
}
export type ReleaseReadinessClient = {
  list(): Promise<ChecklistItem[]>;
  markPass(id: string): Promise<ChecklistItem>;
};
export function createHttpReleaseReadinessClient(): ReleaseReadinessClient {
  return {
    async list() {
      return apiRequest("/release/readiness", {
        parse: (d) => z.array(releaseReadinessItemSchema).parse(d),
      });
    },
    async markPass(id) {
      return apiRequest(`/release/readiness/${encodeURIComponent(id)}/pass`, {
        method: "POST",
        parse: (d) => releaseReadinessItemSchema.parse(d),
      });
    },
  };
}
export function createMockReleaseReadinessClient(): ReleaseReadinessClient {
  const rows = new Map<string, ChecklistItem>();
  for (const row of [
    releaseReadinessItemSchema.parse({
      id: "rel_1",
      title: "RTL visual pass",
      status: "pending",
      detail: "fa locale screenshots",
    }),
    releaseReadinessItemSchema.parse({
      id: "rel_2",
      title: "A11y axe clean",
      status: "pass",
      detail: "No critical issues",
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
      const next = releaseReadinessItemSchema.parse({ ...row, status: "pass" });
      rows.set(id, next);
      return next;
    },
  };
}
let active: ReleaseReadinessClient = createMockReleaseReadinessClient();
export function setReleaseReadinessClient(c: ReleaseReadinessClient) {
  active = c;
}
export function getReleaseReadinessClient() {
  return active;
}
