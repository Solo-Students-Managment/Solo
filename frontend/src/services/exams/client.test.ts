import { describe, expect, it } from "vitest";

import { canStartAttempt, isExamPublishable, suggestPlacement } from "./client";

describe("exam helpers", () => {
  it("allows publishing draft exams with a pool", () => {
    expect(isExamPublishable({ status: "draft", poolSize: 5 })).toBe(true);
    expect(isExamPublishable({ status: "published", poolSize: 5 })).toBe(false);
  });

  it("gates attempt starts by publish state and limit", () => {
    expect(canStartAttempt({ status: "published", maxAttempts: 2 }, 1)).toBe(
      true,
    );
    expect(canStartAttempt({ status: "draft", maxAttempts: 2 }, 0)).toBe(false);
    expect(canStartAttempt({ status: "published", maxAttempts: 1 }, 1)).toBe(
      false,
    );
  });

  it("suggests placement bands from score", () => {
    expect(suggestPlacement(90)).toBe("advanced");
    expect(suggestPlacement(75)).toBe("intermediate");
    expect(suggestPlacement(40)).toBe("foundational");
  });
});
