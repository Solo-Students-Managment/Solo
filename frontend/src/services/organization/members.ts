import { z } from "zod";

import {
  apiRequest,
  collectionSchema,
  opaqueIdSchema,
  type OpaqueId,
} from "@/services/api";
import { maskPhoneE164 } from "@/services/auth/phone";

export const orgRoleSchema = z.enum([
  "owner",
  "manager",
  "academic_manager",
  "teacher",
  "finance",
  "support_staff",
]);
export type OrgRole = z.infer<typeof orgRoleSchema>;

export const DEFAULT_ORG_ROLES: OrgRole[] = [
  "owner",
  "manager",
  "academic_manager",
  "teacher",
  "finance",
  "support_staff",
];

export const ASSIGNABLE_ORG_ROLES: OrgRole[] = [
  "manager",
  "academic_manager",
  "teacher",
  "finance",
  "support_staff",
];

export const orgMemberStatusSchema = z.enum(["active", "invited", "suspended"]);
export type OrgMemberStatus = z.infer<typeof orgMemberStatusSchema>;

export const orgMemberSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  displayName: z.string().min(1),
  phoneMasked: z.string().min(1),
  role: orgRoleSchema,
  branchIds: z.array(opaqueIdSchema),
  status: orgMemberStatusSchema,
  invitedAt: z.string().optional(),
  joinedAt: z.string().optional(),
});
export type OrgMember = z.infer<typeof orgMemberSchema>;

export const orgMembersCollectionSchema = collectionSchema(orgMemberSchema);
export type OrgMembersCollection = z.infer<typeof orgMembersCollectionSchema>;

export const inviteStaffResultSchema = z.object({
  inviteId: opaqueIdSchema,
  status: z.enum(["sent", "linked_existing_user"]),
  member: orgMemberSchema,
});
export type InviteStaffResult = z.infer<typeof inviteStaffResultSchema>;

export type InviteStaffInput = {
  phoneE164: string;
  role: OrgRole;
  displayName: string;
  branchIds?: string[];
};

export type OrganizationMembersClient = {
  listMembers(orgId: string): Promise<OrgMembersCollection>;
  inviteStaff(
    orgId: string,
    input: InviteStaffInput,
  ): Promise<InviteStaffResult>;
  updateMemberRole(
    orgId: string,
    memberId: string,
    role: OrgRole,
  ): Promise<OrgMember>;
  revokeMember(orgId: string, memberId: string): Promise<void>;
};

type MemberRecord = OrgMember & { phoneE164: string; userId: OpaqueId | null };

const membersByOrg = new Map<string, MemberRecord[]>();

function toPublic(member: MemberRecord): OrgMember {
  return orgMemberSchema.parse({
    id: member.id,
    organizationId: member.organizationId,
    displayName: member.displayName,
    phoneMasked: member.phoneMasked,
    role: member.role,
    branchIds: member.branchIds,
    status: member.status,
    invitedAt: member.invitedAt,
    joinedAt: member.joinedAt,
  });
}

function listFor(orgId: string): MemberRecord[] {
  return membersByOrg.get(orgId) ?? [];
}

export function seedOwnerMembership(input: {
  organizationId: string;
  userId: string;
  displayName: string;
  phoneE164: string;
  mainBranchId: string;
}): OrgMember {
  const orgId = opaqueIdSchema.parse(input.organizationId);
  const member = {
    id: opaqueIdSchema.parse(`mem_owner_${orgId}`),
    organizationId: orgId,
    displayName: input.displayName,
    phoneMasked: maskPhoneE164(input.phoneE164),
    phoneE164: input.phoneE164,
    userId: opaqueIdSchema.parse(input.userId),
    role: "owner" as const,
    branchIds: [opaqueIdSchema.parse(input.mainBranchId)],
    status: "active" as const,
    joinedAt: new Date().toISOString(),
  };
  membersByOrg.set(String(orgId), [member]);
  return toPublic(member);
}

