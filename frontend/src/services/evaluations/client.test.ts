import { describe, expect, it } from "vitest";

import { isScoreWithinScale, scaleBoundsForType } from "@/services/evaluations";

describe("evaluation scale helpers", () => {
  it("returns bounds for preset types", () => {
    expect(scaleBoundsForType("out_of_20")).toEqual({
      minValue: 0,
      maxValue: 20,
    });
    expect(scaleBoundsForType("pass_fail")).toEqual({
      minValue: null,
      maxValue: null,
    });
  });

  it("checks numeric scores against scale bounds", () => {
    expect(
      isScoreWithinScale(
        { type: "out_of_100", minValue: 0, maxValue: 100 },
        85,
      ),
    ).toBe(true);
    expect(
      isScoreWithinScale({ type: "out_of_20", minValue: 0, maxValue: 20 }, 21),
    ).toBe(false);
    expect(
      isScoreWithinScale(
        { type: "pass_fail", minValue: null, maxValue: null },
        1,
      ),
    ).toBe(false);
  });
});
