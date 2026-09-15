import { describe, expect, it } from "vitest";
import { createOffboardingSchema } from "./schemas";
describe("offboarding schemas", () => {
  it("requires staff", () => {
    expect(
      createOffboardingSchema.safeParse({
        staffDisplayName: "",
        lastWorkingDay: "2026-12-01",
      }).success,
    ).toBe(false);
  });
});
