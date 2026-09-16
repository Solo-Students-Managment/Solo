import { z } from "zod";
import { apiRequest, moneySchema, opaqueIdSchema } from "@/services/api";

export const dunningStatusSchema = z.enum([
  "draft",
  "sent",
  "overdue",
  "paid",
  "written_off",
]);
export type DunningStatus = z.infer<typeof dunningStatusSchema>;

export const manualInvoiceSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  number: z.string().min(1),
  amount: moneySchema,
  status: dunningStatusSchema,
  dueAt: z.string().min(1),
  issuedAt: z.string().min(1),
  dunningLevel: z.number().int().min(0).max(3),
});
export type ManualInvoice = z.infer<typeof manualInvoiceSchema>;

export type ManualBillingClient = {
  list(organizationId: string): Promise<ManualInvoice[]>;
  create(
    organizationId: string,
    input: { amount: number; currency: "IRR" | "USD"; dueDays?: number },
  ): Promise<ManualInvoice>;
  send(organizationId: string, invoiceId: string): Promise<ManualInvoice>;
  escalate(organizationId: string, invoiceId: string): Promise<ManualInvoice>;
  markPaid(organizationId: string, invoiceId: string): Promise<ManualInvoice>;
};

const memory = new Map<string, ManualInvoice[]>();

function nextStatusOnEscalate(
  status: DunningStatus,
  level: number,
): {
  status: DunningStatus;
  dunningLevel: number;
} {
  if (status === "paid" || status === "written_off") {
    return { status, dunningLevel: level };
  }
  const dunningLevel = Math.min(3, level + 1);
  if (dunningLevel >= 3) return { status: "written_off", dunningLevel };
  return { status: "overdue", dunningLevel };
}

export function createHttpManualBillingClient(): ManualBillingClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/manual-billing`,
        { parse: (data) => z.array(manualInvoiceSchema).parse(data) },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/manual-billing`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => manualInvoiceSchema.parse(data),
        },
      );
    },
    async send(organizationId, invoiceId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/manual-billing/${encodeURIComponent(invoiceId)}/send`,
        {
          method: "POST",
          parse: (data) => manualInvoiceSchema.parse(data),
        },
      );
    },
    async escalate(organizationId, invoiceId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/manual-billing/${encodeURIComponent(invoiceId)}/escalate`,
        {
          method: "POST",
          parse: (data) => manualInvoiceSchema.parse(data),
        },
      );
    },
    async markPaid(organizationId, invoiceId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/manual-billing/${encodeURIComponent(invoiceId)}/pay`,
        {
          method: "POST",
          parse: (data) => manualInvoiceSchema.parse(data),
        },
      );
    },
  };
}

export function createMockManualBillingClient(): ManualBillingClient {
  return {
    async list(organizationId) {
      return memory.get(organizationId) ?? [];
    },
    async create(organizationId, input) {
      const dueDays = input.dueDays ?? 14;
      const row = manualInvoiceSchema.parse({
        id: `minv_${organizationId}_${Date.now()}`,
        organizationId,
        number: `MB-${Date.now()}`,
        amount: { amount: input.amount, currency: input.currency },
        status: "draft",
        dueAt: new Date(Date.now() + dueDays * 86_400_000).toISOString(),
        issuedAt: new Date().toISOString(),
        dunningLevel: 0,
      });
      memory.set(organizationId, [row, ...(memory.get(organizationId) ?? [])]);
      return row;
    },
    async send(organizationId, invoiceId) {
      const list = memory.get(organizationId) ?? [];
      const idx = list.findIndex((r) => r.id === invoiceId);
      if (idx < 0) throw new Error("invoice_not_found");
      const next = manualInvoiceSchema.parse({
        ...list[idx],
        status: "sent",
      });
      list[idx] = next;
      memory.set(organizationId, list);
      return next;
    },
    async escalate(organizationId, invoiceId) {
      const list = memory.get(organizationId) ?? [];
      const idx = list.findIndex((r) => r.id === invoiceId);
      if (idx < 0) throw new Error("invoice_not_found");
      const current = list[idx]!;
      const { status, dunningLevel } = nextStatusOnEscalate(
        current.status,
        current.dunningLevel,
      );
      const next = manualInvoiceSchema.parse({
        ...current,
        status,
        dunningLevel,
      });
      list[idx] = next;
      memory.set(organizationId, list);
      return next;
    },
    async markPaid(organizationId, invoiceId) {
      const list = memory.get(organizationId) ?? [];
      const idx = list.findIndex((r) => r.id === invoiceId);
      if (idx < 0) throw new Error("invoice_not_found");
      const next = manualInvoiceSchema.parse({
        ...list[idx],
        status: "paid",
        dunningLevel: 0,
      });
      list[idx] = next;
      memory.set(organizationId, list);
      return next;
    },
  };
}

export { nextStatusOnEscalate };

let client: ManualBillingClient = createMockManualBillingClient();
export function getManualBillingClient() {
  return client;
}
export function setManualBillingClient(next: ManualBillingClient) {
  client = next;
}
