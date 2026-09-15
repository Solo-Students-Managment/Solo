import { describe, expect, it } from "vitest";

import {
  createLessonSchema,
  createModuleSchema,
  resolveCurriculumTab,
} from "./schemas";

describe("curriculum schemas", () => {
  it("defaults unknown tabs to modules", () => {
    expect(resolveCurriculumTab(null)).toBe("modules");
    expect(resolveCurriculumTab("units")).toBe("units");
    expect(resolveCurriculumTab("nope")).toBe("modules");
  });

  it("requires module title", () => {
    expect(
      createModuleSchema.safeParse({ title: "", sortOrder: 0 }).success,
    ).toBe(false);
  });

  it("accepts lesson payloads with duration and kind", () => {
    const parsed = createLessonSchema.parse({
      unitId: "cunit_1",
      title: "Intro",
      kind: "lesson",
      durationMinutes: "45",
      progressPercent: "10",
    });
    expect(parsed.durationMinutes).toBe(45);
    expect(parsed.progressPercent).toBe(10);
  });
});
