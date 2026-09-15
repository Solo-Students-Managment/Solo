import { describe, expect, it } from "vitest";

import { createBankQuestionSchema, hasMeaningfulPrompt } from "./schemas";

describe("question bank schemas", () => {
  it("accepts mcq authoring payload", () => {
    expect(
      createBankQuestionSchema.safeParse({
        promptHtml: "<p>What is 2+2?</p>",
        type: "mcq",
        visibility: "school",
        tags: "math, basics",
      }).success,
    ).toBe(true);
  });

  it("rejects empty prompt html", () => {
    expect(
      createBankQuestionSchema.safeParse({
        promptHtml: "",
        type: "essay",
        visibility: "private",
      }).success,
    ).toBe(false);
  });

  it("detects meaningful prompt text", () => {
    expect(hasMeaningfulPrompt("<p></p>")).toBe(false);
    expect(hasMeaningfulPrompt("<p>Hello</p>")).toBe(true);
  });
});
