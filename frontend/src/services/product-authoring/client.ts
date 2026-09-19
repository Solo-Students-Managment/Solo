import { z } from "zod";
import { apiRequest, moneySchema, opaqueIdSchema } from "@/services/api";

export const productStatusSchema = z.enum([
  "draft",
  "published",
  "paused",
  "archived",
]);
export type ProductStatus = z.infer<typeof productStatusSchema>;

export const productSchema = z.object({
  id: opaqueIdSchema,
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().nullable(),
  bodyHtml: z.string(),
  status: productStatusSchema,
  price: moneySchema,
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
});
export type Product = z.infer<typeof productSchema>;

export function canPublish(product: Product): boolean {
  return product.status === "draft" || product.status === "paused";
}

export type ProductAuthoringClient = {
  listMine(): Promise<Product[]>;
  get(id: string): Promise<Product>;
  create(input: {
    title: string;
    slug: string;
    summary?: string | null;
    bodyHtml?: string;
    price: { amount: number; currency: "IRR" | "USD" | "EUR" };
    seoTitle?: string | null;
    seoDescription?: string | null;
  }): Promise<Product>;
  update(
    id: string,
    input: Partial<{
      title: string;
      summary: string | null;
      bodyHtml: string;
      seoTitle: string | null;
      seoDescription: string | null;
      price: { amount: number; currency: "IRR" | "USD" | "EUR" };
    }>,
  ): Promise<Product>;
  publish(id: string): Promise<Product>;
  pause(id: string): Promise<Product>;
  archive(id: string): Promise<Product>;
};

export function createHttpProductAuthoringClient(): ProductAuthoringClient {
  return {
    async listMine() {
      return apiRequest("/seller/products", {
        parse: (data) => z.array(productSchema).parse(data),
      });
    },
    async get(id) {
      return apiRequest(`/seller/products/${encodeURIComponent(id)}`, {
        parse: (data) => productSchema.parse(data),
      });
    },
    async create(input) {
      return apiRequest("/seller/products", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => productSchema.parse(data),
      });
    },
    async update(id, input) {
      return apiRequest(`/seller/products/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(input),
        parse: (data) => productSchema.parse(data),
      });
    },
    async publish(id) {
      return apiRequest(`/seller/products/${encodeURIComponent(id)}/publish`, {
        method: "POST",
        parse: (data) => productSchema.parse(data),
      });
    },
    async pause(id) {
      return apiRequest(`/seller/products/${encodeURIComponent(id)}/pause`, {
        method: "POST",
        parse: (data) => productSchema.parse(data),
      });
    },
    async archive(id) {
      return apiRequest(`/seller/products/${encodeURIComponent(id)}/archive`, {
        method: "POST",
        parse: (data) => productSchema.parse(data),
      });
    },
  };
}

export function createMockProductAuthoringClient(): ProductAuthoringClient {
  const products = new Map<string, Product>();
  let seq = 1;
  const seed = productSchema.parse({
    id: "prod_draft_1",
    title: "Algebra workbook",
    slug: "algebra-workbook",
    summary: "Practice problems",
    bodyHtml: "<p>Workbook contents</p>",
    status: "draft",
    price: { amount: 250000, currency: "IRR" },
    seoTitle: "Algebra workbook",
    seoDescription: "Practice algebra",
  });
  products.set(String(seed.id), seed);

  return {
    async listMine() {
      return Array.from(products.values());
    },
    async get(id) {
      const row = products.get(id);
      if (!row) throw new Error("not_found");
      return row;
    },
    async create(input) {
      const row = productSchema.parse({
        id: `prod_${seq++}`,
        title: input.title,
        slug: input.slug,
        summary: input.summary ?? null,
        bodyHtml: input.bodyHtml ?? "",
        status: "draft",
        price: input.price,
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
      });
      products.set(String(row.id), row);
      return row;
    },
    async update(id, input) {
      const row = products.get(id);
      if (!row) throw new Error("not_found");
      const next = productSchema.parse({ ...row, ...input });
      products.set(id, next);
      return next;
    },
    async publish(id) {
      const row = products.get(id);
      if (!row) throw new Error("not_found");
      if (!canPublish(row)) throw new Error("invalid_status");
      const next = productSchema.parse({ ...row, status: "published" });
      products.set(id, next);
      return next;
    },
    async pause(id) {
      const row = products.get(id);
      if (!row) throw new Error("not_found");
      if (row.status !== "published") throw new Error("invalid_status");
      const next = productSchema.parse({ ...row, status: "paused" });
      products.set(id, next);
      return next;
    },
    async archive(id) {
      const row = products.get(id);
      if (!row) throw new Error("not_found");
      const next = productSchema.parse({ ...row, status: "archived" });
      products.set(id, next);
      return next;
    },
  };
}

let active: ProductAuthoringClient = createMockProductAuthoringClient();
export function setProductAuthoringClient(c: ProductAuthoringClient) {
  active = c;
}
export function getProductAuthoringClient() {
  return active;
}
