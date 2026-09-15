import { describe, expect, it } from "vitest";

import { createClassSchema, createCourseSchema } from "./schemas";

describe("courses schemas", () => {
  it("accepts course and class payloads", () => {
    expect(
      createCourseSchema.safeParse({
        name: "Algebra I",
        subjectName: "Math",
      }).success,
    ).toBe(true);
    expect(
      createClassSchema.safeParse({ name: "Section A", capacity: 25 }).success,
    ).toBe(true);
  });
});
