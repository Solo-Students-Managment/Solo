import { describe, expect, it } from "vitest";
import { createAssignmentSchema } from "./schemas";

describe("assignments schemas", () => {
  it("accepts homework payload", () => {
    expect(
      createAssignmentSchema.safeParse({
        title: "Essay 1",
        type: "homework",
        dueAt: "2026-10-01T12:00:00.000Z",
      }).success,
    ).toBe(true);
  });
});
