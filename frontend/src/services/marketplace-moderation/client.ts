import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const moderationItemTypeSchema = z.enum(["product", "review"]);
export type ModerationItemType = z.infer<typeof moderationItemTypeSchema>;

export const moderationStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
]);
export type ModerationStatus = z.infer<typeof moderationStatusSchema>;

export const moderationQueueItemSchema = z.object({
  id: opaqueIdSchema,
  type: moderationItemTypeSchema,
  title: z.string().min(1),
  sellerName: z.string().min(1),
  status: moderationStatusSchema,
  submittedAt: z.string(),
  appealReason: z.string().nullable(),
});
export type ModerationQueueItem = z.infer<typeof moderationQueueItemSchema>;

export function isPending(item: ModerationQueueItem): boolean {
  return item.status === "pending";
}

export type MarketplaceModerationClient = {
  listQueue(): Promise<ModerationQueueItem[]>;
  approve(id: string): Promise<ModerationQueueItem>;
  reject(id: string, reason: string): Promise<ModerationQueueItem>;
  submitAppeal(id: string, reason: string): Promise<ModerationQueueItem>;
};

export function createHttpMarketplaceModerationClient(): MarketplaceModerationClient {
  return {
    async listQueue() {
      return apiRequest("/admin/marketplace-moderation/queue", {
        parse: (d) => z.array(moderationQueueItemSchema).parse(d),
      });
    },
    async approve(id) {
      return apiRequest(
        `/admin/marketplace-moderation/queue/${encodeURIComponent(id)}/approve`,
        {
          method: "POST",
          parse: (d) => moderationQueueItemSchema.parse(d),
        },
      );
    },
    async reject(id, reason) {
      return apiRequest(
        `/admin/marketplace-moderation/queue/${encodeURIComponent(id)}/reject`,
        {
          method: "POST",
          body: JSON.stringify({ reason }),
          parse: (d) => moderationQueueItemSchema.parse(d),
        },
      );
    },
    async submitAppeal(id, reason) {
      return apiRequest(
        `/admin/marketplace-moderation/queue/${encodeURIComponent(id)}/appeal`,
        {
          method: "POST",
          body: JSON.stringify({ reason }),
          parse: (d) => moderationQueueItemSchema.parse(d),
        },
      );
    },
  };
}

export function createMockMarketplaceModerationClient(): MarketplaceModerationClient {
  const rows = new Map<string, ModerationQueueItem>();
  const seed = moderationQueueItemSchema.parse({
    id: "mod_1",
    type: "product",
    title: "Advanced Chemistry Kit",
    sellerName: "Reza Physics",
    status: "pending",
    submittedAt: "2026-09-15T10:00:00.000Z",
    appealReason: null,
  });
  rows.set(String(seed.id), seed);
  const seed2 = moderationQueueItemSchema.parse({
    id: "mod_2",
    type: "review",
    title: "Review on Algebra Workbook",
    sellerName: "Sara Books",
    status: "rejected",
    submittedAt: "2026-09-14T10:00:00.000Z",
    appealReason: null,
  });
  rows.set(String(seed2.id), seed2);

  return {
    async listQueue() {
      return Array.from(rows.values());
    },
    async approve(id) {
      const row = rows.get(id);
      if (!row) throw new Error("not_found");
      const next = moderationQueueItemSchema.parse({
        ...row,
        status: "approved",
      });
      rows.set(id, next);
      return next;
    },
    async reject(id, reason) {
      const row = rows.get(id);
      if (!row) throw new Error("not_found");
      const next = moderationQueueItemSchema.parse({
        ...row,
        status: "rejected",
        appealReason: reason,
      });
      rows.set(id, next);
      return next;
    },
    async submitAppeal(id, reason) {
      const row = rows.get(id);
      if (!row) throw new Error("not_found");
      const next = moderationQueueItemSchema.parse({
        ...row,
        status: "pending",
        appealReason: reason,
      });
      rows.set(id, next);
      return next;
    },
  };
}

let active: MarketplaceModerationClient =
  createMockMarketplaceModerationClient();
export function setMarketplaceModerationClient(c: MarketplaceModerationClient) {
  active = c;
}
export function getMarketplaceModerationClient() {
  return active;
}
