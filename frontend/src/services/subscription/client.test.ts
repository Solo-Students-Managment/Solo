import { describe, expect, it } from "vitest";
import {
  createMockSubscriptionClient,
  isRestrictedState,
  requiresUpgrade,
  subscriptionStateLabel,
} from "./client";

describe("subscription helpers", () => {
  it("labels subscription states", () => {
    expect(subscriptionStateLabel("trial")).toBe("trial");
    expect(subscriptionStateLabel("active")).toBe("active");
  });

  it("detects restricted and upgrade-required states", () => {
    expect(isRestrictedState("grace")).toBe(true);
    expect(isRestrictedState("active")).toBe(false);
    expect(requiresUpgrade("limited")).toBe(true);
    expect(requiresUpgrade("trial")).toBe(false);
  });

  it("returns trial subscription for new org", async () => {
    const sub = await createMockSubscriptionClient().get("org_new");
    expect(sub.state).toBe("trial");
    expect(sub.trialDaysLeft).toBe(14);
  });
});
