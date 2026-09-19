import { describe, expect, it } from "vitest";
import { createMockPublicSchoolProfileClient } from "./client";

describe("public school profile", () => {
  it("hides unpublished school and serves published institute", async () => {
    const client = createMockPublicSchoolProfileClient();
    await expect(client.getBySlug("sunrise-school")).rejects.toThrow(
      "unpublished",
    );
    const pub = await client.getBySlug("nova-institute");
    expect(pub.kind).toBe("institute");
    expect(pub.status).toBe("published");
  });
});
