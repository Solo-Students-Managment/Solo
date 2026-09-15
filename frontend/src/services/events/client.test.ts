import { describe, expect, it } from "vitest";
import {
  canRsvp,
  createMockEventsClient,
  orgEventSchema,
  __resetMockEvents,
} from "./client";

describe("canRsvp", () => {
  it("allows RSVP under capacity and waitlist when full", () => {
    const base = orgEventSchema.parse({
      id: "evt_1",
      organizationId: "org_1",
      title: "Open day",
      startsAt: "2026-10-01T10:00:00.000Z",
      capacity: 2,
      rsvpCount: 2,
      checkedInCount: 0,
      waitlistEnabled: false,
    });
    expect(canRsvp({ ...base, rsvpCount: 1 })).toBe(true);
    expect(canRsvp(base)).toBe(false);
    expect(canRsvp({ ...base, waitlistEnabled: true })).toBe(true);
  });
});

describe("events client", () => {
  it("creates event, RSVPs, and checks in", async () => {
    __resetMockEvents();
    const client = createMockEventsClient();
    const event = await client.create("org_1", {
      title: "Parent night",
      startsAt: "2026-10-01T18:00:00.000Z",
      capacity: 50,
      waitlistEnabled: true,
    });
    const rsvp = await client.rsvp("org_1", String(event.id));
    expect(rsvp.rsvpCount).toBe(1);
    const checkedIn = await client.checkIn("org_1", String(event.id));
    expect(checkedIn.checkedInCount).toBe(1);
  });
});
