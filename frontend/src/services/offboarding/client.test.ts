import { describe, expect, it } from "vitest";
import { nextOffboardingStep } from "./client";
describe("offboarding helpers", () => {
  it("advances access review then finishes", () => {
    expect(nextOffboardingStep("access_review")).toBe("asset_return");
    expect(nextOffboardingStep("deactivate")).toBe("done");
  });
});
