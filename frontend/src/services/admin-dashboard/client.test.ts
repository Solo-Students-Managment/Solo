import { describe, expect, it } from "vitest";
import { createMockAdminDashboardClient } from "./client";

describe("admin dashboard", () => {
  it("returns platform KPIs", async () => {
    const kpis = await createMockAdminDashboardClient().getKpis();
    expect(kpis.organizations).toBeGreaterThan(0);
    expect(kpis.openTickets).toBeGreaterThanOrEqual(0);
  });
});
