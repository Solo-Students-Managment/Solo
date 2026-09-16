import { describe, expect, it } from "vitest";
import { createMockStorageAdminClient } from "./client";
describe("storage admin", () => {
  it("quarantines a file", async () => {
    const c = createMockStorageAdminClient();
    const file = (await c.listFiles())[0]!;
    const q = await c.quarantine(file.id);
    expect(q.quarantined).toBe(true);
    expect((await c.getQuota()).quarantinedFiles).toBeGreaterThan(0);
  });
});
