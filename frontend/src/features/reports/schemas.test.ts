import { describe, expect, it } from "vitest";
import { saveReportViewSchema } from "./schemas";
describe("reports schemas", () => {
  it("accepts saved view", () => {
    expect(
      saveReportViewSchema.safeParse({
        name: "Attendance weekly",
        kind: "attendance",
        format: "csv",
      }).success,
    ).toBe(true);
  });
});
