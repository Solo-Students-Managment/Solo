import { describe, expect, it } from "vitest";
import { createMockA11yAccommodationsClient, passedCount } from "./client";
describe("a11y-accommodations", () => {
  it("lists and marks pass", async () => {
    const c = createMockA11yAccommodationsClient();
    const list = await c.list();
    expect(list.length).toBeGreaterThan(0);
    await c.markPass(list[0]!.id);
    expect(passedCount(await c.list())).toBeGreaterThan(0);
  });
});
