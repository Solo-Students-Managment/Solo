import { describe, expect, it } from "vitest";
import { createMockArticlesFeedClient } from "./client";

describe("articles feed", () => {
  it("loads article and toggles bookmark", async () => {
    const client = createMockArticlesFeedClient();
    const list = await client.list();
    expect(list.length).toBeGreaterThan(0);
    const detail = await client.getBySlug("study-tips-2026");
    expect(detail.title).toBe("Study Tips for 2026");
    const bm = await client.toggleBookmark(String(detail.id));
    expect(bm.bookmarked).toBe(true);
    const comment = await client.addComment(
      String(detail.id),
      "Great article!",
    );
    expect(comment.body).toBe("Great article!");
  });
});
