import { describe, expect, it } from "vitest";
import { createMockOrgLifecycleClient } from "./client";
describe("org lifecycle", () => {
  it("archives and transfers ownership", async () => {
    const c = createMockOrgLifecycleClient();
    const orgId = `org_lc_${Date.now()}`;
    const archived = await c.archive(orgId);
    expect(archived.state).toBe("archived");
    const transferred = await c.transferOwnership(orgId, "usr_new");
    expect(transferred.ownerUserId).toBe("usr_new");
  });
});
