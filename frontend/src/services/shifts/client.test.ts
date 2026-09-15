import { describe, expect, it } from "vitest";
import { isValidShiftWindow } from "./client";
describe("shifts helpers", () => {
  it("requires start before end", () => {
    expect(isValidShiftWindow("09:00", "17:00")).toBe(true);
    expect(isValidShiftWindow("17:00", "09:00")).toBe(false);
  });
});
