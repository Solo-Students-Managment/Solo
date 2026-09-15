import { describe, expect, it } from "vitest";

import {
  createEvaluationLevelSchema,
  createEvaluationTemplateSchema,
  createGradeScaleSchema,
  createProgressMetricSchema,
  parseProgressMetricIds,
  resolveEvaluationTab,
} from "./schemas";

describe("evaluation schemas", () => {
  it("accepts preset grade scales", () => {
    expect(
      createGradeScaleSchema.safeParse({
        name: "Standard 100",
        type: "out_of_100",
      }).success,
    ).toBe(true);
  });

  it("requires custom bounds when type is custom", () => {
    expect(
      createGradeScaleSchema.safeParse({
        name: "Custom",
        type: "custom",
      }).success,
    ).toBe(false);
    expect(
      createGradeScaleSchema.safeParse({
        name: "Custom",
        type: "custom",
        minValue: 0,
        maxValue: 10,
      }).success,
    ).toBe(true);
  });

  it("requires pass/fail labels", () => {
    expect(
      createGradeScaleSchema.safeParse({
        name: "Binary",
        type: "pass_fail",
      }).success,
    ).toBe(false);
    expect(
      createGradeScaleSchema.safeParse({
        name: "Binary",
        type: "pass_fail",
        passLabel: "Pass",
        failLabel: "Fail",
      }).success,
    ).toBe(true);
  });

  it("validates levels, metrics, and templates", () => {
    expect(
      createEvaluationLevelSchema.safeParse({
        name: "Intermediate",
        rank: 2,
      }).success,
    ).toBe(true);
    expect(
      createProgressMetricSchema.safeParse({
        name: "Attendance rate",
        kind: "core",
        unit: "%",
      }).success,
    ).toBe(true);
    expect(
      createEvaluationTemplateSchema.safeParse({
        name: "Math formative",
        domain: "Mathematics",
        scaleId: "esc_1",
      }).success,
    ).toBe(true);
  });

  it("parses progress metric ids and tabs", () => {
    expect(parseProgressMetricIds("epm_1, epm_2")).toEqual(["epm_1", "epm_2"]);
    expect(resolveEvaluationTab("scales")).toBe("scales");
    expect(resolveEvaluationTab("unknown")).toBe("templates");
  });
});
