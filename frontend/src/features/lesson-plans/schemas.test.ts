import { describe, expect, it } from "vitest";

import { createLessonPlanSchema, hasMeaningfulPlanBody } from "./schemas";

describe("lesson plan schemas", () => {
  it("requires title and body", () => {
    expect(
      createLessonPlanSchema.safeParse({
        title: "",
        bodyHtml: "<p>x</p>",
        visibility: "school",
      }).success,
    ).toBe(false);
  });

  it("detects meaningful body text", () => {
    expect(hasMeaningfulPlanBody("<p><br></p>")).toBe(false);
    expect(hasMeaningfulPlanBody("<p>Practice set</p>")).toBe(true);
  });
});
