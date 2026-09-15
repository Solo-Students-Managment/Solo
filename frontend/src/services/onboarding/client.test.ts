import { describe, expect, it } from "vitest";
import { nextOnboardingStep } from "./client";
describe("onboarding helpers", () => {
  it("advances invite to documents then to done", () => {
    expect(nextOnboardingStep("invite")).toBe("documents");
    expect(nextOnboardingStep("activate")).toBe("done");
  });
});
