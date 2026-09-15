import { describe, expect, it } from "vitest";

import { isExamPublishable } from "./client";

describe("exam helpers", () => {
  it("allows publishing draft exams with a pool", () => {
    expect(isExamPublishable({ status: "draft", poolSize: 5 })).toBe(true);
    expect(isExamPublishable({ status: "published", poolSize: 5 })).toBe(false);
  });
});
