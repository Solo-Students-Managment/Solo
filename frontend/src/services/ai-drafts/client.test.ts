import { describe, expect, it } from "vitest";
import { createMockAiDraftsClient, canApprove } from "./client";

describe("ai drafts", () => {
  it("canApprove allows reviewable statuses", () => {
    expect(canApprove({ status: "pending_review" } as never)).toBe(true);
    expect(canApprove({ status: "approved" } as never)).toBe(false);
  });
  it("creates draft without auto-publish", async () => {
    const client = createMockAiDraftsClient();
    const row = await client.create({
      type: "feedback",
      title: "T",
      content: "C",
    });
    expect(row.status).toBe("draft");
  });
});
