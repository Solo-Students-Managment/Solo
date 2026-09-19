import { z } from "zod";
import { apiRequest, moneySchema, opaqueIdSchema } from "@/services/api";

export const currencySchema = z.enum(["IRR", "USD", "EUR"]);
export type Currency = z.infer<typeof currencySchema>;

export const taxonomyEntrySchema = z.object({
  id: opaqueIdSchema,
  name: z.string().min(1),
  slug: z.string().min(1),
});
export type TaxonomyEntry = z.infer<typeof taxonomyEntrySchema>;

export const priceHistoryEntrySchema = z.object({
  id: opaqueIdSchema,
  productId: opaqueIdSchema,
  price: moneySchema,
  effectiveAt: z.string(),
});
export type PriceHistoryEntry = z.infer<typeof priceHistoryEntrySchema>;

export type MarketplaceTaxonomyClient = {
  listCategories(): Promise<TaxonomyEntry[]>;
  createCategory(name: string): Promise<TaxonomyEntry>;
  listBrands(): Promise<TaxonomyEntry[]>;
  createBrand(name: string): Promise<TaxonomyEntry>;
  listPublishers(): Promise<TaxonomyEntry[]>;
  createPublisher(name: string): Promise<TaxonomyEntry>;
  listPriceHistory(productId: string): Promise<PriceHistoryEntry[]>;
  addPriceHistory(
    productId: string,
    price: { amount: number; currency: Currency },
  ): Promise<PriceHistoryEntry>;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function createHttpMarketplaceTaxonomyClient(): MarketplaceTaxonomyClient {
  return {
    async listCategories() {
      return apiRequest("/seller/taxonomy/categories", {
        parse: (d) => z.array(taxonomyEntrySchema).parse(d),
      });
    },
    async createCategory(name) {
      return apiRequest("/seller/taxonomy/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
        parse: (d) => taxonomyEntrySchema.parse(d),
      });
    },
    async listBrands() {
      return apiRequest("/seller/taxonomy/brands", {
        parse: (d) => z.array(taxonomyEntrySchema).parse(d),
      });
    },
    async createBrand(name) {
      return apiRequest("/seller/taxonomy/brands", {
        method: "POST",
        body: JSON.stringify({ name }),
        parse: (d) => taxonomyEntrySchema.parse(d),
      });
    },
    async listPublishers() {
      return apiRequest("/seller/taxonomy/publishers", {
        parse: (d) => z.array(taxonomyEntrySchema).parse(d),
      });
    },
    async createPublisher(name) {
      return apiRequest("/seller/taxonomy/publishers", {
        method: "POST",
        body: JSON.stringify({ name }),
        parse: (d) => taxonomyEntrySchema.parse(d),
      });
    },
    async listPriceHistory(productId) {
      return apiRequest(
        `/seller/taxonomy/products/${encodeURIComponent(productId)}/price-history`,
        {
          parse: (d) => z.array(priceHistoryEntrySchema).parse(d),
        },
      );
    },
    async addPriceHistory(productId, price) {
      return apiRequest(
        `/seller/taxonomy/products/${encodeURIComponent(productId)}/price-history`,
        {
          method: "POST",
          body: JSON.stringify({ price }),
          parse: (d) => priceHistoryEntrySchema.parse(d),
        },
      );
    },
  };
}

function createTaxonomyStore(seed: TaxonomyEntry[]) {
  const rows = new Map<string, TaxonomyEntry>(
    seed.map((s) => [String(s.id), s]),
  );
  let seq = seed.length + 1;
  return {
    list: () => Array.from(rows.values()),
    create: (name: string) => {
      const row = taxonomyEntrySchema.parse({
        id: `tax_${seq++}`,
        name,
        slug: slugify(name),
      });
      rows.set(String(row.id), row);
      return row;
    },
  };
}

export function createMockMarketplaceTaxonomyClient(): MarketplaceTaxonomyClient {
  const categories = createTaxonomyStore([
    taxonomyEntrySchema.parse({
      id: "cat_1",
      name: "Textbooks",
      slug: "textbooks",
    }),
  ]);
  const brands = createTaxonomyStore([
    taxonomyEntrySchema.parse({
      id: "brand_1",
      name: "Solo Press",
      slug: "solo-press",
    }),
  ]);
  const publishers = createTaxonomyStore([
    taxonomyEntrySchema.parse({
      id: "pub_1",
      name: "Tehran Edu",
      slug: "tehran-edu",
    }),
  ]);
  const priceHistory = new Map<string, PriceHistoryEntry[]>();
  let seq = 1;

  return {
    async listCategories() {
      return categories.list();
    },
    async createCategory(name) {
      return categories.create(name);
    },
    async listBrands() {
      return brands.list();
    },
    async createBrand(name) {
      return brands.create(name);
    },
    async listPublishers() {
      return publishers.list();
    },
    async createPublisher(name) {
      return publishers.create(name);
    },
    async listPriceHistory(productId) {
      return priceHistory.get(productId) ?? [];
    },
    async addPriceHistory(productId, price) {
      const row = priceHistoryEntrySchema.parse({
        id: `ph_${seq++}`,
        productId,
        price,
        effectiveAt: new Date().toISOString(),
      });
      const list = priceHistory.get(productId) ?? [];
      list.push(row);
      priceHistory.set(productId, list);
      return row;
    },
  };
}

let active: MarketplaceTaxonomyClient = createMockMarketplaceTaxonomyClient();
export function setMarketplaceTaxonomyClient(c: MarketplaceTaxonomyClient) {
  active = c;
}
export function getMarketplaceTaxonomyClient() {
  return active;
}
