import { describe, expect, it } from "vitest";

import { canDeleteRole, permissionsForTemplate } from "./client";

describe("roles helpers", () => {
  it("owner template includes wildcard", () => {
    expect(permissionsForTemplate("owner")).toContain("*");
  });

  it("blocks deleting system roles", () => {
    expect(canDeleteRole({ isSystem: true })).toBe(false);
    expect(canDeleteRole({ isSystem: false })).toBe(true);
  });
});
