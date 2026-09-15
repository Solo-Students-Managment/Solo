import { describe, expect, it } from "vitest";

import {
  createEnrollmentSchema,
  transferEnrollmentSchema,
  updateEnrollmentStatusSchema,
} from "./schemas";

describe("enrollments schemas", () => {
  it("accepts create and transfer payloads", () => {
    expect(
      createEnrollmentSchema.safeParse({
        studentDisplayName: "Sara",
        className: "Section A",
        courseName: "Algebra I",
      }).success,
    ).toBe(true);
    expect(
      transferEnrollmentSchema.safeParse({
        className: "Section B",
        courseName: "Algebra I",
      }).success,
    ).toBe(true);
  });

  it("rejects transferred status in direct status update", () => {
    expect(
      updateEnrollmentStatusSchema.safeParse({ status: "transferred" }).success,
    ).toBe(false);
    expect(
      updateEnrollmentStatusSchema.safeParse({ status: "withdrawn" }).success,
    ).toBe(true);
  });
});
