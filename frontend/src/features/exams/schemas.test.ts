import { describe, expect, it } from "vitest";

import {
  createExamSchema,
  parseTimeLimitMinutes,
  recordSignalSchema,
  startAttemptSchema,
} from "./schemas";

describe("exam builder schemas", () => {
  it("accepts exam builder policy payload", () => {
    expect(
      createExamSchema.safeParse({
        title: "Midterm",
        poolSize: 20,
        randomize: "yes",
        maxAttempts: 2,
        timeLimitMinutes: "45",
      }).success,
    ).toBe(true);
  });

  it("parses optional time limits and attempt forms", () => {
    expect(parseTimeLimitMinutes("45")).toBe(45);
    expect(parseTimeLimitMinutes("")).toBeNull();
    expect(
      startAttemptSchema.safeParse({
        examTitle: "Midterm",
        studentDisplayName: "Sara",
      }).success,
    ).toBe(true);
    expect(
      recordSignalSchema.safeParse({
        attemptId: "exa_1",
        signal: "tab_blur",
      }).success,
    ).toBe(true);
  });
});
