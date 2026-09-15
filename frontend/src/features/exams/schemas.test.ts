import { describe, expect, it } from "vitest";

import { createExamSchema, parseTimeLimitMinutes } from "./schemas";

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

  it("parses optional time limits", () => {
    expect(parseTimeLimitMinutes("45")).toBe(45);
    expect(parseTimeLimitMinutes("")).toBeNull();
  });
});
