import { describe, expect, it } from "vitest";
import { createMockIntegrationCenterClient, passedCount } from "./client";
describe("integration-center", () => {
  it("lists and marks pass", async () => {
    const c = createMockIntegrationCenterClient();
    const list = await c.list();
    expect(list.length).toBeGreaterThan(0);
    await c.markPass(list[0]!.id);
    expect(passedCount(await c.list())).toBeGreaterThan(0);
  });
});
