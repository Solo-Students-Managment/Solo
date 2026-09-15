import { describe, expect, it } from "vitest";

import { createPolicySchema } from "./schemas";

describe("policies schemas", () => {
  it("requires title", () => {
    expect(
      createPolicySchema.safeParse({
        title: "",
        category: "attendance",
        inheritsFromParent: false,
        sensitive: false,
        effectiveFrom: "2026-01-01",
        summary: "x",
      }).success,
    ).toBe(false);
  });
});
