import { describe, expect, it } from "vitest";
import {
  createMockPublicTeacherProfileClient,
  isPubliclyVisible,
} from "./client";

describe("public teacher profile", () => {
  it("keeps profiles unpublished by default and hides them publicly", async () => {
    const client = createMockPublicTeacherProfileClient();
    const mine = await client.getMine();
    expect(mine.status).toBe("unpublished");
    expect(isPubliclyVisible(mine.status)).toBe(false);
    await expect(client.getBySlug(mine.slug)).rejects.toThrow("unpublished");
  });

  it("publishes and serves public profile by slug", async () => {
    const client = createMockPublicTeacherProfileClient();
    const published = await client.publish();
    expect(published.status).toBe("published");
    const publicView = await client.getBySlug(published.slug);
    expect(publicView.displayName).toBe(published.displayName);
  });
});
