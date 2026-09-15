import { describe, expect, it } from "vitest";

import { createEnrollmentSchema } from "./schemas";

describe("createEnrollmentSchema", () => {
  it("accepts enrollment payload", () => {
    expect(
      createEnrollmentSchema.safeParse({
        studentDisplayName: "Sara",
        className: "Section A",
        courseName: "Algebra",
      }).success,
    ).toBe(true);
  });
});
