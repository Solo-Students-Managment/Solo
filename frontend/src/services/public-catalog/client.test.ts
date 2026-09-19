import { describe, expect, it } from "vitest";
import {
  canJoinWaitlist,
  canRequestEnrollment,
  createMockPublicCatalogClient,
  seatsRemaining,
  type CatalogEntry,
} from "./client";
import { opaqueIdSchema } from "@/services/api";

function entry(overrides: Partial<CatalogEntry> = {}): CatalogEntry {
  return {
    id: opaqueIdSchema.parse("cat_1"),
    slug: "demo",
    title: "Demo",
    summary: null,
    subject: "Math",
    providerName: "Provider",
    providerSlug: "provider",
    seatsTotal: 10,
    seatsTaken: 5,
    status: "enrollment_open",
    waitlistEnabled: true,
    waitlistCount: 0,
    ...overrides,
  };
}

describe("public catalog enrollment rules", () => {
  it("allows enrollment when open with seats", () => {
    expect(canRequestEnrollment(entry())).toBe(true);
    expect(seatsRemaining(entry({ seatsTaken: 10 }))).toBe(0);
    expect(
      canRequestEnrollment(entry({ seatsTaken: 10, status: "full" })),
    ).toBe(false);
  });

  it("allows waitlist when full or closed with waitlist", () => {
    expect(canJoinWaitlist(entry({ status: "full", seatsTaken: 10 }))).toBe(
      true,
    );
    expect(
      canJoinWaitlist(
        entry({ status: "enrollment_closed", waitlistEnabled: false }),
      ),
    ).toBe(false);
  });

  it("creates enrollment and waitlist requests via mock client", async () => {
    const client = createMockPublicCatalogClient();
    const open = await client.getBySlug("algebra-foundations");
    const req = await client.requestEnrollment(open.id);
    expect(req.status).toBe("pending");
    const full = await client.getBySlug("english-conversation");
    const wait = await client.joinWaitlist(full.id);
    expect(wait.status).toBe("waitlisted");
  });
});
