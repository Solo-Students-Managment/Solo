import { describe, expect, it } from "vitest";
import { createMockBillingClient, formatInvoiceMoney } from "./client";

describe("billing client", () => {
  it("lists invoices and summary", async () => {
    const client = createMockBillingClient();
    const invoices = await client.listInvoices("org_bill");
    const summary = await client.getSummary("org_bill");
    expect(invoices.data.length).toBeGreaterThan(0);
    expect(summary.nextBillAmount?.currency).toBe("IRR");
    expect(summary.paymentMethod?.last4).toBe("4242");
  });

  it("formats invoice money", () => {
    expect(formatInvoiceMoney(2900000, "IRR")).toContain("IRR");
  });
});
