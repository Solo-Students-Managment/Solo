import { describe, expect, it } from "vitest";
import { createMockWalletClient, ledgerBalance } from "./client";

describe("wallet", () => {
  it("applies credit at checkout", async () => {
    const client = createMockWalletClient();
    const ledger = await client.listLedger();
    expect(ledgerBalance(ledger)).toBe(500000);
    const result = await client.applyCreditAtCheckout(100000);
    expect(result.applied.amount).toBe(100000);
    const balance = await client.getBalance();
    expect(balance.available.amount).toBe(400000);
  });
});
