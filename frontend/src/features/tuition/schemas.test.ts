import { describe, expect, it } from "vitest";
import { recordTuitionSchema } from "./schemas";
describe("tuition schemas", () => {
  it("accepts record", () => {
    expect(
      recordTuitionSchema.safeParse({
        studentDisplayName: "Sara",
        amountMinor: 1000,
        dueAt: "2026-03-01",
        status: "due",
      }).success,
    ).toBe(true);
  });
});
