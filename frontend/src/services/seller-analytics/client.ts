import { z } from "zod";
import { apiRequest } from "@/services/api";

export const sellerMetricsSchema = z.object({
  orders: z.number().int().nonnegative(),
  revenue: z.number().nonnegative(),
  conversionRate: z.number().min(0).max(1),
  period: z.string(),
});
export type SellerMetrics = z.infer<typeof sellerMetricsSchema>;

export const sellerRestrictionSchema = z.object({
  flag: z.string().min(1),
  active: z.boolean(),
  reason: z.string().nullable(),
});
export type SellerRestriction = z.infer<typeof sellerRestrictionSchema>;

export const sellerAnalyticsSchema = z.object({
  metrics: sellerMetricsSchema,
  restrictions: z.array(sellerRestrictionSchema),
});
export type SellerAnalytics = z.infer<typeof sellerAnalyticsSchema>;

export function hasActiveRestrictions(
  restrictions: SellerRestriction[],
): SellerRestriction[] {
  return restrictions.filter((r) => r.active);
}

export type SellerAnalyticsClient = {
  get(): Promise<SellerAnalytics>;
};

export function createHttpSellerAnalyticsClient(): SellerAnalyticsClient {
  return {
    async get() {
      return apiRequest("/seller/analytics", {
        parse: (d) => sellerAnalyticsSchema.parse(d),
      });
    },
  };
}

export function createMockSellerAnalyticsClient(): SellerAnalyticsClient {
  return {
    async get() {
      return sellerAnalyticsSchema.parse({
        metrics: {
          orders: 42,
          revenue: 12500000,
          conversionRate: 0.035,
          period: "2026-09",
        },
        restrictions: [
          { flag: "payout_hold", active: false, reason: null },
          {
            flag: "listing_limit",
            active: true,
            reason: "Verification pending",
          },
        ],
      });
    },
  };
}

let active: SellerAnalyticsClient = createMockSellerAnalyticsClient();
export function setSellerAnalyticsClient(c: SellerAnalyticsClient) {
  active = c;
}
export function getSellerAnalyticsClient() {
  return active;
}
