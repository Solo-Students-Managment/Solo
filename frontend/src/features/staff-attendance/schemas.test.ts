import { describe, expect, it } from "vitest";
import { createClockEventSchema } from "./schemas";
describe("staff attendance schemas", () => {
  it("requires staff name", () => {
    expect(
      createClockEventSchema.safeParse({
        staffDisplayName: "",
        eventType: "clock_in",
        branchName: "Main",
      }).success,
    ).toBe(false);
  });
});
