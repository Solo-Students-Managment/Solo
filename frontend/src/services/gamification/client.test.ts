import { describe, expect, it } from "vitest";
import { createMockGamificationClient, passedCount } from "./client";
describe("gamification", () => {
  it("lists and marks pass", async () => {
    const c = createMockGamificationClient();
    const list = await c.list();
    expect(list.length).toBeGreaterThan(0);
    await c.markPass(list[0]!.id);
    expect(passedCount(await c.list())).toBeGreaterThan(0);
  });
});
