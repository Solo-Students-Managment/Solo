import { z } from "zod";
import {
  apiRequest,
  collectionSchema,
  moneySchema,
  opaqueIdSchema,
} from "@/services/api";

export const marketCodeSchema = z.enum(["IR", "GLOBAL"]);
export type MarketCode = z.infer<typeof marketCodeSchema>;

export const planAudienceSchema = z.enum(["teacher", "organization"]);
export type PlanAudience = z.infer<typeof planAudienceSchema>;

export const priceBookSchema = z.object({
  id: opaqueIdSchema,
  marketCode: marketCodeSchema,
  currency: z.enum(["IRR", "USD"]),
  label: z.string().min(1),
});
export type PriceBook = z.infer<typeof priceBookSchema>;

export const catalogPlanSchema = z.object({
  id: opaqueIdSchema,
  code: z.string().min(1),
  name: z.string().min(1),
  audience: planAudienceSchema,
  priceBookId: opaqueIdSchema,
  monthlyPrice: moneySchema,
  highlight: z.boolean(),
  featureSummary: z.string().min(1),
});
export type CatalogPlan = z.infer<typeof catalogPlanSchema>;

export const pricingCatalogSchema = z.object({
  priceBooks: z.array(priceBookSchema),
  plans: z.array(catalogPlanSchema),
});
export type PricingCatalog = z.infer<typeof pricingCatalogSchema>;

export type PricingClient = {
  getCatalog(): Promise<PricingCatalog>;
  listPlans(marketCode: MarketCode): Promise<{
    data: CatalogPlan[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
};

const seedBooks: PriceBook[] = [
  priceBookSchema.parse({
    id: "pb_ir",
    marketCode: "IR",
    currency: "IRR",
    label: "Iran Toman book",
  }),
  priceBookSchema.parse({
    id: "pb_global",
    marketCode: "GLOBAL",
    currency: "USD",
    label: "Global USD book",
  }),
];

const seedPlans: CatalogPlan[] = [
  catalogPlanSchema.parse({
    id: "pl_t_free_ir",
    code: "teacher_free",
    name: "Teacher Free",
    audience: "teacher",
    priceBookId: "pb_ir",
    monthlyPrice: { amount: 0, currency: "IRR" },
    highlight: false,
    featureSummary: "Core teaching tools",
  }),
  catalogPlanSchema.parse({
    id: "pl_t_pro_ir",
    code: "teacher_pro",
    name: "Teacher Pro",
    audience: "teacher",
    priceBookId: "pb_ir",
    monthlyPrice: { amount: 490000, currency: "IRR" },
    highlight: true,
    featureSummary: "Advanced analytics and templates",
  }),
  catalogPlanSchema.parse({
    id: "pl_o_starter_ir",
    code: "org_starter",
    name: "Organization Starter",
    audience: "organization",
    priceBookId: "pb_ir",
    monthlyPrice: { amount: 2900000, currency: "IRR" },
    highlight: false,
    featureSummary: "Branches, staff ops, and policies",
  }),
  catalogPlanSchema.parse({
    id: "pl_o_pro_ir",
    code: "org_pro",
    name: "Organization Pro",
    audience: "organization",
    priceBookId: "pb_ir",
    monthlyPrice: { amount: 7900000, currency: "IRR" },
    highlight: true,
    featureSummary: "Approvals, automation, and CRM",
  }),
  catalogPlanSchema.parse({
    id: "pl_t_free_gl",
    code: "teacher_free",
    name: "Teacher Free",
    audience: "teacher",
    priceBookId: "pb_global",
    monthlyPrice: { amount: 0, currency: "USD" },
    highlight: false,
    featureSummary: "Core teaching tools",
  }),
  catalogPlanSchema.parse({
    id: "pl_t_pro_gl",
    code: "teacher_pro",
    name: "Teacher Pro",
    audience: "teacher",
    priceBookId: "pb_global",
    monthlyPrice: { amount: 12, currency: "USD" },
    highlight: true,
    featureSummary: "Advanced analytics and templates",
  }),
  catalogPlanSchema.parse({
    id: "pl_o_starter_gl",
    code: "org_starter",
    name: "Organization Starter",
    audience: "organization",
    priceBookId: "pb_global",
    monthlyPrice: { amount: 49, currency: "USD" },
    highlight: false,
    featureSummary: "Branches, staff ops, and policies",
  }),
  catalogPlanSchema.parse({
    id: "pl_o_pro_gl",
    code: "org_pro",
    name: "Organization Pro",
    audience: "organization",
    priceBookId: "pb_global",
    monthlyPrice: { amount: 129, currency: "USD" },
    highlight: true,
    featureSummary: "Approvals, automation, and CRM",
  }),
];

/** Demo catalog amounts come from Price Books — not final production prices. */
export function plansForMarket(
  catalog: PricingCatalog,
  marketCode: MarketCode,
): CatalogPlan[] {
  const book = catalog.priceBooks.find((row) => row.marketCode === marketCode);
  if (!book) return [];
  return catalog.plans.filter(
    (plan) => String(plan.priceBookId) === String(book.id),
  );
}

export function formatCatalogMoney(amount: number, currency: "IRR" | "USD") {
  if (currency === "IRR") {
    return `${amount.toLocaleString("en-US")} IRR`;
  }
  return `$${amount.toLocaleString("en-US")}`;
}

export function comparePlanCodes(a: CatalogPlan, b: CatalogPlan) {
  return a.code.localeCompare(b.code);
}

export function createHttpPricingClient(): PricingClient {
  return {
    async getCatalog() {
      return apiRequest("/pricing/catalog", {
        parse: (data) => pricingCatalogSchema.parse(data),
      });
    },
    async listPlans(marketCode) {
      return apiRequest(
        `/pricing/plans?market=${encodeURIComponent(marketCode)}`,
        {
          parse: (data) => collectionSchema(catalogPlanSchema).parse(data),
        },
      );
    },
  };
}

export function createMockPricingClient(): PricingClient {
  const catalog = pricingCatalogSchema.parse({
    priceBooks: seedBooks,
    plans: seedPlans,
  });
  return {
    async getCatalog() {
      return catalog;
    },
    async listPlans(marketCode) {
      const data = plansForMarket(catalog, marketCode);
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
  };
}

let client: PricingClient = createMockPricingClient();
export function getPricingClient() {
  return client;
}
export function setPricingClient(next: PricingClient) {
  client = next;
}
export function __resetMockPricing() {
  client = createMockPricingClient();
}
