import { describe, expect, it } from "vitest";
import { createGoalSchema, createSavedViewSchema } from "./schemas";

describe("analytics schemas", () => {
  it("requires view and goal names", () => {
    expect(
      createSavedViewSchema.safeParse({
        name: "",
        metricKey: "attendance",
        alertThreshold: 80,
      }).success,
    ).toBe(false);
    expect(
      createGoalSchema.safeParse({ name: "", targetValue: 10 }).success,
    ).toBe(false);
  });
});
