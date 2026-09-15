import { describe, expect, it } from "vitest";
import { upsertGradeSchema } from "./schemas";
describe("gradebook schemas", () => {
  it("accepts score", () => {
    expect(
      upsertGradeSchema.safeParse({
        studentDisplayName: "Sara",
        subjectName: "Math",
        score: 90,
      }).success,
    ).toBe(true);
  });
});
