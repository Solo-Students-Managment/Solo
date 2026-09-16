import { describe, expect, it } from "vitest";
import { createMockManualBillingClient, nextStatusOnEscalate } from "./client";

describe("manual billing", () => {
  it("escalates dunning toward written_off", () => {
    expect(nextStatusOnEscalate("sent", 0)).toEqual({
      status: "overdue",
      dunningLevel: 1,
    });
    expect(nextStatusOnEscalate("overdue", 2)).toEqual({
      status: "written_off",
      dunningLevel: 3,
    });
  });

  it("creates sends escalates and pays invoice", async () => {
    const client = createMockManualBillingClient();
    const orgId = `org_mb_${Date.now()}`;
    const draft = await client.create(orgId, {
      amount: 1_000_000,
      currency: "IRR",
    });
    expect(draft.status).toBe("draft");
    const sent = await client.send(orgId, draft.id);
    expect(sent.status).toBe("sent");
    const overdue = await client.escalate(orgId, draft.id);
    expect(overdue.status).toBe("overdue");
    const paid = await client.markPaid(orgId, draft.id);
    expect(paid.status).toBe("paid");
  });
});
