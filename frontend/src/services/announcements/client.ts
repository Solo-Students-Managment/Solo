import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const announcementSchema = z.object({
  id: opaqueIdSchema,
  title: z.string().min(1),
  body: z.string().min(1),
  status: z.enum(["draft", "published"]),
  publishedAt: z.string().nullable(),
});
export type Announcement = z.infer<typeof announcementSchema>;

export type AnnouncementsClient = {
  list(): Promise<Announcement[]>;
  create(input: { title: string; body: string }): Promise<Announcement>;
  publish(id: string): Promise<Announcement>;
};

const memory: Announcement[] = [];

export function createHttpAnnouncementsClient(): AnnouncementsClient {
  return {
    async list() {
      return apiRequest("/admin/announcements", {
        parse: (d) => z.array(announcementSchema).parse(d),
      });
    },
    async create(input) {
      return apiRequest("/admin/announcements", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (d) => announcementSchema.parse(d),
      });
    },
    async publish(id) {
      return apiRequest(
        `/admin/announcements/${encodeURIComponent(id)}/publish`,
        { method: "POST", parse: (d) => announcementSchema.parse(d) },
      );
    },
  };
}

export function createMockAnnouncementsClient(): AnnouncementsClient {
  return {
    async list() {
      return [...memory];
    },
    async create(input) {
      const row = announcementSchema.parse({
        id: `ann_${Date.now()}`,
        title: input.title,
        body: input.body,
        status: "draft",
        publishedAt: null,
      });
      memory.unshift(row);
      return row;
    },
    async publish(id) {
      const idx = memory.findIndex((a) => a.id === id);
      if (idx < 0) throw new Error("not_found");
      memory[idx] = announcementSchema.parse({
        ...memory[idx],
        status: "published",
        publishedAt: new Date().toISOString(),
      });
      return memory[idx]!;
    },
  };
}

let client: AnnouncementsClient = createMockAnnouncementsClient();
export function getAnnouncementsClient() {
  return client;
}
export function setAnnouncementsClient(next: AnnouncementsClient) {
  client = next;
}
