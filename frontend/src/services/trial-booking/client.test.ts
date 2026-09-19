import { describe, expect, it } from "vitest";
import { opaqueIdSchema } from "@/services/api";
import {
  canBookTrial,
  createMockTrialBookingClient,
  seatsLeft,
  type TrialSlot,
} from "./client";

const slot = (overrides: Partial<TrialSlot> = {}): TrialSlot => ({
  id: opaqueIdSchema.parse("trial_1"),
  providerSlug: "sara-english",
  providerName: "Sara English",
  subject: "English",
  startsAt: "2026-10-01T10:00:00.000Z",
  durationMinutes: 30,
  mode: "online",
  capacity: 1,
  bookedCount: 0,
  price: { amount: 0, currency: "IRR" },
  ...overrides,
});

describe("trial booking", () => {
  it("blocks booking when capacity is full", () => {
    expect(canBookTrial(slot())).toBe(true);
    expect(seatsLeft(slot({ bookedCount: 1 }))).toBe(0);
    expect(canBookTrial(slot({ bookedCount: 1 }))).toBe(false);
  });

  it("books and cancels through mock client", async () => {
    const client = createMockTrialBookingClient();
    const open = (await client.listSlots({ providerSlug: "sara-english" }))[0]!;
    const booking = await client.book(open.id);
    expect(booking.status).toBe("confirmed");
    const cancelled = await client.cancel(booking.id);
    expect(cancelled.status).toBe("cancelled");
    await expect(client.book("trial_slot_reza_1")).rejects.toThrow("slot_full");
  });
});
