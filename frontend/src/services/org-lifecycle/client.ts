import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const lifecycleStateSchema = z.enum([
  "active",
  "archived",
  "pending_delete",
]);
export const impactPreviewSchema = z.object({
  members: z.number().int().nonnegative(),
  students: z.number().int().nonnegative(),
  files: z.number().int().nonnegative(),
  billingOpen: z.boolean(),
});
export type ImpactPreview = z.infer<typeof impactPreviewSchema>;

export const lifecycleSnapshotSchema = z.object({
  organizationId: opaqueIdSchema,
  state: lifecycleStateSchema,
  ownerUserId: opaqueIdSchema,
  impact: impactPreviewSchema,
  updatedAt: z.string().min(1),
});
export type LifecycleSnapshot = z.infer<typeof lifecycleSnapshotSchema>;

export type OrgLifecycleClient = {
  get(organizationId: string): Promise<LifecycleSnapshot>;
  archive(organizationId: string): Promise<LifecycleSnapshot>;
  requestDelete(organizationId: string): Promise<LifecycleSnapshot>;
  transferOwnership(
    organizationId: string,
    newOwnerUserId: string,
  ): Promise<LifecycleSnapshot>;
};

const memory = new Map<string, LifecycleSnapshot>();

function seed(organizationId: string): LifecycleSnapshot {
  const existing = memory.get(organizationId);
  if (existing) return existing;
  const snap = lifecycleSnapshotSchema.parse({
    organizationId,
    state: "active",
    ownerUserId: "usr_owner",
    impact: { members: 12, students: 40, files: 220, billingOpen: false },
    updatedAt: new Date().toISOString(),
  });
  memory.set(organizationId, snap);
  return snap;
}

export function createHttpOrgLifecycleClient(): OrgLifecycleClient {
  return {
    async get(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/lifecycle`,
        { parse: (d) => lifecycleSnapshotSchema.parse(d) },
      );
    },
    async archive(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/lifecycle/archive`,
        { method: "POST", parse: (d) => lifecycleSnapshotSchema.parse(d) },
      );
    },
    async requestDelete(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/lifecycle/delete`,
        { method: "POST", parse: (d) => lifecycleSnapshotSchema.parse(d) },
      );
    },
    async transferOwnership(organizationId, newOwnerUserId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/lifecycle/transfer`,
        {
          method: "POST",
          body: JSON.stringify({ newOwnerUserId }),
          parse: (d) => lifecycleSnapshotSchema.parse(d),
        },
      );
    },
  };
}

export function createMockOrgLifecycleClient(): OrgLifecycleClient {
  return {
    async get(organizationId) {
      return seed(organizationId);
    },
    async archive(organizationId) {
      const snap = seed(organizationId);
      const next = lifecycleSnapshotSchema.parse({
        ...snap,
        state: "archived",
        updatedAt: new Date().toISOString(),
      });
      memory.set(organizationId, next);
      return next;
    },
    async requestDelete(organizationId) {
      const snap = seed(organizationId);
      if (snap.impact.billingOpen) throw new Error("billing_open");
      const next = lifecycleSnapshotSchema.parse({
        ...snap,
        state: "pending_delete",
        updatedAt: new Date().toISOString(),
      });
      memory.set(organizationId, next);
      return next;
    },
    async transferOwnership(organizationId, newOwnerUserId) {
      const snap = seed(organizationId);
      const next = lifecycleSnapshotSchema.parse({
        ...snap,
        ownerUserId: newOwnerUserId,
        updatedAt: new Date().toISOString(),
      });
      memory.set(organizationId, next);
      return next;
    },
  };
}

let client: OrgLifecycleClient = createMockOrgLifecycleClient();
export function getOrgLifecycleClient() {
  return client;
}
export function setOrgLifecycleClient(next: OrgLifecycleClient) {
  client = next;
}
