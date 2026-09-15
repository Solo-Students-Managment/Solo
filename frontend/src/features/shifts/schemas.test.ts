import { describe, expect, it } from "vitest";
import { createShiftSchema } from "./schemas";
describe("shifts schemas", () => {
  it("rejects inverted window", () => {
    expect(
      createShiftSchema.safeParse({
        name: "Morning",
        weekday: 1,
        startTime: "17:00",
        endTime: "09:00",
        branchName: "Main",
      }).success,
    ).toBe(false);
  });
});
