import { z } from "zod";
import { apiRequest, moneySchema, opaqueIdSchema } from "@/services/api";

export const sellerBalanceSchema = z.object({
  available: moneySchema,
  pending: moneySchema,
  commissionRate: z.number().min(0).max(1),
});
export type SellerBalance = z.infer<typeof sellerBalanceSchema>;

export const payoutRequestSchema = z.object({
  id: opaqueIdSchema,
  amount: moneySchema,
  status: z.enum(["pending", "completed", "rejected"]),
  createdAt: z.string(),
});
export type PayoutRequest = z.infer<typeof payoutRequestSchema>;

export const disputeSchema = z.object({
  id: opaqueIdSchema,
  orderId: opaqueIdSchema,
  reason: z.string().min(1),
  status: z.enum(["open", "resolved"]),
  createdAt: z.string(),
});
export type Dispute = z.infer<typeof disputeSchema>;

export function netAfterCommission(amount: number, rate: number): number {
  return Math.round(amount * (1 - rate));
}

export type SellerBalanceClient = {
  getBalance(): Promise<SellerBalance>;
  requestPayout(amount: number): Promise<PayoutRequest>;
  openDispute(orderId: string, reason: string): Promise<Dispute>;
  listPayouts(): Promise<PayoutRequest[]>;
  listDisputes(): Promise<Dispute[]>;
};

export function createHttpSellerBalanceClient(): SellerBalanceClient {
  return {
    async getBalance() {
      return apiRequest("/seller/balance", {
        parse: (d) => sellerBalanceSchema.parse(d),
      });
    },
    async requestPayout(amount) {
      return apiRequest("/seller/balance/payouts", {
        method: "POST",
        body: JSON.stringify({ amount }),
        parse: (d) => payoutRequestSchema.parse(d),
      });
    },
    async openDispute(orderId, reason) {
      return apiRequest("/seller/balance/disputes", {
        method: "POST",
        body: JSON.stringify({ orderId, reason }),
        parse: (d) => disputeSchema.parse(d),
      });
    },
    async listPayouts() {
      return apiRequest("/seller/balance/payouts", {
        parse: (d) => z.array(payoutRequestSchema).parse(d),
      });
    },
    async listDisputes() {
      return apiRequest("/seller/balance/disputes", {
        parse: (d) => z.array(disputeSchema).parse(d),
      });
    },
  };
}

export function createMockSellerBalanceClient(): SellerBalanceClient {
  let seq = 1;
  const balance = sellerBalanceSchema.parse({
    available: { amount: 1200000, currency: "IRR" },
    pending: { amount: 300000, currency: "IRR" },
    commissionRate: 0.1,
  });
  const payouts: PayoutRequest[] = [];
  const disputes: Dispute[] = [];

  return {
    async getBalance() {
      return {
        ...balance,
        available: { ...balance.available },
        pending: { ...balance.pending },
      };
    },
    async requestPayout(amount) {
      const row = payoutRequestSchema.parse({
        id: `payout_${seq++}`,
        amount: { amount, currency: "IRR" },
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      payouts.push(row);
      return row;
    },
    async openDispute(orderId, reason) {
      const row = disputeSchema.parse({
        id: `dispute_${seq++}`,
        orderId,
        reason,
        status: "open",
        createdAt: new Date().toISOString(),
      });
      disputes.push(row);
      return row;
    },
    async listPayouts() {
      return [...payouts];
    },
    async listDisputes() {
      return [...disputes];
    },
  };
}

let active: SellerBalanceClient = createMockSellerBalanceClient();
export function setSellerBalanceClient(c: SellerBalanceClient) {
  active = c;
}
export function getSellerBalanceClient() {
  return active;
}
