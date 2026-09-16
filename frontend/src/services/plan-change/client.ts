import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";
import { orgPlanCodeSchema } from "@/services/subscription";

export const planChangeDirectionSchema = z.enum(["upgrade", "downgrade"]);
export type PlanChangeDirection = z.infer<typeof planChangeDirectionSchema>;

export const overLimitItemSchema = z.object({
  resource: z.string().min(1),
  current: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
  excess: z.number().int().nonnegative(),
});
export type OverLimitItem = z.infer<typeof overLimitItemSchema>;

export const planChangePreviewSchema = z.object({
  organizationId: opaqueIdSchema,
  currentPlanCode: orgPlanCodeSchema,
  targetPlanCode: orgPlanCodeSchema,
  direction: planChangeDirectionSchema,
  overLimitItems: z.array(overLimitItemSchema),
  dataLossRisk: z.literal(false),
});
export type PlanChangePreview = z.infer<typeof planChangePreviewSchema>;

const planRank: Record<string, number> = {
  org_starter: 1,
  org_pro: 2,
  org_enterprise: 3,
};

export function planChangeDirection(
  current: string,
  target: string,
): PlanChangeDirection {
  return (planRank[target] ?? 0) >= (planRank[current] ?? 0)
    ? "upgrade"
    : "downgrade";
}

export function hasOverLimit(preview: PlanChangePreview): boolean {
  return preview.overLimitItems.some((item) => item.excess > 0);
}

export type PlanChangeClient = {
  preview(
    organizationId: string,
    targetPlanCode: z.infer<typeof orgPlanCodeSchema>,
  ): Promise<PlanChangePreview>;
  apply(
    organizationId: string,
    targetPlanCode: z.infer<typeof orgPlanCodeSchema>,
  ): Promise<PlanChangePreview>;
};

const limits: Record<
  z.infer<typeof orgPlanCodeSchema>,
  Record<string, number>
> = {
  org_starter: { students: 100, staff: 10 },
  org_pro: { students: 500, staff: 50 },
  org_enterprise: { students: 5000, staff: 200 },
};

const usage: Record<string, Record<string, number>> = {};

function currentUsage(orgId: string) {
  if (!usage[orgId]) {
    usage[orgId] = { students: 120, staff: 12 };
  }
  return usage[orgId];
}

function buildPreview(
  orgId: string,
  currentPlan: z.infer<typeof orgPlanCodeSchema>,
  targetPlan: z.infer<typeof orgPlanCodeSchema>,
): PlanChangePreview {
  const targetLimits = limits[targetPlan];
  const orgUsage = currentUsage(orgId);
  const overLimitItems = Object.entries(orgUsage).map(([resource, current]) => {
    const limit = targetLimits[resource] ?? 0;
    return overLimitItemSchema.parse({
      resource,
      current,
      limit,
      excess: Math.max(0, current - limit),
    });
  });

  return planChangePreviewSchema.parse({
    organizationId: orgId,
    currentPlanCode: currentPlan,
    targetPlanCode: targetPlan,
    direction: planChangeDirection(currentPlan, targetPlan),
    overLimitItems,
    dataLossRisk: false,
  });
}

const currentPlans = new Map<string, z.infer<typeof orgPlanCodeSchema>>();

export function createHttpPlanChangeClient(): PlanChangeClient {
  return {
    async preview(organizationId, targetPlanCode) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/plan-change/preview`,
        {
          method: "POST",
          body: JSON.stringify({ targetPlanCode }),
          parse: (data) => planChangePreviewSchema.parse(data),
        },
      );
    },
    async apply(organizationId, targetPlanCode) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/plan-change`,
        {
          method: "POST",
          body: JSON.stringify({ targetPlanCode }),
          parse: (data) => planChangePreviewSchema.parse(data),
        },
      );
    },
  };
}

export function createMockPlanChangeClient(): PlanChangeClient {
  return {
    async preview(organizationId, targetPlanCode) {
      const current = currentPlans.get(organizationId) ?? "org_starter";
      return buildPreview(organizationId, current, targetPlanCode);
    },
    async apply(organizationId, targetPlanCode) {
      const preview = buildPreview(
        organizationId,
        currentPlans.get(organizationId) ?? "org_starter",
        targetPlanCode,
      );
      currentPlans.set(organizationId, targetPlanCode);
      return preview;
    },
  };
}

let client: PlanChangeClient = createMockPlanChangeClient();
export function getPlanChangeClient() {
  return client;
}
export function setPlanChangeClient(next: PlanChangeClient) {
  client = next;
}
export function __resetMockPlanChange() {
  currentPlans.clear();
  client = createMockPlanChangeClient();
}
