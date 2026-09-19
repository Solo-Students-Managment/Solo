import { describe, expect, it } from "vitest";
import { createMockPwaHardeningClient, passedCount } from "./client";
describe("pwa-hardening", () => {
  it("lists and marks pass", async () => {
    const c = createMockPwaHardeningClient();
    const list = await c.list();
    expect(list.length).toBeGreaterThan(0);
    await c.markPass(list[0]!.id);
    expect(passedCount(await c.list())).toBeGreaterThan(0);
  });
});
