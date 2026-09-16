import { describe, expect, it } from "vitest";
import { computeVat, createMockTaxInvoicesClient } from "./client";

describe("tax invoices", () => {
  it("computes VAT from subtotal", () => {
    expect(computeVat(1000, 9)).toEqual({ vatAmount: 90, total: 1090 });
  });

  it("issues localized invoice with VAT", async () => {
    const client = createMockTaxInvoicesClient();
    const doc = await client.issue("org_tax", {
      type: "invoice",
      locale: "fa",
      vatRatePercent: 9,
      subtotalAmount: 1_000_000,
      currency: "IRR",
    });
    expect(doc.total.amount).toBe(1_090_000);
    expect(doc.locale).toBe("fa");
  });
});
