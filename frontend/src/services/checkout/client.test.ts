import { describe, expect, it } from "vitest";
import { createMockCheckoutClient } from "./client";

describe("checkout client", () => {
  it("creates and completes a mock checkout session", async () => {
    const client = createMockCheckoutClient();
    const providers = await client.listProviders("org_chk");
    expect(providers.some((p) => p.id === "mock")).toBe(true);
    const session = await client.createSession("org_chk", {
      provider: "mock",
    });
    expect(session.status).toBe("pending");
    const done = await client.completeSession("org_chk", session.id);
    expect(done.status).toBe("succeeded");
    const list = await client.listSessions("org_chk");
    expect(list[0]?.status).toBe("succeeded");
  });

  it("cancels a pending session", async () => {
    const client = createMockCheckoutClient();
    const session = await client.createSession("org_cancel", {
      provider: "stripe",
    });
    const cancelled = await client.cancelSession("org_cancel", session.id);
    expect(cancelled.status).toBe("cancelled");
  });
});
