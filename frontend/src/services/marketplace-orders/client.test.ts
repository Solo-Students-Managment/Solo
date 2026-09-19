import { describe, expect, it } from "vitest";
import { canFulfill, createMockMarketplaceOrdersClient } from "./client";

describe("marketplace orders", () => {
  it("fulfills paid seller orders", async () => {
    const client = createMockMarketplaceOrdersClient();
    const [order] = await client.listSeller();
    expect(canFulfill(order!)).toBe(true);
    const fulfilled = await client.fulfill(order!.id);
    expect(fulfilled.status).toBe("fulfilled");
  });
});
