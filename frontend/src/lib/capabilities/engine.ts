import type { OrgRole } from "@/services/organization/members";
import type { Persona, Session } from "@/services/auth";

export type CapabilityDenyReason =
  | "permission"
  | "upgrade_required"
  | "usage_limit"
  | "policy_restriction"
  | "account_restriction"
  | "subscription_state"
  | "reauth_required";

export type EffectiveCapability = {
  allowed: boolean;
  reason?: CapabilityDenyReason;
};

export type Capability =
  | "nav.personal"
  | "nav.teacher"
  | "nav.student"
  | "nav.guardian"
  | "nav.organization"
  | "nav.admin"
  | "account.security.manage"
  | "account.phone.change"
  | "students.manage"
  | "billing.manage"
  | "exams.publish"
  | "org.members.view"
  | "org.members.invite"
  | "org.members.manage"
  | "org.roles.assign";

const personaCapabilities: Record<Persona, Capability[]> = {
  student: [
    "nav.personal",
    "nav.student",
    "account.security.manage",
    "account.phone.change",
  ],
  guardian: [
    "nav.personal",
    "nav.guardian",
    "account.security.manage",
    "account.phone.change",
  ],
  teacher: [
    "nav.personal",
    "nav.teacher",
    "account.security.manage",
    "account.phone.change",
    "students.manage",
  ],
  organization: [
    "nav.personal",
    "nav.organization",
    "account.security.manage",
    "account.phone.change",
    "students.manage",
    "billing.manage",
    "org.members.view",
    "org.members.invite",
    "org.members.manage",
    "org.roles.assign",
  ],
  admin_solo: [
    "nav.personal",
    "nav.teacher",
    "nav.student",
    "nav.guardian",
    "nav.organization",
    "nav.admin",
    "account.security.manage",
    "account.phone.change",
    "students.manage",
    "billing.manage",
    "exams.publish",
    "org.members.view",
    "org.members.invite",
    "org.members.manage",
    "org.roles.assign",
  ],
};

const orgRoleCapabilities: Record<OrgRole, Capability[]> = {
  owner: [
    "org.members.view",
    "org.members.invite",
    "org.members.manage",
    "org.roles.assign",
    "students.manage",
    "billing.manage",
  ],
  manager: [
    "org.members.view",
    "org.members.invite",
    "org.members.manage",
    "students.manage",
  ],
  academic_manager: ["org.members.view", "students.manage"],
  teacher: ["org.members.view"],
  finance: ["org.members.view", "billing.manage"],
  support_staff: ["org.members.view"],
};

function isOrgScopedCapability(capability: Capability): boolean {
  return capability.startsWith("org.");
}

export function resolveCapability(
  session: Session | null,
  capability: Capability,
): EffectiveCapability {
  if (!session) {
    return { allowed: false, reason: "permission" };
  }
  if (session.requiresReauth) {
    return { allowed: false, reason: "reauth_required" };
  }

  const personaAllows =
    personaCapabilities[session.activePersona].includes(capability);

  if (!isOrgScopedCapability(capability)) {
    return personaAllows
      ? { allowed: true }
      : { allowed: false, reason: "permission" };
  }

  if (!personaAllows) {
    return { allowed: false, reason: "permission" };
  }

  if (!session.organizationId) {
    return { allowed: false, reason: "permission" };
  }

  if (session.activePersona === "admin_solo") {
    return { allowed: true };
  }

  if (!session.orgRole) {
    return { allowed: false, reason: "permission" };
  }

  const roleAllows = orgRoleCapabilities[session.orgRole].includes(capability);
  return roleAllows
    ? { allowed: true }
    : { allowed: false, reason: "permission" };
}
