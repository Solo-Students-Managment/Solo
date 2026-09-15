import { describe, expect, it } from "vitest";

import { opaqueIdSchema } from "@/services/api";

import { resolveCapability } from "./engine";

describe("effective capabilities", () => {
  it("allows teacher student management and denies admin nav", () => {
    const session = {
      userId: opaqueIdSchema.parse("usr_1"),
      displayName: "Teacher",
      activePersona: "teacher" as const,
      organizationId: null,
      subjectId: null,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      requiresReauth: false,
    };
    expect(resolveCapability(session, "students.manage").allowed).toBe(true);
    expect(resolveCapability(session, "account.security.manage").allowed).toBe(
      true,
    );
    expect(resolveCapability(session, "nav.admin")).toEqual({
      allowed: false,
      reason: "permission",
    });
  });

  it("blocks when reauth is required", () => {
    const session = {
      userId: opaqueIdSchema.parse("usr_1"),
      displayName: "Teacher",
      activePersona: "teacher" as const,
      organizationId: null,
      subjectId: null,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      requiresReauth: true,
    };
    expect(resolveCapability(session, "students.manage")).toEqual({
      allowed: false,
      reason: "reauth_required",
    });
  });
});
