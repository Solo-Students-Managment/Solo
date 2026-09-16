import { describe, expect, it } from "vitest";
import {
  createMockPlanChangeClient,
  hasOverLimit,
  planChangeDirection,
} from "./client";

describe("plan-change helpers", () => {
  it("detects upgrade vs downgrade direction", () => {
    expect(planChangeDirection("org_starter", "org_pro")).toBe("upgrade");
    expect(planChangeDirection("org_pro", "org_starter")).toBe("downgrade");
  });

  it("previews over-limit impact without data loss risk", async () => {
    const client = createMockPlanChangeClient();
    const preview = await client.preview("org_pc", "org_starter");
    expect(preview.dataLossRisk).toBe(false);
    expect(hasOverLimit(preview)).toBe(true);
    expect(preview.overLimitItems.some((i) => i.excess > 0)).toBe(true);
  });

  it("applies plan change", async () => {
    const client = createMockPlanChangeClient();
    const result = await client.apply("org_apply", "org_pro");
    expect(result.targetPlanCode).toBe("org_pro");
  });
});
