import { z } from "zod";
import { apiRequest } from "@/services/api";

export const couponSchema = z.object({
  code: z.string().min(1),
  percentOff: z.number().int().min(1).max(100),
  validUntil: z.string().min(1),
  active: z.boolean(),
});
export type Coupon = z.infer<typeof couponSchema>;

export const couponValidationSchema = z.object({
  valid: z.boolean(),
  coupon: couponSchema.nullable(),
  message: z.string(),
});
export type CouponValidation = z.infer<typeof couponValidationSchema>;

const catalog: Coupon[] = [
  couponSchema.parse({
    code: "WELCOME20",
    percentOff: 20,
    validUntil: new Date(Date.now() + 90 * 86_400_000).toISOString(),
    active: true,
  }),
  couponSchema.parse({
    code: "EXPIRED10",
    percentOff: 10,
    validUntil: new Date(Date.now() - 86_400_000).toISOString(),
    active: true,
  }),
];

export function isCouponValid(coupon: Coupon, now = Date.now()): boolean {
  if (!coupon.active) return false;
  return new Date(coupon.validUntil).getTime() >= now;
}

export type CouponsClient = {
  validate(organizationId: string, code: string): Promise<CouponValidation>;
  apply(organizationId: string, code: string): Promise<CouponValidation>;
};

export function createHttpCouponsClient(): CouponsClient {
  return {
    async validate(organizationId, code) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/coupons/validate`,
        {
          method: "POST",
          body: JSON.stringify({ code }),
          parse: (data) => couponValidationSchema.parse(data),
        },
      );
    },
    async apply(organizationId, code) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/coupons/apply`,
        {
          method: "POST",
          body: JSON.stringify({ code }),
          parse: (data) => couponValidationSchema.parse(data),
        },
      );
    },
  };
}

function lookup(code: string): Coupon | undefined {
  return catalog.find(
    (c) => c.code.toLowerCase() === code.trim().toLowerCase(),
  );
}

export function createMockCouponsClient(): CouponsClient {
  return {
    async validate(_organizationId, code) {
      const coupon = lookup(code);
      if (!coupon) {
        return { valid: false, coupon: null, message: "not_found" };
      }
      if (!isCouponValid(coupon)) {
        return { valid: false, coupon, message: "expired" };
      }
      return { valid: true, coupon, message: "ok" };
    },
    async apply(organizationId, code) {
      return createMockCouponsClient().validate(organizationId, code);
    },
  };
}

let client: CouponsClient = createMockCouponsClient();
export function getCouponsClient() {
  return client;
}
export function setCouponsClient(next: CouponsClient) {
  client = next;
}
