import { describe, expect, it } from "vitest";
import { canPublish, createMockProductAuthoringClient } from "./client";

describe("product authoring", () => {
  it("publishes draft products and blocks invalid transitions", async () => {
    const client = createMockProductAuthoringClient();
    const [draft] = await client.listMine();
    expect(canPublish(draft!)).toBe(true);
    const published = await client.publish(draft!.id);
    expect(published.status).toBe("published");
    await expect(client.publish(published.id)).rejects.toThrow(
      "invalid_status",
    );
    const paused = await client.pause(published.id);
    expect(paused.status).toBe("paused");
  });
});
