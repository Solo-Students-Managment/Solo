import { describe, expect, it } from "vitest";

import { createBranchSchema } from "./schemas";

describe("branch schemas", () => {
  it("requires name, code, and effective date", () => {
    expect(
      createBranchSchema.safeParse({
        name: "North",
        code: "N1",
        effectiveFrom: "2026-09-01",
      }).success,
    ).toBe(true);
    expect(
      createBranchSchema.safeParse({
        name: "",
        code: "N1",
        effectiveFrom: "2026-09-01",
      }).success,
    ).toBe(false);
  });
});
