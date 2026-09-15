import { describe, expect, it } from "vitest";
import { nextExpectedClockEvent } from "./client";
describe("staff attendance helpers", () => {
  it("alternates clock in and out", () => {
    expect(nextExpectedClockEvent([])).toBe("clock_in");
    expect(nextExpectedClockEvent([{ eventType: "clock_in" }])).toBe(
      "clock_out",
    );
  });
});
