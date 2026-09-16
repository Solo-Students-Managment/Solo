import { z } from "zod";
import { apiRequest, moneySchema, opaqueIdSchema } from "@/services/api";

export const taxDocumentTypeSchema = z.enum(["invoice", "credit_note"]);
export type TaxDocumentType = z.infer<typeof taxDocumentTypeSchema>;

export const taxDocumentSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  type: taxDocumentTypeSchema,
  number: z.string().min(1),
  locale: z.enum(["en", "fa"]),
  vatRatePercent: z.number().nonnegative(),
  subtotal: moneySchema,
  vatAmount: moneySchema,
  total: moneySchema,
  issuedAt: z.string().min(1),
});
export type TaxDocument = z.infer<typeof taxDocumentSchema>;

export function computeVat(
  subtotalAmount: number,
  vatRatePercent: number,
): { vatAmount: number; total: number } {
  const vatAmount = Math.round((subtotalAmount * vatRatePercent) / 100);
  return { vatAmount, total: subtotalAmount + vatAmount };
}

export type TaxInvoicesClient = {
  list(organizationId: string): Promise<TaxDocument[]>;
  issue(
    organizationId: string,
    input: {
      type: TaxDocumentType;
      locale: "en" | "fa";
      vatRatePercent: number;
      subtotalAmount: number;
      currency: "IRR" | "USD";
    },
  ): Promise<TaxDocument>;
};

const memory = new Map<string, TaxDocument[]>();

export function createHttpTaxInvoicesClient(): TaxInvoicesClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/tax-invoices`,
        { parse: (data) => z.array(taxDocumentSchema).parse(data) },
      );
    },
    async issue(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/tax-invoices`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => taxDocumentSchema.parse(data),
        },
      );
    },
  };
}

export function createMockTaxInvoicesClient(): TaxInvoicesClient {
  return {
    async list(organizationId) {
      return memory.get(organizationId) ?? [];
    },
    async issue(organizationId, input) {
      const { vatAmount, total } = computeVat(
        input.subtotalAmount,
        input.vatRatePercent,
      );
      const row = taxDocumentSchema.parse({
        id: `tax_${organizationId}_${Date.now()}`,
        organizationId,
        type: input.type,
        number: `TX-${Date.now()}`,
        locale: input.locale,
        vatRatePercent: input.vatRatePercent,
        subtotal: { amount: input.subtotalAmount, currency: input.currency },
        vatAmount: { amount: vatAmount, currency: input.currency },
        total: { amount: total, currency: input.currency },
        issuedAt: new Date().toISOString(),
      });
      memory.set(organizationId, [row, ...(memory.get(organizationId) ?? [])]);
      return row;
    },
  };
}

let client: TaxInvoicesClient = createMockTaxInvoicesClient();
export function getTaxInvoicesClient() {
  return client;
}
export function setTaxInvoicesClient(next: TaxInvoicesClient) {
  client = next;
}
