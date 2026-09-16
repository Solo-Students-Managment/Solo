import { describe, expect, it } from "vitest";
import { createMockFeatureFlagsClient } from "./client";
describe("feature flags", () => {
  it("toggles flag", async () => {
    const c = createMockFeatureFlagsClient();
    const flag = (await c.list())[0]!;
    const next = await c.toggle(flag.id, !flag.enabled);
    expect(next.enabled).toBe(!flag.enabled);
  });
});
