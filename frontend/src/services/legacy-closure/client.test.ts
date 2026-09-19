import { describe, expect, it } from "vitest";
import { createMockLegacyClosureClient, passedCount } from "./client";
describe("legacy-closure", () => {
  it("lists and marks pass", async () => {
    const c = createMockLegacyClosureClient();
    const list = await c.list();
    expect(list.length).toBeGreaterThan(0);
    await c.markPass(list[0]!.id);
    expect(passedCount(await c.list())).toBeGreaterThan(0);
  });
});
