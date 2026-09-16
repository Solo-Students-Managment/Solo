import { describe, expect, it } from "vitest";
import { createMockApiKeysClient } from "./client";
describe("api keys", () => {
  it("creates secret once and revokes", async () => {
    const c = createMockApiKeysClient();
    const created = await c.create("org_keys", { name: "CI" });
    expect(created.secret).toContain("sk_live_");
    const revoked = await c.revoke("org_keys", created.id);
    expect(revoked.revokedAt).toBeTruthy();
  });
});
