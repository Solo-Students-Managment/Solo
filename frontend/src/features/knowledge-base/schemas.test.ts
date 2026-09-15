import { describe, expect, it } from "vitest";
import { createKbArticleSchema } from "./schemas";

describe("createKbArticleSchema", () => {
  it("rejects empty rich text body", () => {
    const result = createKbArticleSchema.safeParse({
      title: "Guide",
      spaceName: "Ops",
      bodyHtml: "<p></p>",
      tags: "onboarding",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid draft article", () => {
    const result = createKbArticleSchema.safeParse({
      title: "Guide",
      spaceName: "Ops",
      bodyHtml: "<p>Welcome checklist</p>",
      tags: "onboarding",
    });
    expect(result.success).toBe(true);
  });
});
