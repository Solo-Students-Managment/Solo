import { describe, expect, it } from "vitest";

import { parseQuestionTags, stripHtml } from "./client";

describe("question bank helpers", () => {
  it("strips html and parses tags", () => {
    expect(stripHtml("<p>Hello <strong>world</strong></p>")).toBe(
      "Hello world",
    );
    expect(parseQuestionTags("math, algebra")).toEqual(["math", "algebra"]);
  });
});
