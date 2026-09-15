import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const policyStatusSchema = z.enum(["draft", "published", "archived"]);
export type PolicyStatus = z.infer<typeof policyStatusSchema>;

export const orgPolicySchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  title: z.string().min(1),
  category: z.string().min(1),
  status: policyStatusSchema,
  version: z.number().int().positive(),
  inheritsFromParent: z.boolean(),
  sensitive: z.boolean(),
  effectiveFrom: z.string().min(1),
  summary: z.string(),
});
export type OrgPolicy = z.infer<typeof orgPolicySchema>;
export const orgPoliciesCollectionSchema = collectionSchema(orgPolicySchema);

export type CreatePolicyInput = {
  title: string;
  category: string;
  inheritsFromParent: boolean;
  sensitive: boolean;
  effectiveFrom: string;
  summary: string;
};

export type PoliciesClient = {
  list(organizationId: string): Promise<{
    data: OrgPolicy[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(organizationId: string, input: CreatePolicyInput): Promise<OrgPolicy>;
  publish(organizationId: string, policyId: string): Promise<OrgPolicy>;
};

const memory = new Map<string, OrgPolicy[]>();

function meta(data: OrgPolicy[]) {
  return {
    data,
    meta: {
      page: 1,
      pageSize: Math.max(data.length, 1),
      totalItems: data.length,
      totalPages: 1,
    },
  };
}

export function canPublishPolicy(policy: Pick<OrgPolicy, "status">) {
  return policy.status === "draft";
}

export function createHttpPoliciesClient(): PoliciesClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/policies`,
        {
          parse: (data) => orgPoliciesCollectionSchema.parse(data),
        },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/policies`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => orgPolicySchema.parse(data),
        },
      );
    },
    async publish(organizationId, policyId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/policies/${encodeURIComponent(policyId)}/publish`,
        {
          method: "POST",
          body: JSON.stringify({}),
          parse: (data) => orgPolicySchema.parse(data),
        },
      );
    },
  };
}

export function createMockPoliciesClient(): PoliciesClient {
  return {
    async list(organizationId) {
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const row = orgPolicySchema.parse({
        id: opaqueIdSchema.parse(
          `pol_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        title: input.title.trim(),
        category: input.category.trim(),
        status: "draft",
        version: 1,
        inheritsFromParent: input.inheritsFromParent,
        sensitive: input.sensitive,
        effectiveFrom: input.effectiveFrom,
        summary: input.summary.trim(),
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
    async publish(organizationId, policyId) {
      const rows = memory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === String(policyId));
      if (idx < 0) throw new Error("not found");
      const current = rows[idx]!;
      if (!canPublishPolicy(current)) throw new Error("not draft");
      const updated = orgPolicySchema.parse({
        ...current,
        status: "published",
        version: current.version + 1,
      });
      const next = [...rows];
      next[idx] = updated;
      memory.set(organizationId, next);
      return updated;
    },
  };
}

let client: PoliciesClient = createMockPoliciesClient();
export function getPoliciesClient() {
  return client;
}
export function setPoliciesClient(next: PoliciesClient) {
  client = next;
}
export function __resetMockPolicies() {
  memory.clear();
  client = createMockPoliciesClient();
}
