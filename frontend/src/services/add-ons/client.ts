import { z } from "zod";
import { apiRequest, moneySchema, opaqueIdSchema } from "@/services/api";

export const addOnSchema = z.object({
  id: opaqueIdSchema,
  code: z.string().min(1),
  name: z.string().min(1),
  monthlyPrice: moneySchema,
  active: z.boolean(),
});
export type AddOn = z.infer<typeof addOnSchema>;

export const creditPackSchema = z.object({
  id: opaqueIdSchema,
  name: z.string().min(1),
  credits: z.number().int().positive(),
  price: moneySchema,
});
export type CreditPack = z.infer<typeof creditPackSchema>;

export const addOnsBundleSchema = z.object({
  organizationId: opaqueIdSchema,
  addOns: z.array(addOnSchema),
  creditPacks: z.array(creditPackSchema),
  overageOptIn: z.boolean(),
});
export type AddOnsBundle = z.infer<typeof addOnsBundleSchema>;

export type AddOnsClient = {
  get(organizationId: string): Promise<AddOnsBundle>;
  setOverageOptIn(
    organizationId: string,
    enabled: boolean,
  ): Promise<AddOnsBundle>;
  toggleAddOn(
    organizationId: string,
    addOnId: string,
    active: boolean,
  ): Promise<AddOn>;
};

const memory = new Map<string, AddOnsBundle>();

function seed(orgId: string): AddOnsBundle {
  return addOnsBundleSchema.parse({
    organizationId: orgId,
    overageOptIn: false,
    addOns: [
      {
        id: "addon_sms",
        code: "sms_pack",
        name: "SMS notifications",
        monthlyPrice: { amount: 990000, currency: "IRR" },
        active: false,
      },
      {
        id: "addon_storage",
        code: "extra_storage",
        name: "Extra storage",
        monthlyPrice: { amount: 490000, currency: "IRR" },
        active: false,
      },
    ],
    creditPacks: [
      {
        id: "cp_100",
        name: "100 SMS credits",
        credits: 100,
        price: { amount: 250000, currency: "IRR" },
      },
    ],
  });
}

export function createHttpAddOnsClient(): AddOnsClient {
  return {
    async get(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/add-ons`,
        { parse: (data) => addOnsBundleSchema.parse(data) },
      );
    },
    async setOverageOptIn(organizationId, enabled) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/add-ons/overage`,
        {
          method: "PATCH",
          body: JSON.stringify({ enabled }),
          parse: (data) => addOnsBundleSchema.parse(data),
        },
      );
    },
    async toggleAddOn(organizationId, addOnId, active) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/add-ons/${encodeURIComponent(addOnId)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ active }),
          parse: (data) => addOnSchema.parse(data),
        },
      );
    },
  };
}

export function createMockAddOnsClient(): AddOnsClient {
  return {
    async get(organizationId) {
      const bundle = memory.get(organizationId) ?? seed(organizationId);
      memory.set(organizationId, bundle);
      return bundle;
    },
    async setOverageOptIn(organizationId, enabled) {
      const current = memory.get(organizationId) ?? seed(organizationId);
      const next = { ...current, overageOptIn: enabled };
      memory.set(organizationId, next);
      return next;
    },
    async toggleAddOn(organizationId, addOnId, active) {
      const current = memory.get(organizationId) ?? seed(organizationId);
      const addOns = current.addOns.map((a) =>
        String(a.id) === addOnId ? { ...a, active } : a,
      );
      const addon = addOns.find((a) => String(a.id) === addOnId);
      if (!addon) throw new Error("not_found");
      memory.set(organizationId, { ...current, addOns });
      return addon;
    },
  };
}

let client: AddOnsClient = createMockAddOnsClient();
export function getAddOnsClient() {
  return client;
}
export function setAddOnsClient(next: AddOnsClient) {
  client = next;
}
