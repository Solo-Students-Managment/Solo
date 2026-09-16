import { describe, expect, it } from "vitest";
import {
  createMockUsageClient,
  isOverQuota,
  quotaPercent,
  quotaMeterSchema,
} from "./client";

describe("usage helpers", () => {
  it("detects over quota", () => {
    const meter = quotaMeterSchema.parse({
      resource: "students",
      used: 120,
      quota: 100,
      unit: "seats",
    });
    expect(isOverQuota(meter)).toBe(true);
    expect(quotaPercent(meter)).toBe(100);
  });

  it("loads usage snapshot", async () => {
    const snap = await createMockUsageClient().get("org_u");
    expect(snap.meters.length).toBeGreaterThan(0);
  });
});
