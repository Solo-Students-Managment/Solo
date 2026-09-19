import { z } from "zod";
import {
  apiRequest,
  moneySchema,
  opaqueIdSchema,
  SoloApiError,
} from "@/services/api";

export const trialModeSchema = z.enum(["online", "in_person", "hybrid"]);
export type TrialMode = z.infer<typeof trialModeSchema>;

export const trialSlotSchema = z.object({
  id: opaqueIdSchema,
  providerSlug: z.string().min(1),
  providerName: z.string().min(1),
  subject: z.string().min(1),
  startsAt: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  mode: trialModeSchema,
  capacity: z.number().int().positive(),
  bookedCount: z.number().int().nonnegative(),
  price: moneySchema,
});
export type TrialSlot = z.infer<typeof trialSlotSchema>;

export const trialBookingStatusSchema = z.enum([
  "confirmed",
  "cancelled",
  "completed",
  "no_show",
]);
export type TrialBookingStatus = z.infer<typeof trialBookingStatusSchema>;

export const trialBookingSchema = z.object({
  id: opaqueIdSchema,
  slotId: opaqueIdSchema,
  providerSlug: z.string().min(1),
  status: trialBookingStatusSchema,
  createdAt: z.string(),
});
export type TrialBooking = z.infer<typeof trialBookingSchema>;

export function seatsLeft(slot: TrialSlot): number {
  return Math.max(0, slot.capacity - slot.bookedCount);
}

export function canBookTrial(slot: TrialSlot): boolean {
  return seatsLeft(slot) > 0;
}

export type TrialBookingClient = {
  listSlots(filters?: {
    providerSlug?: string;
    subject?: string;
  }): Promise<TrialSlot[]>;
  getSlot(id: string): Promise<TrialSlot>;
  book(slotId: string): Promise<TrialBooking>;
  cancel(bookingId: string): Promise<TrialBooking>;
  listMyBookings(): Promise<TrialBooking[]>;
};

const SLOTS: TrialSlot[] = [
  trialSlotSchema.parse({
    id: "trial_slot_sara_1",
    providerSlug: "sara-english",
    providerName: "Sara English",
    subject: "English",
    startsAt: "2026-10-01T10:00:00.000Z",
    durationMinutes: 30,
    mode: "online",
    capacity: 1,
    bookedCount: 0,
    price: { amount: 0, currency: "IRR" },
  }),
  trialSlotSchema.parse({
    id: "trial_slot_reza_1",
    providerSlug: "reza-physics",
    providerName: "Reza Physics",
    subject: "Physics",
    startsAt: "2026-10-02T14:00:00.000Z",
    durationMinutes: 45,
    mode: "in_person",
    capacity: 2,
    bookedCount: 2,
    price: { amount: 0, currency: "IRR" },
  }),
];

export function createHttpTrialBookingClient(): TrialBookingClient {
  return {
    async listSlots(filters) {
      const params = new URLSearchParams();
      if (filters?.providerSlug)
        params.set("providerSlug", filters.providerSlug);
      if (filters?.subject) params.set("subject", filters.subject);
      const qs = params.toString();
      return apiRequest(`/public/trials${qs ? `?${qs}` : ""}`, {
        parse: (data) => z.array(trialSlotSchema).parse(data),
      });
    },
    async getSlot(id) {
      try {
        return await apiRequest(`/public/trials/${encodeURIComponent(id)}`, {
          parse: (data) => trialSlotSchema.parse(data),
        });
      } catch (error) {
        if (error instanceof SoloApiError) {
          throw new Error(error.apiError.code.toLowerCase());
        }
        throw error;
      }
    },
    async book(slotId) {
      return apiRequest("/marketplace/trial-bookings", {
        method: "POST",
        body: JSON.stringify({ slotId }),
        parse: (data) => trialBookingSchema.parse(data),
      });
    },
    async cancel(bookingId) {
      return apiRequest(
        `/marketplace/trial-bookings/${encodeURIComponent(bookingId)}/cancel`,
        {
          method: "POST",
          parse: (data) => trialBookingSchema.parse(data),
        },
      );
    },
    async listMyBookings() {
      return apiRequest("/marketplace/trial-bookings", {
        parse: (data) => z.array(trialBookingSchema).parse(data),
      });
    },
  };
}

export function createMockTrialBookingClient(): TrialBookingClient {
  const slots = new Map<string, TrialSlot>(
    SLOTS.map((s) => [String(s.id), { ...s, price: { ...s.price } }]),
  );
  const bookings = new Map<string, TrialBooking>();
  let seq = 1;

  return {
    async listSlots(filters) {
      return Array.from(slots.values()).filter((slot) => {
        if (filters?.providerSlug && slot.providerSlug !== filters.providerSlug)
          return false;
        if (filters?.subject && slot.subject !== filters.subject) return false;
        return true;
      });
    },
    async getSlot(id) {
      const slot = slots.get(id);
      if (!slot) throw new Error("not_found");
      return slot;
    },
    async book(slotId) {
      const slot = slots.get(slotId);
      if (!slot) throw new Error("not_found");
      if (!canBookTrial(slot)) throw new Error("slot_full");
      slot.bookedCount += 1;
      const row = trialBookingSchema.parse({
        id: `trial_book_${seq++}`,
        slotId: slot.id,
        providerSlug: slot.providerSlug,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      });
      bookings.set(row.id, row);
      return row;
    },
    async cancel(bookingId) {
      const row = bookings.get(bookingId);
      if (!row) throw new Error("not_found");
      if (row.status === "cancelled") return row;
      row.status = "cancelled";
      const slot = slots.get(row.slotId);
      if (slot && slot.bookedCount > 0) slot.bookedCount -= 1;
      return row;
    },
    async listMyBookings() {
      return Array.from(bookings.values());
    },
  };
}

let activeClient: TrialBookingClient = createMockTrialBookingClient();

export function setTrialBookingClient(client: TrialBookingClient): void {
  activeClient = client;
}

export function getTrialBookingClient(): TrialBookingClient {
  return activeClient;
}
