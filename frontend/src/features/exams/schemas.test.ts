import { describe, expect, it } from "vitest";

import { gradeAttemptSchema, regradeAttemptSchema } from "./schemas";

describe("exam grading schemas", () => {
  it("accepts valid grade payloads", () => {
    const parsed = gradeAttemptSchema.parse({
      attemptId: "exa_abc",
      score: "88",
      rubricNotes: "Clear reasoning",
      placementRecommendation: "",
      humanOverride: "no",
    });
    expect(parsed.score).toBe(88);
    expect(parsed.humanOverride).toBe("no");
  });

  it("rejects out-of-range scores", () => {
    const result = gradeAttemptSchema.safeParse({
      attemptId: "exa_abc",
      score: 120,
      rubricNotes: "notes",
      humanOverride: "no",
    });
    expect(result.success).toBe(false);
  });

  it("requires grade id for regrade", () => {
    const result = regradeAttemptSchema.safeParse({
      gradeId: "",
      attemptId: "exa_abc",
      score: 70,
      rubricNotes: "notes",
      humanOverride: "yes",
    });
    expect(result.success).toBe(false);
  });
});
