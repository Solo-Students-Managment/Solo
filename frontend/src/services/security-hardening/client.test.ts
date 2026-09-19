import { describe, expect, it } from "vitest";
import { createMockSecurityHardeningClient, passedCount } from "./client";
describe("security-hardening", () => {
  it("lists and marks pass", async () => {
    const c = createMockSecurityHardeningClient();
    const list = await c.list();
    expect(list.length).toBeGreaterThan(0);
    await c.markPass(list[0]!.id);
    expect(passedCount(await c.list())).toBeGreaterThan(0);
  });
});
