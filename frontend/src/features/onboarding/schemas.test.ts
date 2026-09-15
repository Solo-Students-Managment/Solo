import { describe, expect, it } from "vitest";
import { createOnboardingSchema } from "./schemas";
describe("onboarding schemas", () => {
  it("requires staff", () => {
    expect(
      createOnboardingSchema.safeParse({
        staffDisplayName: "",
        roleTemplate: "teacher",
      }).success,
    ).toBe(false);
  });
});
