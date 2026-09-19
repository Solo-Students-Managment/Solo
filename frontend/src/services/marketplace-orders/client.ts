import { z } from "zod";
import { apiRequest, moneySchema, opaqueIdSchema } from "@/services/api";

export const orderStatusSchema = z.enum([
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
  "refunded",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const marketplaceOrderSchema = z.object({
  id: opaqueIdSchema,
  buyerId: opaqueIdSchema,
  sellerId: opaqueIdSchema,
  sellerName: z.string().min(1),
  productTitle: z.string().min(1),
  status: orderStatusSchema,
  total: moneySchema,
  createdAt: z.string(),
});
export type MarketplaceOrder = z.infer<typeof marketplaceOrderSchema>;

export function canFulfill(order: MarketplaceOrder): boolean {
  return order.status === "paid";
}

export type MarketplaceOrdersClient = {
  listBuyer(): Promise<MarketplaceOrder[]>;
  listSeller(): Promise<MarketplaceOrder[]>;
  fulfill(orderId: string): Promise<MarketplaceOrder>;
};

export function createHttpMarketplaceOrdersClient(): MarketplaceOrdersClient {
  return {
    async listBuyer() {
      return apiRequest("/marketplace/orders", {
        parse: (d) => z.array(marketplaceOrderSchema).parse(d),
      });
    },
    async listSeller() {
      return apiRequest("/seller/orders", {
        parse: (d) => z.array(marketplaceOrderSchema).parse(d),
      });
    },
    async fulfill(orderId) {
      return apiRequest(
        `/seller/orders/${encodeURIComponent(orderId)}/fulfill`,
        {
          method: "POST",
          parse: (d) => marketplaceOrderSchema.parse(d),
        },
      );
    },
  };
}

export function createMockMarketplaceOrdersClient(): MarketplaceOrdersClient {
  const rows = new Map<string, MarketplaceOrder>();
  const seed = marketplaceOrderSchema.parse({
    id: "ord_1",
    buyerId: "usr_demo",
    sellerId: "seller_sara",
    sellerName: "Sara Books",
    productTitle: "Algebra Workbook",
    status: "paid",
    total: { amount: 250000, currency: "IRR" },
    createdAt: "2026-09-01T10:00:00.000Z",
  });
  rows.set(String(seed.id), seed);

  return {
    async listBuyer() {
      return Array.from(rows.values());
    },
    async listSeller() {
      return Array.from(rows.values()).filter(
        (r) => r.sellerId === "seller_sara",
      );
    },
    async fulfill(orderId) {
      const row = rows.get(orderId);
      if (!row) throw new Error("not_found");
      if (!canFulfill(row)) throw new Error("invalid_status");
      const next = marketplaceOrderSchema.parse({
        ...row,
        status: "fulfilled",
      });
      rows.set(orderId, next);
      return next;
    },
  };
}

let active: MarketplaceOrdersClient = createMockMarketplaceOrdersClient();
export function setMarketplaceOrdersClient(c: MarketplaceOrdersClient) {
  active = c;
}
export function getMarketplaceOrdersClient() {
  return active;
}
