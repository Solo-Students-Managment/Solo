import { describe, expect, it } from "vitest";

import { createSubjectSchema } from "./schemas";

describe("createSubjectSchema", () => {
  it("accepts a valid subject payload", () => {
    expect(
      createSubjectSchema.safeParse({
        name: "Physics",
        code: "PHY",
        levelLabel: "Grade 9",
        teacherDisplayName: "Mr. Karimi",
      }).success,
    ).toBe(true);
  });

  it("rejects short codes", () => {
    expect(
      createSubjectSchema.safeParse({
        name: "Physics",
        code: "P",
        levelLabel: "Grade 9",
        teacherDisplayName: "Mr. Karimi",
      }).success,
    ).toBe(false);
  });
});
