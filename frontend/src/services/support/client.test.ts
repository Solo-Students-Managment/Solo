import { describe, expect, it } from "vitest";
import { createMockSupportClient } from "./client";

describe("support", () => {
  it("opens ticket and enters timed support mode", async () => {
    const client = createMockSupportClient();
    const ticket = await client.openTicket({ subject: "Billing help" });
    expect(ticket.status).toBe("open");
    const mode = await client.enterSupportMode({
      targetOrgId: "org_1",
      minutes: 30,
    });
    expect(mode.active).toBe(true);
    expect(mode.expiresAt).toBeTruthy();
  });
});
