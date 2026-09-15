import { describe, expect, it, beforeEach } from "vitest";

import { opaqueIdSchema } from "@/services/api";

import {
  __resetMockMembers,
  createMockOrganizationMembersClient,
  seedOwnerMembership,
} from "@/services/organization/members";

describe("organization members client", () => {
  beforeEach(() => {
    __resetMockMembers();
  });

  it("lists seeded owner and invites staff without exposing raw phone", async () => {
    const orgId = opaqueIdSchema.parse("org_demo");
    seedOwnerMembership({
      organizationId: orgId,
      userId: "usr_1",
      displayName: "Owner",
      phoneE164: "+989121234567",
      mainBranchId: "br_main",
    });
    const client = createMockOrganizationMembersClient();
    const invited = await client.inviteStaff(orgId, {
      phoneE164: "+989121234568",
      role: "teacher",
      displayName: "Staff Teacher",
    });
    expect(invited.status).toBe("sent");
    expect(invited.member.phoneMasked).not.toContain("9121234568");
    const list = await client.listMembers(orgId);
    expect(list.data).toHaveLength(2);
    expect(list.data.every((row) => !("phoneE164" in row))).toBe(true);
  });

  it("prevents changing owner role", async () => {
    const orgId = opaqueIdSchema.parse("org_demo");
    const owner = seedOwnerMembership({
      organizationId: orgId,
      userId: "usr_1",
      displayName: "Owner",
      phoneE164: "+989121234567",
      mainBranchId: "br_main",
    });
    const client = createMockOrganizationMembersClient();
    await expect(
      client.updateMemberRole(orgId, owner.id, "manager"),
    ).rejects.toThrow("organization.roles.ownerImmutable");
  });
});
