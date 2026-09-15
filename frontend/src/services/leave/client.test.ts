import { describe, expect, it } from "vitest";
import { canApproveLeave, isValidLeaveRange } from "./client";
describe("leave helpers", () => {
  it("validates date range and pending approval", () => {
    expect(isValidLeaveRange("2026-01-01", "2026-01-03")).toBe(true);
    expect(isValidLeaveRange("2026-01-03", "2026-01-01")).toBe(false);
    expect(canApproveLeave("pending")).toBe(true);
    expect(canApproveLeave("approved")).toBe(false);
  });
});
