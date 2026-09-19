import { describe, expect, it } from "vitest";
import { createMockSellerBalanceClient, netAfterCommission } from "./client";

describe("seller balance", () => {
  it("requests payout and opens dispute", async () => {
    const client = createMockSellerBalanceClient();
    const balance = await client.getBalance();
    expect(netAfterCommission(100000, balance.commissionRate)).toBe(90000);
    const payout = await client.requestPayout(500000);
    expect(payout.status).toBe("pending");
    const dispute = await client.openDispute("ord_1", "damaged item");
    expect(dispute.status).toBe("open");
  });
});
