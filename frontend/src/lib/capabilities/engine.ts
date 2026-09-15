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
  | "nav.organization"
  | "nav.admin"
  | "account.security.manage"
  | "account.phone.change"
  | "students.manage"
  | "billing.manage"
  | "exams.publish";

const personaCapabilities: Record<Persona, Capability[]> = {
  student: ["nav.personal", "account.security.manage", "account.phone.change"],
  guardian: ["nav.personal", "account.security.manage", "account.phone.change"],
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
  ],
  admin_solo: [
    "nav.personal",
    "nav.teacher",
    "nav.organization",
    "nav.admin",
    "account.security.manage",
    "account.phone.change",
    "students.manage",
    "billing.manage",
    "exams.publish",
  ],
};

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
  const allowed =
    personaCapabilities[session.activePersona].includes(capability);
  return allowed ? { allowed: true } : { allowed: false, reason: "permission" };
}
