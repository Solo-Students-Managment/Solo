import { z } from "zod";
import { apiRequest, moneySchema, opaqueIdSchema } from "@/services/api";

export const cartItemSchema = z.object({
  id: opaqueIdSchema,
  sellerId: opaqueIdSchema,
  sellerName: z.string().min(1),
  variantId: opaqueIdSchema,
  productTitle: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: moneySchema,
});
export type CartItem = z.infer<typeof cartItemSchema>;

export const cartSchema = z.object({
  items: z.array(cartItemSchema),
});
export type Cart = z.infer<typeof cartSchema>;

export const checkoutResultSchema = z.object({
  orderIds: z.array(opaqueIdSchema),
  total: moneySchema,
});
export type CheckoutResult = z.infer<typeof checkoutResultSchema>;

export function cartTotal(items: CartItem[]): {
  amount: number;
  currency: "IRR" | "USD" | "EUR";
} {
  if (items.length === 0) return { amount: 0, currency: "IRR" };
  const currency = items[0]!.unitPrice.currency;
  const amount = items.reduce((sum, item) => {
    if (item.unitPrice.currency !== currency) return sum;
    return sum + item.unitPrice.amount * item.quantity;
  }, 0);
  return { amount, currency };
}

export function groupBySeller(items: CartItem[]): Map<string, CartItem[]> {
  const groups = new Map<string, CartItem[]>();
  for (const item of items) {
    const key = String(item.sellerId);
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return groups;
}

export type MarketplaceCartClient = {
  list(): Promise<Cart>;
  add(input: {
    sellerId: string;
    sellerName: string;
    variantId: string;
    productTitle: string;
    quantity: number;
    unitPrice: { amount: number; currency: "IRR" | "USD" | "EUR" };
  }): Promise<Cart>;
  remove(itemId: string): Promise<Cart>;
  checkout(): Promise<CheckoutResult>;
};

export function createHttpMarketplaceCartClient(): MarketplaceCartClient {
  return {
    async list() {
      return apiRequest("/marketplace/cart", {
        parse: (d) => cartSchema.parse(d),
      });
    },
    async add(input) {
      return apiRequest("/marketplace/cart/items", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (d) => cartSchema.parse(d),
      });
    },
    async remove(itemId) {
      return apiRequest(
        `/marketplace/cart/items/${encodeURIComponent(itemId)}`,
        {
          method: "DELETE",
          parse: (d) => cartSchema.parse(d),
        },
      );
    },
    async checkout() {
      return apiRequest("/marketplace/cart/checkout", {
        method: "POST",
        parse: (d) => checkoutResultSchema.parse(d),
      });
    },
  };
}

export function createMockMarketplaceCartClient(): MarketplaceCartClient {
  const items = new Map<string, CartItem>();
  let seq = 1;
  const seed = cartItemSchema.parse({
    id: "cart_item_1",
    sellerId: "seller_sara",
    sellerName: "Sara Books",
    variantId: "var_1",
    productTitle: "Algebra Workbook",
    quantity: 1,
    unitPrice: { amount: 250000, currency: "IRR" },
  });
  items.set(String(seed.id), seed);
  const seed2 = cartItemSchema.parse({
    id: "cart_item_2",
    sellerId: "seller_reza",
    sellerName: "Reza Physics",
    variantId: "var_2",
    productTitle: "Physics Lab Kit",
    quantity: 2,
    unitPrice: { amount: 180000, currency: "IRR" },
  });
  items.set(String(seed2.id), seed2);

  const snapshot = (): Cart => ({
    items: Array.from(items.values()),
  });

  return {
    async list() {
      return snapshot();
    },
    async add(input) {
      const row = cartItemSchema.parse({
        id: `cart_item_${seq++}`,
        sellerId: input.sellerId,
        sellerName: input.sellerName,
        variantId: input.variantId,
        productTitle: input.productTitle,
        quantity: input.quantity,
        unitPrice: input.unitPrice,
      });
      items.set(String(row.id), row);
      return snapshot();
    },
    async remove(itemId) {
      items.delete(itemId);
      return snapshot();
    },
    async checkout() {
      const list = Array.from(items.values());
      const total = cartTotal(list);
      items.clear();
      return checkoutResultSchema.parse({
        orderIds: [`ord_${seq++}`],
        total,
      });
    },
  };
}

let active: MarketplaceCartClient = createMockMarketplaceCartClient();
export function setMarketplaceCartClient(c: MarketplaceCartClient) {
  active = c;
}
export function getMarketplaceCartClient() {
  return active;
}
