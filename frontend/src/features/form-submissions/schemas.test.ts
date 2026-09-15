import { describe, expect, it } from "vitest";
import { submissionCommentSchema } from "./schemas";

describe("submissionCommentSchema", () => {
  it("requires a comment", () => {
    expect(submissionCommentSchema.safeParse({ comment: "" }).success).toBe(
      false,
    );
    expect(
      submissionCommentSchema.safeParse({ comment: "Looks good" }).success,
    ).toBe(true);
  });
});
