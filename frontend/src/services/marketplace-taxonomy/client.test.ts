import { describe, expect, it } from "vitest";
import { createMockMarketplaceTaxonomyClient } from "./client";

describe("marketplace taxonomy", () => {
  it("creates taxonomy entries and price history", async () => {
    const client = createMockMarketplaceTaxonomyClient();
    const cats = await client.listCategories();
    expect(cats.length).toBeGreaterThan(0);
    const brand = await client.createBrand("New Brand");
    expect(brand.slug).toBe("new-brand");
    const entry = await client.addPriceHistory("prod_1", {
      amount: 50000,
      currency: "USD",
    });
    expect(entry.price.currency).toBe("USD");
    const history = await client.listPriceHistory("prod_1");
    expect(history.length).toBe(1);
  });
});
