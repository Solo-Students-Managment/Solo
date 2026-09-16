import { describe, expect, it } from "vitest";
import { createMockIncidentsClient } from "./client";
describe("incidents", () => {
  it("creates and resolves incident", async () => {
    const c = createMockIncidentsClient();
    const row = await c.create({ title: "API latency", severity: "high" });
    expect(row.status).toBe("investigating");
    const done = await c.updateStatus(row.id, "resolved");
    expect(done.status).toBe("resolved");
  });
});
