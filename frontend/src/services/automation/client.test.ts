import { describe, expect, it } from "vitest";
import {
  createMockAutomationClient,
  requiresApprovalGate,
  __resetMockAutomation,
} from "./client";

describe("requiresApprovalGate", () => {
  it("returns true only for high risk", () => {
    expect(requiresApprovalGate("low")).toBe(false);
    expect(requiresApprovalGate("medium")).toBe(false);
    expect(requiresApprovalGate("high")).toBe(true);
  });
});

describe("automation client activate", () => {
  it("blocks high-risk activation without approval", async () => {
    __resetMockAutomation();
    const client = createMockAutomationClient();
    const row = await client.create("org_1", {
      name: "Risky flow",
      triggerType: "webhook",
      riskLevel: "high",
      stepsSummary: "Notify admin",
    });
    await expect(
      client.activate("org_1", String(row.id), { approvalGranted: false }),
    ).rejects.toThrow("approval required");
    const activated = await client.activate("org_1", String(row.id), {
      approvalGranted: true,
    });
    expect(activated.status).toBe("active");
  });

  it("activates low-risk rules without approval", async () => {
    __resetMockAutomation();
    const client = createMockAutomationClient();
    const row = await client.create("org_1", {
      name: "Welcome email",
      triggerType: "enrollment_created",
      riskLevel: "low",
      stepsSummary: "Send welcome",
    });
    const activated = await client.activate("org_1", String(row.id));
    expect(activated.status).toBe("active");
  });
});
