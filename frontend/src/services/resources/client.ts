import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const resourceFileSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  subjectName: z.string().min(1),
  title: z.string().min(1),
  version: z.number().int().positive(),
  securityState: z.enum([
    "queued",
    "uploading",
    "scanning",
    "safe",
    "blocked",
    "failed",
  ]),
  mimeHint: z.enum(["pdf", "word", "image", "audio"]),
});
export type ResourceFile = z.infer<typeof resourceFileSchema>;
export const resourcesCollectionSchema = collectionSchema(resourceFileSchema);

export type ResourcesClient = {
  list(
    organizationId: string,
  ): Promise<z.infer<typeof resourcesCollectionSchema>>;
  publish(
    organizationId: string,
    input: {
      subjectName: string;
      title: string;
      mimeHint: ResourceFile["mimeHint"];
    },
  ): Promise<ResourceFile>;
};

const memory = new Map<string, ResourceFile[]>();

export function createHttpResourcesClient(): ResourcesClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/resources`,
        {
          parse: (data) => resourcesCollectionSchema.parse(data),
        },
      );
    },
    async publish(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/resources`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => resourceFileSchema.parse(data),
        },
      );
    },
  };
}

export function createMockResourcesClient(): ResourcesClient {
  return {
    async list(organizationId) {
      const data = memory.get(organizationId) ?? [];
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
    async publish(organizationId, input) {
      const existing = (memory.get(organizationId) ?? []).filter(
        (row) =>
          row.subjectName === input.subjectName.trim() &&
          row.title === input.title.trim(),
      );
      const item = resourceFileSchema.parse({
        id: opaqueIdSchema.parse(
          `res_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        subjectName: input.subjectName.trim(),
        title: input.title.trim(),
        version: existing.length + 1,
        securityState: "safe",
        mimeHint: input.mimeHint,
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), item]);
      return item;
    },
  };
}

let client: ResourcesClient = createMockResourcesClient();
export function getResourcesClient() {
  return client;
}
export function setResourcesClient(next: ResourcesClient) {
  client = next;
}
