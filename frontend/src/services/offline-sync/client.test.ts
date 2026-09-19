import { describe, expect, it } from "vitest";
import { createMockOfflineSyncClient, passedCount } from "./client";
describe("offline-sync", () => {
  it("lists and marks pass", async () => {
    const c = createMockOfflineSyncClient();
    const list = await c.list();
    expect(list.length).toBeGreaterThan(0);
    await c.markPass(list[0]!.id);
    expect(passedCount(await c.list())).toBeGreaterThan(0);
  });
});
