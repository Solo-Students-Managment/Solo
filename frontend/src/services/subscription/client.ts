import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const orgSubscriptionStateSchema = z.enum([
  "trial",
  "grace",
  "limited",
  "active",
  "canceled",
]);
export type OrgSubscriptionState = z.infer<typeof orgSubscriptionStateSchema>;

export const orgPlanCodeSchema = z.enum([
  "org_starter",
  "org_pro",
  "org_enterprise",
]);
export type OrgPlanCode = z.infer<typeof orgPlanCodeSchema>;

export const organizationSubscriptionSchema = z.object({
  organizationId: opaqueIdSchema,
  planCode: orgPlanCodeSchema,
  state: orgSubscriptionStateSchema,
  trialDaysLeft: z.number().int().nonnegative().nullable(),
  graceDaysLeft: z.number().int().nonnegative().nullable(),
  limitedReason: z.string().nullable(),
  renewsAt: z.string().nullable(),
});
export type OrganizationSubscription = z.infer<
  typeof organizationSubscriptionSchema
>;

export function subscriptionStateLabel(state: OrgSubscriptionState): string {
  return state;
}

export function isRestrictedState(state: OrgSubscriptionState): boolean {
  return state === "grace" || state === "limited" || state === "canceled";
}

export function requiresUpgrade(state: OrgSubscriptionState): boolean {
  return state === "limited";
}

export type SubscriptionClient = {
  get(organizationId: string): Promise<OrganizationSubscription>;
};

const memory = new Map<string, OrganizationSubscription>();

function seedSubscription(orgId: string): OrganizationSubscription {
  return organizationSubscriptionSchema.parse({
    organizationId: orgId,
    planCode: "org_starter",
    state: "trial",
    trialDaysLeft: 14,
    graceDaysLeft: null,
    limitedReason: null,
    renewsAt: null,
  });
}

export function createHttpSubscriptionClient(): SubscriptionClient {
  return {
    async get(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/subscription`,
        {
          parse: (data) => organizationSubscriptionSchema.parse(data),
        },
      );
    },
  };
}

export function createMockSubscriptionClient(): SubscriptionClient {
  return {
    async get(organizationId) {
      return memory.get(organizationId) ?? seedSubscription(organizationId);
    },
  };
}

let client: SubscriptionClient = createMockSubscriptionClient();
export function getSubscriptionClient() {
  return client;
}
export function setSubscriptionClient(next: SubscriptionClient) {
  client = next;
}
export function __resetMockSubscription() {
  memory.clear();
  client = createMockSubscriptionClient();
}
export function __setMockSubscription(
  organizationId: string,
  subscription: OrganizationSubscription,
) {
  memory.set(organizationId, subscription);
}
