import { z } from "zod";
import { apiRequest, moneySchema, opaqueIdSchema } from "@/services/api";

export const paymentProviderSchema = z.enum(["mock", "stripe", "zarinpal"]);
export type PaymentProvider = z.infer<typeof paymentProviderSchema>;

export const checkoutSessionStatusSchema = z.enum([
  "pending",
  "processing",
  "succeeded",
  "failed",
  "cancelled",
]);
export type CheckoutSessionStatus = z.infer<typeof checkoutSessionStatusSchema>;

export const checkoutProviderSchema = z.object({
  id: paymentProviderSchema,
  label: z.string().min(1),
  available: z.boolean(),
});
export type CheckoutProvider = z.infer<typeof checkoutProviderSchema>;

export const checkoutSessionSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  provider: paymentProviderSchema,
  amount: moneySchema,
  status: checkoutSessionStatusSchema,
  createdAt: z.string().min(1),
  completedAt: z.string().nullable(),
});
export type CheckoutSession = z.infer<typeof checkoutSessionSchema>;

export type CheckoutClient = {
  listProviders(organizationId: string): Promise<CheckoutProvider[]>;
  createSession(
    organizationId: string,
    input: { provider: PaymentProvider; amount?: number },
  ): Promise<CheckoutSession>;
  completeSession(
    organizationId: string,
    sessionId: string,
  ): Promise<CheckoutSession>;
  cancelSession(
    organizationId: string,
    sessionId: string,
  ): Promise<CheckoutSession>;
  listSessions(organizationId: string): Promise<CheckoutSession[]>;
};

const sessions = new Map<string, CheckoutSession[]>();

function defaultProviders(): CheckoutProvider[] {
  return [
    { id: "mock", label: "Mock gateway", available: true },
    { id: "stripe", label: "Stripe", available: true },
    { id: "zarinpal", label: "Zarinpal", available: true },
  ];
}

function seedAmount(currency: "IRR" | "USD" = "IRR") {
  return { amount: currency === "IRR" ? 2_900_000 : 29, currency };
}

export function createHttpCheckoutClient(): CheckoutClient {
  return {
    async listProviders(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/checkout/providers`,
        { parse: (data) => z.array(checkoutProviderSchema).parse(data) },
      );
    },
    async createSession(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/checkout/sessions`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => checkoutSessionSchema.parse(data),
        },
      );
    },
    async completeSession(organizationId, sessionId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/checkout/sessions/${encodeURIComponent(sessionId)}/complete`,
        {
          method: "POST",
          parse: (data) => checkoutSessionSchema.parse(data),
        },
      );
    },
    async cancelSession(organizationId, sessionId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/checkout/sessions/${encodeURIComponent(sessionId)}/cancel`,
        {
          method: "POST",
          parse: (data) => checkoutSessionSchema.parse(data),
        },
      );
    },
    async listSessions(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/checkout/sessions`,
        { parse: (data) => z.array(checkoutSessionSchema).parse(data) },
      );
    },
  };
}

export function createMockCheckoutClient(): CheckoutClient {
  return {
    async listProviders() {
      return defaultProviders();
    },
    async createSession(organizationId, input) {
      const money = seedAmount();
      const session = checkoutSessionSchema.parse({
        id: `chk_${organizationId}_${Date.now()}`,
        organizationId,
        provider: input.provider,
        amount: {
          amount: input.amount ?? money.amount,
          currency: money.currency,
        },
        status: "pending",
        createdAt: new Date().toISOString(),
        completedAt: null,
      });
      const list = sessions.get(organizationId) ?? [];
      list.unshift(session);
      sessions.set(organizationId, list);
      return session;
    },
    async completeSession(organizationId, sessionId) {
      const list = sessions.get(organizationId) ?? [];
      const idx = list.findIndex((s) => s.id === sessionId);
      if (idx < 0) throw new Error("session_not_found");
      const next = checkoutSessionSchema.parse({
        ...list[idx],
        status: "succeeded",
        completedAt: new Date().toISOString(),
      });
      list[idx] = next;
      sessions.set(organizationId, list);
      return next;
    },
    async cancelSession(organizationId, sessionId) {
      const list = sessions.get(organizationId) ?? [];
      const idx = list.findIndex((s) => s.id === sessionId);
      if (idx < 0) throw new Error("session_not_found");
      const next = checkoutSessionSchema.parse({
        ...list[idx],
        status: "cancelled",
        completedAt: new Date().toISOString(),
      });
      list[idx] = next;
      sessions.set(organizationId, list);
      return next;
    },
    async listSessions(organizationId) {
      return sessions.get(organizationId) ?? [];
    },
  };
}

let client: CheckoutClient = createMockCheckoutClient();
export function getCheckoutClient() {
  return client;
}
export function setCheckoutClient(next: CheckoutClient) {
  client = next;
}
