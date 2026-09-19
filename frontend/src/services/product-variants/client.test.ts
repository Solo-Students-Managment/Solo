import { describe, expect, it } from "vitest";
import { createMockProductVariantsClient, isInStock } from "./client";

describe("product variants", () => {
  it("tracks inventory and digital licenses", async () => {
    const client = createMockProductVariantsClient();
    const [v] = await client.list("prod_draft_1");
    expect(isInStock(v!)).toBe(true);
    const low = await client.adjustInventory(v!.id, -10);
    expect(low.inventory).toBe(0);
    expect(isInStock(low)).toBe(false);
    const digital = await client.create({
      productId: "prod_draft_1",
      sku: "ALG-DIG",
      label: "PDF",
      inventory: 0,
      price: { amount: 100000, currency: "IRR" },
      delivery: "digital",
    });
    expect(isInStock(digital)).toBe(true);
    const licensed = await client.issueLicense(digital.id);
    expect(licensed.licenseKey).toMatch(/^LIC-/);
  });
});
