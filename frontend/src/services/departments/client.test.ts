import { describe, expect, it } from "vitest";

import { canAssignToOrgUnit } from "./client";

describe("departments helpers", () => {
  it("only active org units accept assignment", () => {
    expect(canAssignToOrgUnit("active")).toBe(true);
    expect(canAssignToOrgUnit("archived")).toBe(false);
  });
});
