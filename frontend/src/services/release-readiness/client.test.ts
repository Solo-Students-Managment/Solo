import { describe, expect, it } from "vitest";
import { createMockReleaseReadinessClient, passedCount } from "./client";
describe("release-readiness", () => {
  it("lists and marks pass", async () => {
    const c = createMockReleaseReadinessClient();
    const list = await c.list();
    expect(list.length).toBeGreaterThan(0);
    await c.markPass(list[0]!.id);
    expect(passedCount(await c.list())).toBeGreaterThan(0);
  });
});
