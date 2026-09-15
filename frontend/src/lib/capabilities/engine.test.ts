import { describe, expect, it } from "vitest";

import { opaqueIdSchema } from "@/services/api";
import type { Session } from "@/services/auth";

import { resolveCapability } from "./engine";

function session(
  partial: Partial<Session> & Pick<Session, "activePersona">,
): Session {
  return {
    userId: opaqueIdSchema.parse("usr_1"),
    displayName: "Demo",
    organizationId: null,
    subjectId: null,
    orgRole: null,
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    requiresReauth: false,
    ...partial,
  };
}

describe("effective capabilities", () => {
  it("allows teacher student management and denies admin nav", () => {
    const s = session({ activePersona: "teacher" });
    expect(resolveCapability(s, "students.manage").allowed).toBe(true);
    expect(resolveCapability(s, "account.security.manage").allowed).toBe(true);
    expect(resolveCapability(s, "nav.admin")).toEqual({
      allowed: false,
      reason: "permission",
    });
  });

  it("blocks when reauth is required", () => {
    const s = session({ activePersona: "teacher", requiresReauth: true });
    expect(resolveCapability(s, "students.manage")).toEqual({
      allowed: false,
      reason: "reauth_required",
    });
  });

  it("gates org member invite by org role", () => {
    const owner = session({
      activePersona: "organization",
      organizationId: opaqueIdSchema.parse("org_1"),
      orgRole: "owner",
    });
    const finance = session({
      activePersona: "organization",
      organizationId: opaqueIdSchema.parse("org_1"),
      orgRole: "finance",
    });
    expect(resolveCapability(owner, "org.members.invite").allowed).toBe(true);
    expect(resolveCapability(owner, "org.roles.assign").allowed).toBe(true);
    expect(resolveCapability(finance, "org.members.view").allowed).toBe(true);
    expect(resolveCapability(finance, "org.members.invite")).toEqual({
      allowed: false,
      reason: "permission",
    });
  });

  it("denies org-scoped caps without organization context", () => {
    const s = session({
      activePersona: "organization",
      orgRole: "owner",
    });
    expect(resolveCapability(s, "org.members.view")).toEqual({
      allowed: false,
      reason: "permission",
    });
  });
});
