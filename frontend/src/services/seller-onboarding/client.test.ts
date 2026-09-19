import { describe, expect, it } from "vitest";
import {
  canSell,
  createMockSellerOnboardingClient,
  needsOnboarding,
} from "./client";

describe("seller onboarding", () => {
  it("starts as not_started and moves to pending_review", async () => {
    const client = createMockSellerOnboardingClient();
    const mine = await client.getMine();
    expect(needsOnboarding(mine)).toBe(true);
    expect(canSell(mine)).toBe(false);
    const next = await client.startOnboarding({
      displayName: "Book Shop",
      shopSlug: "book-shop",
      bio: "Educational books",
    });
    expect(next.status).toBe("pending_review");
    expect(needsOnboarding(next)).toBe(false);
  });
});
