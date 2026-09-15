import { describe, expect, it } from "vitest";
import {
  buildConsentSnapshot,
  canDecideSubmission,
  isValidPublicSlug,
} from "./client";

describe("forms helpers", () => {
  it("validates public slugs", () => {
    expect(isValidPublicSlug("parent-survey")).toBe(true);
    expect(isValidPublicSlug("Bad Slug")).toBe(false);
  });

  it("builds consent snapshot text", () => {
    expect(
      buildConsentSnapshot({
        title: "Feedback",
        questionText: "How was class?",
      }),
    ).toBe("Feedback — How was class?");
  });

  it("only pending submissions can be decided", () => {
    expect(canDecideSubmission("pending")).toBe(true);
    expect(canDecideSubmission("approved")).toBe(false);
  });
});
