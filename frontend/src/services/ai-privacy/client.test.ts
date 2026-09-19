import { describe, expect, it } from "vitest";
import { createMockAiPrivacyClient, passedCount } from "./client";
describe("ai-privacy", () => {
  it("lists and marks pass", async () => {
    const c = createMockAiPrivacyClient();
    const list = await c.list();
    expect(list.length).toBeGreaterThan(0);
    await c.markPass(list[0]!.id);
    expect(passedCount(await c.list())).toBeGreaterThan(0);
  });
});
