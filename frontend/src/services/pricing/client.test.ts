import { describe, expect, it } from "vitest";
import {
  createMockPricingClient,
  formatCatalogMoney,
  plansForMarket,
} from "./client";

describe("pricing helpers", () => {
  it("filters plans by market price book", async () => {
    const catalog = await createMockPricingClient().getCatalog();
    const ir = plansForMarket(catalog, "IR");
    const global = plansForMarket(catalog, "GLOBAL");
    expect(ir.length).toBeGreaterThan(0);
    expect(global.every((plan) => plan.monthlyPrice.currency === "USD")).toBe(
      true,
    );
    expect(ir.every((plan) => plan.monthlyPrice.currency === "IRR")).toBe(true);
  });

  it("formats catalog money without inventing FX", () => {
    expect(formatCatalogMoney(490000, "IRR")).toContain("IRR");
    expect(formatCatalogMoney(12, "USD")).toBe("$12");
  });
});
