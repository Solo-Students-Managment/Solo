import { describe, expect, it } from "vitest";

import { createPositionSchema, resolvePositionsTab } from "./schemas";

describe("positions schemas", () => {
  it("defaults tab to positions", () => {
    expect(resolvePositionsTab(null)).toBe("positions");
    expect(resolvePositionsTab("chart")).toBe("chart");
  });

  it("requires title", () => {
    expect(createPositionSchema.safeParse({ title: "" }).success).toBe(false);
  });
});
