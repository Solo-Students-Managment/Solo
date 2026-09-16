import { describe, expect, it } from "vitest";
import { createMockAuditClient } from "./client";

describe("audit", () => {
  it("lists immutable entries and filters by org", async () => {
    const client = createMockAuditClient();
    const all = await client.list({});
    expect(all.length).toBeGreaterThan(0);
    const org = await client.list({ organizationId: "org_demo" });
    expect(org.every((e) => e.organizationId === "org_demo")).toBe(true);
  });
});
