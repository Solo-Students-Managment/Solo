import { describe, expect, it } from "vitest";
import { createMockPrivacyClient } from "./client";
describe("privacy", () => {
  it("submits and completes export request", async () => {
    const c = createMockPrivacyClient();
    const row = await c.submit({
      type: "export",
      subjectEmail: "user@example.com",
    });
    expect(row.status).toBe("submitted");
    expect((await c.complete(row.id)).status).toBe("completed");
  });
});
