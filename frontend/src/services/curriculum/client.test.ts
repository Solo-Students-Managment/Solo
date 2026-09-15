import { describe, expect, it } from "vitest";

import { canHostLessons, clampLessonProgress } from "./client";

describe("curriculum helpers", () => {
  it("allows lessons when a unit is attached to a module", () => {
    expect(canHostLessons({ moduleId: "cmod_1" as never })).toBe(true);
  });

  it("clamps lesson progress to 0–100", () => {
    expect(clampLessonProgress(-5)).toBe(0);
    expect(clampLessonProgress(150)).toBe(100);
    expect(clampLessonProgress(42.6)).toBe(43);
  });
});