export function resolveOrgRoleForUser(
  organizationId: string,
  userId: string,
): OrgRole | null {
  const member = listFor(organizationId).find(
    (row) =>
      row.userId && String(row.userId) === userId && row.status === "active",
  );
  return member?.role ?? null;
}

export function __getMockMembers(orgId: string): OrgMember[] {
  return listFor(orgId).map(toPublic);
}

export function __resetMockMembers(): void {
  membersByOrg.clear();
}

export function createHttpOrganizationMembersClient(): OrganizationMembersClient {
  return {
    async listMembers(orgId) {
      return apiRequest(`/organizations/${encodeURIComponent(orgId)}/members`, {
        parse: (data) => orgMembersCollectionSchema.parse(data),
      });
    },
    async inviteStaff(orgId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(orgId)}/members/invite`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => inviteStaffResultSchema.parse(data),
        },
      );
    },
    async updateMemberRole(orgId, memberId, role) {
      return apiRequest(
        `/organizations/${encodeURIComponent(orgId)}/members/${encodeURIComponent(memberId)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ role }),
          parse: (data) => orgMemberSchema.parse(data),
        },
      );
    },
    async revokeMember(orgId, memberId) {
      await apiRequest(
        `/organizations/${encodeURIComponent(orgId)}/members/${encodeURIComponent(memberId)}`,
        {
          method: "DELETE",
          parse: () => undefined,
        },
      );
    },
  };
}

export function createMockOrganizationMembersClient(): OrganizationMembersClient {
  return {
    async listMembers(orgId) {
      const data = listFor(orgId).map(toPublic);
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
    async inviteStaff(orgId, input) {
      if (!ASSIGNABLE_ORG_ROLES.includes(input.role)) {
        throw new Error("organization.invite.roleForbidden");
      }
      const existing = listFor(orgId);
      if (existing.some((row) => row.phoneE164 === input.phoneE164)) {
        throw new Error("organization.invite.duplicate");
      }
      const orgOpaque = opaqueIdSchema.parse(orgId);
      const id = opaqueIdSchema.parse(
        `mem_${Math.random().toString(36).slice(2, 10)}`,
      );
      const branchIds =
        input.branchIds?.map((idValue) => opaqueIdSchema.parse(idValue)) ??
        existing[0]?.branchIds ??
        [];
      const member: MemberRecord = {
        id,
        organizationId: orgOpaque,
        displayName: input.displayName.trim() || "Invited staff",
        phoneMasked: maskPhoneE164(input.phoneE164),
        phoneE164: input.phoneE164,
        userId: null,
        role: input.role,
        branchIds,
        status: "invited",
        invitedAt: new Date().toISOString(),
      };
      membersByOrg.set(orgId, [...existing, member]);
      return inviteStaffResultSchema.parse({
        inviteId: id,
        status: "sent",
        member: toPublic(member),
      });
    },
    async updateMemberRole(orgId, memberId, role) {
      const rows = listFor(orgId);
      const index = rows.findIndex((row) => String(row.id) === memberId);
      if (index < 0) throw new Error("organization.member.notFound");
      const current = rows[index]!;
      if (current.role === "owner") {
        throw new Error("organization.roles.ownerImmutable");
      }
      if (role === "owner") {
        throw new Error("organization.roles.ownerTransferRequired");
      }
      const next = { ...current, role };
      const updated = [...rows];
      updated[index] = next;
      membersByOrg.set(orgId, updated);
      return toPublic(next);
    },
    async revokeMember(orgId, memberId) {
      const rows = listFor(orgId);
      const target = rows.find((row) => String(row.id) === memberId);
      if (!target) throw new Error("organization.member.notFound");
      if (target.role === "owner") {
        throw new Error("organization.member.ownerCannotRevoke");
      }
      membersByOrg.set(
        orgId,
        rows.filter((row) => String(row.id) !== memberId),
      );
    },
  };
}

let membersClient: OrganizationMembersClient =
  createMockOrganizationMembersClient();

export function getOrganizationMembersClient(): OrganizationMembersClient {
  return membersClient;
}

export function setOrganizationMembersClient(
  client: OrganizationMembersClient,
): void {
  membersClient = client;
}
