import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const planVersionSchema = z.object({
  id: opaqueIdSchema,
  code: z.string().min(1),
  label: z.string().min(1),
  grandfathered: z.boolean(),
  activeFrom: z.string().min(1),
});
export type PlanVersion = z.infer<typeof planVersionSchema>;

export const migrationCampaignSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  fromVersionId: opaqueIdSchema,
  toVersionId: opaqueIdSchema,
  status: z.enum(["draft", "running", "completed"]),
  enrolledAt: z.string().nullable(),
  createdAt: z.string().min(1),
});
export type MigrationCampaign = z.infer<typeof migrationCampaignSchema>;

export const planVersionsSnapshotSchema = z.object({
  versions: z.array(planVersionSchema),
  campaigns: z.array(migrationCampaignSchema),
  currentVersionId: opaqueIdSchema,
});
export type PlanVersionsSnapshot = z.infer<typeof planVersionsSnapshotSchema>;

export type PlanVersionsClient = {
  get(organizationId: string): Promise<PlanVersionsSnapshot>;
  startMigration(
    organizationId: string,
    input: { fromVersionId: string; toVersionId: string },
  ): Promise<PlanVersionsSnapshot>;
  enroll(
    organizationId: string,
    campaignId: string,
  ): Promise<PlanVersionsSnapshot>;
};

const memory = new Map<string, PlanVersionsSnapshot>();

function seed(organizationId: string): PlanVersionsSnapshot {
  const existing = memory.get(organizationId);
  if (existing) return existing;
  const v1 = `pv_${organizationId}_v1`;
  const v2 = `pv_${organizationId}_v2`;
  const snap = planVersionsSnapshotSchema.parse({
    versions: [
      {
        id: v1,
        code: "org_pro_v1",
        label: "Organization Pro v1",
        grandfathered: true,
        activeFrom: new Date(Date.now() - 365 * 86_400_000).toISOString(),
      },
      {
        id: v2,
        code: "org_pro_v2",
        label: "Organization Pro v2",
        grandfathered: false,
        activeFrom: new Date().toISOString(),
      },
    ],
    campaigns: [],
    currentVersionId: v1,
  });
  memory.set(organizationId, snap);
  return snap;
}

export function createHttpPlanVersionsClient(): PlanVersionsClient {
  return {
    async get(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/plan-versions`,
        { parse: (data) => planVersionsSnapshotSchema.parse(data) },
      );
    },
    async startMigration(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/plan-versions/migrations`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => planVersionsSnapshotSchema.parse(data),
        },
      );
    },
    async enroll(organizationId, campaignId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/plan-versions/migrations/${encodeURIComponent(campaignId)}/enroll`,
        {
          method: "POST",
          parse: (data) => planVersionsSnapshotSchema.parse(data),
        },
      );
    },
  };
}

export function createMockPlanVersionsClient(): PlanVersionsClient {
  return {
    async get(organizationId) {
      return seed(organizationId);
    },
    async startMigration(organizationId, input) {
      const snap = seed(organizationId);
      const from = snap.versions.find((v) => v.id === input.fromVersionId);
      const to = snap.versions.find((v) => v.id === input.toVersionId);
      if (!from || !to) throw new Error("version_not_found");
      if (from.id === to.id) throw new Error("same_version");
      const campaign = migrationCampaignSchema.parse({
        id: `mig_${organizationId}_${Date.now()}`,
        organizationId,
        fromVersionId: from.id,
        toVersionId: to.id,
        status: "running",
        enrolledAt: null,
        createdAt: new Date().toISOString(),
      });
      const next = planVersionsSnapshotSchema.parse({
        ...snap,
        campaigns: [campaign, ...snap.campaigns],
      });
      memory.set(organizationId, next);
      return next;
    },
    async enroll(organizationId, campaignId) {
      const snap = seed(organizationId);
      const idx = snap.campaigns.findIndex((c) => c.id === campaignId);
      if (idx < 0) throw new Error("campaign_not_found");
      const campaign = snap.campaigns[idx]!;
      const updated = migrationCampaignSchema.parse({
        ...campaign,
        status: "completed",
        enrolledAt: new Date().toISOString(),
      });
      const campaigns = [...snap.campaigns];
      campaigns[idx] = updated;
      const next = planVersionsSnapshotSchema.parse({
        ...snap,
        campaigns,
        currentVersionId: updated.toVersionId,
      });
      memory.set(organizationId, next);
      return next;
    },
  };
}

let client: PlanVersionsClient = createMockPlanVersionsClient();
export function getPlanVersionsClient() {
  return client;
}
export function setPlanVersionsClient(next: PlanVersionsClient) {
  client = next;
}
