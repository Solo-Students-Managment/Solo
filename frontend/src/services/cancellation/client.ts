import { z } from "zod";
import { apiRequest, moneySchema, opaqueIdSchema } from "@/services/api";

export const cancellationStatusSchema = z.enum([
  "active",
  "pending_cancel",
  "cancelled",
]);
export type CancellationStatus = z.infer<typeof cancellationStatusSchema>;

export const retentionOfferSchema = z.object({
  id: opaqueIdSchema,
  title: z.string().min(1),
  percentOff: z.number().int().min(1).max(100),
  expiresAt: z.string().min(1),
});
export type RetentionOffer = z.infer<typeof retentionOfferSchema>;

export const cancellationStateSchema = z.object({
  organizationId: opaqueIdSchema,
  status: cancellationStatusSchema,
  reason: z.string().nullable(),
  refundRequested: z.boolean(),
  refundAmount: moneySchema.nullable(),
  acceptedOfferId: opaqueIdSchema.nullable(),
  effectiveAt: z.string().nullable(),
  updatedAt: z.string().min(1),
});
export type CancellationState = z.infer<typeof cancellationStateSchema>;

export const cancellationSnapshotSchema = z.object({
  state: cancellationStateSchema,
  offers: z.array(retentionOfferSchema),
});
export type CancellationSnapshot = z.infer<typeof cancellationSnapshotSchema>;

export type CancellationClient = {
  get(organizationId: string): Promise<CancellationSnapshot>;
  requestCancel(
    organizationId: string,
    input: { reason: string },
  ): Promise<CancellationSnapshot>;
  requestRefund(organizationId: string): Promise<CancellationSnapshot>;
  acceptOffer(
    organizationId: string,
    offerId: string,
  ): Promise<CancellationSnapshot>;
};

const memory = new Map<string, CancellationSnapshot>();

function seed(organizationId: string): CancellationSnapshot {
  const existing = memory.get(organizationId);
  if (existing) return existing;
  const snapshot = cancellationSnapshotSchema.parse({
    state: {
      organizationId,
      status: "active",
      reason: null,
      refundRequested: false,
      refundAmount: null,
      acceptedOfferId: null,
      effectiveAt: null,
      updatedAt: new Date().toISOString(),
    },
    offers: [
      {
        id: `ret_${organizationId}_20`,
        title: "Stay 3 months · 20% off",
        percentOff: 20,
        expiresAt: new Date(Date.now() + 14 * 86_400_000).toISOString(),
      },
      {
        id: `ret_${organizationId}_10`,
        title: "Pause billing · 10% off next cycle",
        percentOff: 10,
        expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      },
    ],
  });
  memory.set(organizationId, snapshot);
  return snapshot;
}

export function createHttpCancellationClient(): CancellationClient {
  return {
    async get(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/cancellation`,
        { parse: (data) => cancellationSnapshotSchema.parse(data) },
      );
    },
    async requestCancel(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/cancellation/request`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => cancellationSnapshotSchema.parse(data),
        },
      );
    },
    async requestRefund(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/cancellation/refund`,
        {
          method: "POST",
          parse: (data) => cancellationSnapshotSchema.parse(data),
        },
      );
    },
    async acceptOffer(organizationId, offerId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/cancellation/offers/${encodeURIComponent(offerId)}/accept`,
        {
          method: "POST",
          parse: (data) => cancellationSnapshotSchema.parse(data),
        },
      );
    },
  };
}

export function createMockCancellationClient(): CancellationClient {
  return {
    async get(organizationId) {
      return seed(organizationId);
    },
    async requestCancel(organizationId, input) {
      const snap = seed(organizationId);
      if (snap.state.status === "cancelled") {
        throw new Error("already_cancelled");
      }
      const next = cancellationSnapshotSchema.parse({
        ...snap,
        state: {
          ...snap.state,
          status: "pending_cancel",
          reason: input.reason.trim() || "unspecified",
          effectiveAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      memory.set(organizationId, next);
      return next;
    },
    async requestRefund(organizationId) {
      const snap = seed(organizationId);
      if (snap.state.status === "active") {
        throw new Error("cancel_required");
      }
      const next = cancellationSnapshotSchema.parse({
        ...snap,
        state: {
          ...snap.state,
          refundRequested: true,
          refundAmount: { amount: 500_000, currency: "IRR" },
          updatedAt: new Date().toISOString(),
        },
      });
      memory.set(organizationId, next);
      return next;
    },
    async acceptOffer(organizationId, offerId) {
      const snap = seed(organizationId);
      const offer = snap.offers.find((o) => o.id === offerId);
      if (!offer) throw new Error("offer_not_found");
      const next = cancellationSnapshotSchema.parse({
        ...snap,
        state: {
          ...snap.state,
          status: "active",
          reason: null,
          refundRequested: false,
          refundAmount: null,
          acceptedOfferId: offerId,
          effectiveAt: null,
          updatedAt: new Date().toISOString(),
        },
        offers: snap.offers.filter((o) => o.id !== offerId),
      });
      memory.set(organizationId, next);
      return next;
    },
  };
}

let client: CancellationClient = createMockCancellationClient();
export function getCancellationClient() {
  return client;
}
export function setCancellationClient(next: CancellationClient) {
  client = next;
}
