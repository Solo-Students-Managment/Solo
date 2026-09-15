import { z } from "zod";

import { apiRequest, opaqueIdSchema } from "@/services/api";

export const organizationTypeSchema = z.enum(["school", "institute"]);
export type OrganizationType = z.infer<typeof organizationTypeSchema>;

export const organizationSchema = z.object({
  id: opaqueIdSchema,
  name: z.string().min(1),
  type: organizationTypeSchema,
  mainBranchId: opaqueIdSchema,
  mainBranchName: z.string(),
  ownerRole: z.literal("owner"),
  trialDaysLeft: z.number().int().nonnegative(),
  branchesCount: z.number().int().positive(),
  membersCount: z.number().int().positive(),
  publicProfilePublished: z.boolean(),
});
export type Organization = z.infer<typeof organizationSchema>;

export type OrganizationClient = {
  create(input: {
    name: string;
    type: OrganizationType;
  }): Promise<Organization>;
  get(orgId: string): Promise<Organization>;
};

const orgs = new Map<string, Organization>();

export function createHttpOrganizationClient(): OrganizationClient {
  return {
    async create(input) {
      return apiRequest("/organizations", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => organizationSchema.parse(data),
      });
    },
    async get(orgId) {
      return apiRequest(`/organizations/${encodeURIComponent(orgId)}`, {
        parse: (data) => organizationSchema.parse(data),
      });
    },
  };
}

export function createMockOrganizationClient(): OrganizationClient {
  return {
    async create({ name, type }) {
      const id = opaqueIdSchema.parse(
        `org_${Math.random().toString(36).slice(2, 10)}`,
      );
      const org = organizationSchema.parse({
        id,
        name,
        type,
        mainBranchId: opaqueIdSchema.parse(`br_main_${id}`),
        mainBranchName: "Main Branch",
        ownerRole: "owner",
        trialDaysLeft: 14,
        branchesCount: 1,
        membersCount: 1,
        publicProfilePublished: false,
      });
      orgs.set(id, org);
      const { __addMockOrgContext } = await import("@/services/home");
      __addMockOrgContext(id, name);
      return org;
    },
    async get(orgId) {
      const org = orgs.get(orgId);
      if (!org) throw new Error("org.notFound");
      return org;
    },
  };
}

let organizationClient: OrganizationClient = createMockOrganizationClient();

export function getOrganizationClient(): OrganizationClient {
  return organizationClient;
}

export function setOrganizationClient(client: OrganizationClient): void {
  organizationClient = client;
}

export function __resetMockOrganizations(): void {
  orgs.clear();
  organizationClient = createMockOrganizationClient();
}
