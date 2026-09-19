import { describe, expect, it } from "vitest";
import {
  canAddToCompare,
  createMockMarketplacePromosClient,
  MAX_COMPARE_ITEMS,
} from "./client";

describe("marketplace promos", () => {
  it("applies coupon and limits compare list", async () => {
    const client = createMockMarketplacePromosClient();
    const applied = await client.applyCoupon("SAVE10");
    expect(applied.discount).toBe(10);
    for (let i = 0; i < MAX_COMPARE_ITEMS; i++) {
      await client.addToCompare(`prod_${i}`, `Product ${i}`, {
        amount: 1000,
        currency: "IRR",
      });
    }
    expect(canAddToCompare(await client.listCompare())).toBe(false);
    await expect(
      client.addToCompare("prod_extra", "Extra", {
        amount: 1000,
        currency: "IRR",
      }),
    ).rejects.toThrow("compare_full");
  });
});
