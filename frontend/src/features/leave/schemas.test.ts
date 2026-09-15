import { describe, expect, it } from "vitest";
import { createLeaveSchema } from "./schemas";
describe("leave schemas", () => {
  it("rejects inverted range", () => {
    expect(
      createLeaveSchema.safeParse({
        staffDisplayName: "Sam",
        leaveType: "annual",
        startDate: "2026-02-02",
        endDate: "2026-02-01",
        reason: "trip",
      }).success,
    ).toBe(false);
  });
});
