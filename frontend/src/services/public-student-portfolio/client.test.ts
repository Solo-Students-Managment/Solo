import { describe, expect, it } from "vitest";
import {
  createMockPublicStudentPortfolioClient,
  sanitizePortfolioForPublic,
} from "./client";

describe("public student portfolio", () => {
  it("is unpublished by default and minor-safe", async () => {
    const client = createMockPublicStudentPortfolioClient();
    const mine = await client.getMine();
    expect(mine.status).toBe("unpublished");
    expect(mine.isMinor).toBe(true);
    const sanitized = sanitizePortfolioForPublic({
      ...mine,
      about: "x".repeat(500),
      status: "published",
    });
    expect(sanitized.about?.length).toBeLessThanOrEqual(280);
  });

  it("serves published portfolio without private fields", async () => {
    const client = createMockPublicStudentPortfolioClient();
    const pub = await client.getBySlug("mina-portfolio");
    expect(pub.displayName).toBe("Mina Student");
    expect(Object.keys(pub)).not.toContain("grades");
  });
});
