import { describe, expect, it } from "vitest";
import { publishResourceSchema } from "./schemas";
describe("resources schemas", () => {
  it("rejects video mime", () => {
    expect(
      publishResourceSchema.safeParse({
        subjectName: "Math",
        title: "Notes",
        mimeHint: "pdf",
      }).success,
    ).toBe(true);
    expect(
      publishResourceSchema.safeParse({
        subjectName: "Math",
        title: "Clip",
        mimeHint: "video",
      }).success,
    ).toBe(false);
  });
});
