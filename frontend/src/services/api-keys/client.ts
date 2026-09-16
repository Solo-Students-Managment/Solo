import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const apiKeySchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  prefix: z.string().min(1),
  createdAt: z.string().min(1),
  revokedAt: z.string().nullable(),
});
export type ApiKey = z.infer<typeof apiKeySchema>;

export const apiKeyCreatedSchema = apiKeySchema.extend({
  secret: z.string().min(1),
});
export type ApiKeyCreated = z.infer<typeof apiKeyCreatedSchema>;

export type ApiKeysClient = {
  list(organizationId: string): Promise<ApiKey[]>;
  create(
    organizationId: string,
    input: { name: string },
  ): Promise<ApiKeyCreated>;
  revoke(organizationId: string, keyId: string): Promise<ApiKey>;
};

const memory = new Map<string, ApiKey[]>();

export function createHttpApiKeysClient(): ApiKeysClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/api-keys`,
        { parse: (d) => z.array(apiKeySchema).parse(d) },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/api-keys`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (d) => apiKeyCreatedSchema.parse(d),
        },
      );
    },
    async revoke(organizationId, keyId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/api-keys/${encodeURIComponent(keyId)}/revoke`,
        { method: "POST", parse: (d) => apiKeySchema.parse(d) },
      );
    },
  };
}

export function createMockApiKeysClient(): ApiKeysClient {
  return {
    async list(organizationId) {
      return memory.get(organizationId) ?? [];
    },
    async create(organizationId, input) {
      const id = `key_${organizationId}_${Date.now()}`;
      const secret = `sk_live_${id}_ONCE`;
      const row = apiKeySchema.parse({
        id,
        organizationId,
        name: input.name,
        prefix: secret.slice(0, 12),
        createdAt: new Date().toISOString(),
        revokedAt: null,
      });
      memory.set(organizationId, [row, ...(memory.get(organizationId) ?? [])]);
      return apiKeyCreatedSchema.parse({ ...row, secret });
    },
    async revoke(organizationId, keyId) {
      const list = memory.get(organizationId) ?? [];
      const idx = list.findIndex((k) => k.id === keyId);
      if (idx < 0) throw new Error("not_found");
      list[idx] = apiKeySchema.parse({
        ...list[idx],
        revokedAt: new Date().toISOString(),
      });
      memory.set(organizationId, list);
      return list[idx]!;
    },
  };
}

let client: ApiKeysClient = createMockApiKeysClient();
export function getApiKeysClient() {
  return client;
}
export function setApiKeysClient(next: ApiKeysClient) {
  client = next;
}
