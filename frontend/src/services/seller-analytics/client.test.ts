import { describe, expect, it } from "vitest";
import {
  createMockSellerAnalyticsClient,
  hasActiveRestrictions,
} from "./client";

describe("seller analytics", () => {
  it("returns metrics and active restrictions", async () => {
    const client = createMockSellerAnalyticsClient();
    const data = await client.get();
    expect(data.metrics.orders).toBe(42);
    const active = hasActiveRestrictions(data.restrictions);
    expect(active.length).toBe(1);
    expect(active[0]!.flag).toBe("listing_limit");
  });
});
