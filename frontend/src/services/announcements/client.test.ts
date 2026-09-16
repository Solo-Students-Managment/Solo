import { describe, expect, it } from "vitest";
import { createMockAnnouncementsClient } from "./client";
describe("announcements", () => {
  it("creates and publishes", async () => {
    const c = createMockAnnouncementsClient();
    const draft = await c.create({ title: "Maintenance", body: "Tonight" });
    expect(draft.status).toBe("draft");
    const pub = await c.publish(draft.id);
    expect(pub.status).toBe("published");
  });
});
