import { describe, expect, it } from "vitest";
import { createMockPlanVersionsClient } from "./client";

describe("plan versions", () => {
  it("starts migration and enrolls grandfathered org", async () => {
    const client = createMockPlanVersionsClient();
    const orgId = `org_pv_${Date.now()}`;
    const snap = await client.get(orgId);
    const from = snap.versions.find((v) => v.grandfathered)!;
    const to = snap.versions.find((v) => !v.grandfathered)!;
    const started = await client.startMigration(orgId, {
      fromVersionId: from.id,
      toVersionId: to.id,
    });
    expect(started.campaigns[0]?.status).toBe("running");
    const enrolled = await client.enroll(orgId, started.campaigns[0]!.id);
    expect(enrolled.currentVersionId).toBe(to.id);
    expect(enrolled.campaigns[0]?.status).toBe("completed");
  });
});
