import { z } from "zod";
import { apiRequest, moneySchema, opaqueIdSchema } from "@/services/api";

export const couponSchema = z.object({
  code: z.string().min(1),
  discountPercent: z.number().min(0).max(100),
});
export type Coupon = z.infer<typeof couponSchema>;

export const wishlistItemSchema = z.object({
  id: opaqueIdSchema,
  productId: opaqueIdSchema,
  productTitle: z.string().min(1),
});
export type WishlistItem = z.infer<typeof wishlistItemSchema>;

export const compareItemSchema = z.object({
  id: opaqueIdSchema,
  productId: opaqueIdSchema,
  productTitle: z.string().min(1),
  price: moneySchema,
});
export type CompareItem = z.infer<typeof compareItemSchema>;

export const affiliateInfoSchema = z.object({
  code: z.string().min(1),
  commissionRate: z.number().min(0).max(1),
});
export type AffiliateInfo = z.infer<typeof affiliateInfoSchema>;

export const MAX_COMPARE_ITEMS = 4;

export function canAddToCompare(current: CompareItem[]): boolean {
  return current.length < MAX_COMPARE_ITEMS;
}

export type MarketplacePromosClient = {
  applyCoupon(code: string): Promise<{ discount: number; message: string }>;
  listWishlist(): Promise<WishlistItem[]>;
  toggleWishlist(
    productId: string,
    productTitle: string,
  ): Promise<WishlistItem[]>;
  listCompare(): Promise<CompareItem[]>;
  addToCompare(
    productId: string,
    productTitle: string,
    price: { amount: number; currency: "IRR" | "USD" | "EUR" },
  ): Promise<CompareItem[]>;
  removeFromCompare(productId: string): Promise<CompareItem[]>;
  getAffiliate(): Promise<AffiliateInfo>;
};

export function createHttpMarketplacePromosClient(): MarketplacePromosClient {
  return {
    async applyCoupon(code) {
      return apiRequest("/marketplace/promos/coupon", {
        method: "POST",
        body: JSON.stringify({ code }),
        parse: (d) =>
          z.object({ discount: z.number(), message: z.string() }).parse(d),
      });
    },
    async listWishlist() {
      return apiRequest("/marketplace/promos/wishlist", {
        parse: (d) => z.array(wishlistItemSchema).parse(d),
      });
    },
    async toggleWishlist(productId, productTitle) {
      return apiRequest("/marketplace/promos/wishlist/toggle", {
        method: "POST",
        body: JSON.stringify({ productId, productTitle }),
        parse: (d) => z.array(wishlistItemSchema).parse(d),
      });
    },
    async listCompare() {
      return apiRequest("/marketplace/promos/compare", {
        parse: (d) => z.array(compareItemSchema).parse(d),
      });
    },
    async addToCompare(productId, productTitle, price) {
      return apiRequest("/marketplace/promos/compare", {
        method: "POST",
        body: JSON.stringify({ productId, productTitle, price }),
        parse: (d) => z.array(compareItemSchema).parse(d),
      });
    },
    async removeFromCompare(productId) {
      return apiRequest(
        `/marketplace/promos/compare/${encodeURIComponent(productId)}`,
        {
          method: "DELETE",
          parse: (d) => z.array(compareItemSchema).parse(d),
        },
      );
    },
    async getAffiliate() {
      return apiRequest("/marketplace/promos/affiliate", {
        parse: (d) => affiliateInfoSchema.parse(d),
      });
    },
  };
}

export function createMockMarketplacePromosClient(): MarketplacePromosClient {
  const wishlist = new Map<string, WishlistItem>();
  const compare = new Map<string, CompareItem>();
  let seq = 1;
  const coupons = new Map<string, number>([
    ["SAVE10", 10],
    ["SAVE20", 20],
  ]);

  return {
    async applyCoupon(code) {
      const discount = coupons.get(code.toUpperCase());
      if (!discount) throw new Error("invalid_coupon");
      return { discount, message: `Applied ${discount}% off` };
    },
    async listWishlist() {
      return Array.from(wishlist.values());
    },
    async toggleWishlist(productId, productTitle) {
      if (wishlist.has(productId)) {
        wishlist.delete(productId);
      } else {
        wishlist.set(
          productId,
          wishlistItemSchema.parse({
            id: `wish_${seq++}`,
            productId,
            productTitle,
          }),
        );
      }
      return Array.from(wishlist.values());
    },
    async listCompare() {
      return Array.from(compare.values());
    },
    async addToCompare(productId, productTitle, price) {
      if (
        !canAddToCompare(Array.from(compare.values())) &&
        !compare.has(productId)
      ) {
        throw new Error("compare_full");
      }
      compare.set(
        productId,
        compareItemSchema.parse({
          id: `cmp_${seq++}`,
          productId,
          productTitle,
          price,
        }),
      );
      return Array.from(compare.values());
    },
    async removeFromCompare(productId) {
      compare.delete(productId);
      return Array.from(compare.values());
    },
    async getAffiliate() {
      return affiliateInfoSchema.parse({
        code: "AFF-SARA-2026",
        commissionRate: 0.05,
      });
    },
  };
}

let active: MarketplacePromosClient = createMockMarketplacePromosClient();
export function setMarketplacePromosClient(c: MarketplacePromosClient) {
  active = c;
}
export function getMarketplacePromosClient() {
  return active;
}
