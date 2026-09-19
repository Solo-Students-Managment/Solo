import { describe, expect, it } from "vitest";
import {
  averageRating,
  createMockVerifiedReviewsClient,
  isReviewVisible,
} from "./client";

describe("verified reviews", () => {
  it("only averages published verified reviews", async () => {
    const client = createMockVerifiedReviewsClient();
    const list = await client.listByTarget("sara-english");
    expect(list.every(isReviewVisible)).toBe(true);
    expect(averageRating(list)).toBe(5);
    expect(await client.canReview("sara-english")).toBe(true);
    expect(await client.canReview("unknown")).toBe(false);
  });

  it("rejects submit without verified enrollment", async () => {
    const client = createMockVerifiedReviewsClient();
    await expect(
      client.submit({ targetSlug: "unknown", rating: 4, body: "Nice" }),
    ).rejects.toThrow("not_eligible");
  });
});
