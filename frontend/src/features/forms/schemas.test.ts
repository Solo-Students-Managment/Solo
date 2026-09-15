import { describe, expect, it } from "vitest";
import { createSurveyFormSchema, publicSubmitSchema } from "./schemas";

describe("forms schemas", () => {
  it("requires a valid slug", () => {
    expect(
      createSurveyFormSchema.safeParse({
        title: "Survey",
        description: "Desc",
        questionText: "Q?",
        slug: "Bad Slug",
      }).success,
    ).toBe(false);
  });

  it("requires consent acceptance on public submit", () => {
    expect(
      publicSubmitSchema.safeParse({
        answerText: "Great",
        consentName: "Ada",
        consentAccepted: false,
      }).success,
    ).toBe(false);
    expect(
      publicSubmitSchema.safeParse({
        answerText: "Great",
        consentName: "Ada",
        consentAccepted: true,
      }).success,
    ).toBe(true);
  });
});
