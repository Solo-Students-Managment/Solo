import { describe, expect, it } from "vitest";
import {
  cartTotal,
  createMockMarketplaceCartClient,
  groupBySeller,
} from "./client";

describe("marketplace cart", () => {
  it("totals items and groups by seller", async () => {
    const client = createMockMarketplaceCartClient();
    const cart = await client.list();
    expect(cart.items.length).toBe(2);
    const total = cartTotal(cart.items);
    expect(total.amount).toBe(610000);
    expect(groupBySeller(cart.items).size).toBe(2);
    const checked = await client.checkout();
    expect(checked.orderIds.length).toBe(1);
    expect((await client.list()).items.length).toBe(0);
  });
});
