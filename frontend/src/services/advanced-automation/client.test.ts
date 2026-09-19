import { describe, expect, it } from "vitest";
import { createMockAdvancedAutomationClient, passedCount } from "./client";
describe("advanced-automation", () => {
  it("lists and marks pass", async () => {
    const c = createMockAdvancedAutomationClient();
    const list = await c.list();
    expect(list.length).toBeGreaterThan(0);
    await c.markPass(list[0]!.id);
    expect(passedCount(await c.list())).toBeGreaterThan(0);
  });
});
