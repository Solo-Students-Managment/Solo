import { z } from "zod";
import {
  apiRequest,
  collectionSchema,
  moneySchema,
  opaqueIdSchema,
} from "@/services/api";

export const invoiceStatusSchema = z.enum(["draft", "open", "paid", "void"]);
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export const invoiceSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  number: z.string().min(1),
  status: invoiceStatusSchema,
  total: moneySchema,
  issuedAt: z.string().min(1),
  dueAt: z.string().min(1),
});
export type Invoice = z.infer<typeof invoiceSchema>;

export const paymentMethodSchema = z.object({
  brand: z.string().min(1),
  last4: z.string().length(4),
  expMonth: z.number().int().min(1).max(12),
  expYear: z.number().int(),
});
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const billingSummarySchema = z.object({
  organizationId: opaqueIdSchema,
  nextBillAt: z.string().nullable(),
  nextBillAmount: moneySchema.nullable(),
  paymentMethod: paymentMethodSchema.nullable(),
});
export type BillingSummary = z.infer<typeof billingSummarySchema>;

export type BillingClient = {
  listInvoices(organizationId: string): Promise<{
    data: Invoice[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  getSummary(organizationId: string): Promise<BillingSummary>;
};

const memory = new Map<string, Invoice[]>();

function seedInvoices(orgId: string): Invoice[] {
  return [
    invoiceSchema.parse({
      id: `inv_${orgId}_1`,
      organizationId: orgId,
      number: "INV-1001",
      status: "paid",
      total: { amount: 2900000, currency: "IRR" },
      issuedAt: new Date(Date.now() - 30 * 86_400_000).toISOString(),
      dueAt: new Date(Date.now() - 15 * 86_400_000).toISOString(),
    }),
    invoiceSchema.parse({
      id: `inv_${orgId}_2`,
      organizationId: orgId,
      number: "INV-1002",
      status: "open",
      total: { amount: 2900000, currency: "IRR" },
      issuedAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + 14 * 86_400_000).toISOString(),
    }),
  ];
}

export function formatInvoiceMoney(amount: number, currency: "IRR" | "USD") {
  if (currency === "IRR") return `${amount.toLocaleString("en-US")} IRR`;
  return `$${amount.toLocaleString("en-US")}`;
}

export function createHttpBillingClient(): BillingClient {
  return {
    async listInvoices(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/billing/invoices`,
        { parse: (data) => collectionSchema(invoiceSchema).parse(data) },
      );
    },
    async getSummary(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/billing/summary`,
        { parse: (data) => billingSummarySchema.parse(data) },
      );
    },
  };
}

export function createMockBillingClient(): BillingClient {
  return {
    async listInvoices(organizationId) {
      const data = memory.get(organizationId) ?? seedInvoices(organizationId);
      memory.set(organizationId, data);
      return {
        data,
        meta: {
          page: 1,
          pageSize: Math.max(data.length, 1),
          totalItems: data.length,
          totalPages: 1,
        },
      };
    },
    async getSummary(organizationId) {
      return billingSummarySchema.parse({
        organizationId,
        nextBillAt: new Date(Date.now() + 14 * 86_400_000).toISOString(),
        nextBillAmount: { amount: 2900000, currency: "IRR" },
        paymentMethod: {
          brand: "Visa",
          last4: "4242",
          expMonth: 12,
          expYear: 2028,
        },
      });
    },
  };
}

let client: BillingClient = createMockBillingClient();
export function getBillingClient() {
  return client;
}
export function setBillingClient(next: BillingClient) {
  client = next;
}
