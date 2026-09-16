import { describe, expect, it } from "vitest";
import { createMockCancellationClient } from "./client";

describe("cancellation", () => {
  it("requests cancel then refund and accepts retention", async () => {
    const client = createMockCancellationClient();
    const orgId = `org_cancel_${Date.now()}`;
    const pending = await client.requestCancel(orgId, {
      reason: "too expensive",
    });
    expect(pending.state.status).toBe("pending_cancel");
    const refund = await client.requestRefund(orgId);
    expect(refund.state.refundRequested).toBe(true);
    const offerId = refund.offers[0]?.id;
    expect(offerId).toBeTruthy();
    const kept = await client.acceptOffer(orgId, offerId!);
    expect(kept.state.status).toBe("active");
    expect(kept.state.acceptedOfferId).toBe(offerId);
  });
});
