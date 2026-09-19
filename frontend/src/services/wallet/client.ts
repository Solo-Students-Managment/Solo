import { z } from "zod";
import { apiRequest, moneySchema, opaqueIdSchema } from "@/services/api";

export const walletBalanceSchema = z.object({
  available: moneySchema,
});
export type WalletBalance = z.infer<typeof walletBalanceSchema>;

export const ledgerEntrySchema = z.object({
  id: opaqueIdSchema,
  type: z.enum(["credit", "debit"]),
  amount: moneySchema,
  description: z.string(),
  createdAt: z.string(),
});
export type LedgerEntry = z.infer<typeof ledgerEntrySchema>;

export const applyCreditResultSchema = z.object({
  applied: moneySchema,
  remaining: moneySchema,
});
export type ApplyCreditResult = z.infer<typeof applyCreditResultSchema>;

export function ledgerBalance(entries: LedgerEntry[]): number {
  return entries.reduce((sum, e) => {
    return e.type === "credit" ? sum + e.amount.amount : sum - e.amount.amount;
  }, 0);
}

export type WalletClient = {
  getBalance(): Promise<WalletBalance>;
  listLedger(): Promise<LedgerEntry[]>;
  applyCreditAtCheckout(amount: number): Promise<ApplyCreditResult>;
};

export function createHttpWalletClient(): WalletClient {
  return {
    async getBalance() {
      return apiRequest("/personal/wallet", {
        parse: (d) => walletBalanceSchema.parse(d),
      });
    },
    async listLedger() {
      return apiRequest("/personal/wallet/ledger", {
        parse: (d) => z.array(ledgerEntrySchema).parse(d),
      });
    },
    async applyCreditAtCheckout(amount) {
      return apiRequest("/personal/wallet/apply-credit", {
        method: "POST",
        body: JSON.stringify({ amount }),
        parse: (d) => applyCreditResultSchema.parse(d),
      });
    },
  };
}

export function createMockWalletClient(): WalletClient {
  let available = 500000;
  const ledger: LedgerEntry[] = [
    ledgerEntrySchema.parse({
      id: "led_1",
      type: "credit",
      amount: { amount: 500000, currency: "IRR" },
      description: "Welcome credit",
      createdAt: "2026-08-01T10:00:00.000Z",
    }),
  ];
  let seq = 2;

  return {
    async getBalance() {
      return walletBalanceSchema.parse({
        available: { amount: available, currency: "IRR" },
      });
    },
    async listLedger() {
      return [...ledger];
    },
    async applyCreditAtCheckout(amount) {
      const applied = Math.min(amount, available);
      available -= applied;
      ledger.push(
        ledgerEntrySchema.parse({
          id: `led_${seq++}`,
          type: "debit",
          amount: { amount: applied, currency: "IRR" },
          description: "Checkout credit applied",
          createdAt: new Date().toISOString(),
        }),
      );
      return applyCreditResultSchema.parse({
        applied: { amount: applied, currency: "IRR" },
        remaining: { amount: available, currency: "IRR" },
      });
    },
  };
}

let active: WalletClient = createMockWalletClient();
export function setWalletClient(c: WalletClient) {
  active = c;
}
export function getWalletClient() {
  return active;
}
