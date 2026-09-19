import { describe, expect, it } from "vitest";
import { createMockMarketplaceModerationClient, isPending } from "./client";

describe("marketplace moderation", () => {
  it("approves pending queue items", async () => {
    const client = createMockMarketplaceModerationClient();
    const [item] = await client.listQueue();
    expect(isPending(item!)).toBe(true);
    const approved = await client.approve(item!.id);
    expect(approved.status).toBe("approved");
  });
});
