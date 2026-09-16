import { describe, expect, it } from "vitest";
import { createMockCouponsClient, isCouponValid, couponSchema } from "./client";

describe("coupons", () => {
  it("validates active coupon", async () => {
    const result = await createMockCouponsClient().validate(
      "org_c",
      "WELCOME20",
    );
    expect(result.valid).toBe(true);
  });

  it("rejects expired coupon", async () => {
    const expired = couponSchema.parse({
      code: "X",
      percentOff: 5,
      validUntil: new Date(Date.now() - 1000).toISOString(),
      active: true,
    });
    expect(isCouponValid(expired)).toBe(false);
  });
});
