import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const searchHitSchema = z.object({
  id: opaqueIdSchema,
  entityType: z.enum([
    "student",
    "course",
    "session",
    "assignment",
    "message",
    "subject",
  ]),
  title: z.string().min(1),
  href: z.string().min(1),
  allowed: z.boolean(),
});
export type SearchHit = z.infer<typeof searchHitSchema>;
export const searchHitsCollectionSchema = collectionSchema(searchHitSchema);

export type SearchClient = {
  search(query: string): Promise<z.infer<typeof searchHitsCollectionSchema>>;
};

export function createHttpSearchClient(): SearchClient {
  return {
    async search(query) {
      return apiRequest(`/search?q=${encodeURIComponent(query)}`, {
        parse: (data) => searchHitsCollectionSchema.parse(data),
      });
    },
  };
}

export function createMockSearchClient(): SearchClient {
  const catalog: SearchHit[] = [
    {
      id: opaqueIdSchema.parse("sr_stu1"),
      entityType: "student",
      title: "Sara Student",
      href: "/org/demo/students",
      allowed: true,
    },
    {
      id: opaqueIdSchema.parse("sr_crs1"),
      entityType: "course",
      title: "Algebra course",
      href: "/org/demo/courses",
      allowed: true,
    },
    {
      id: opaqueIdSchema.parse("sr_asg1"),
      entityType: "assignment",
      title: "Homework 1",
      href: "/org/demo/assignments",
      allowed: true,
    },
    {
      id: opaqueIdSchema.parse("sr_msg1"),
      entityType: "message",
      title: "Private message",
      href: "/personal/messages",
      allowed: false,
    },
  ];
  return {
    async search(query) {
      const q = query.trim().toLowerCase();
      const data = catalog.filter(
        (hit) => !q || hit.title.toLowerCase().includes(q),
      );
      return {
        data,
        meta: {
          page: 1,
          pageSize: Math.max(data.length, 1),
          totalItems: data.length,
          totalPages: 1,
        },
      };
    },
  };
}

let client: SearchClient = createMockSearchClient();
export function getSearchClient() {
  return client;
}
export function setSearchClient(next: SearchClient) {
  client = next;
}
