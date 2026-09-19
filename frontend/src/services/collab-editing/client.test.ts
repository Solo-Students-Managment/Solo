import { describe, expect, it } from "vitest";
import { createMockCollabEditingClient, passedCount } from "./client";
describe("collab-editing", () => {
  it("lists and marks pass", async () => {
    const c = createMockCollabEditingClient();
    const list = await c.list();
    expect(list.length).toBeGreaterThan(0);
    await c.markPass(list[0]!.id);
    expect(passedCount(await c.list())).toBeGreaterThan(0);
  });
});
