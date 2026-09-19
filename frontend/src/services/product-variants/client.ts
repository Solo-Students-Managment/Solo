import { z } from "zod";
import { apiRequest, moneySchema, opaqueIdSchema } from "@/services/api";

export const productVariantSchema = z.object({
  id: opaqueIdSchema,
  productId: opaqueIdSchema,
  sku: z.string().min(1),
  label: z.string().min(1),
  inventory: z.number().int().nonnegative(),
  price: moneySchema,
  delivery: z.enum(["physical", "digital"]),
  licenseKey: z.string().nullable(),
});
export type ProductVariant = z.infer<typeof productVariantSchema>;

export function isInStock(v: ProductVariant): boolean {
  return v.delivery === "digital" || v.inventory > 0;
}

export type ProductVariantsClient = {
  list(productId: string): Promise<ProductVariant[]>;
  create(input: {
    productId: string;
    sku: string;
    label: string;
    inventory: number;
    price: { amount: number; currency: "IRR" | "USD" | "EUR" };
    delivery: "physical" | "digital";
  }): Promise<ProductVariant>;
  adjustInventory(id: string, delta: number): Promise<ProductVariant>;
  issueLicense(id: string): Promise<ProductVariant>;
};

export function createHttpProductVariantsClient(): ProductVariantsClient {
  return {
    async list(productId) {
      return apiRequest(
        `/seller/products/${encodeURIComponent(productId)}/variants`,
        {
          parse: (d) => z.array(productVariantSchema).parse(d),
        },
      );
    },
    async create(input) {
      return apiRequest(
        `/seller/products/${encodeURIComponent(input.productId)}/variants`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (d) => productVariantSchema.parse(d),
        },
      );
    },
    async adjustInventory(id, delta) {
      return apiRequest(
        `/seller/variants/${encodeURIComponent(id)}/inventory`,
        {
          method: "POST",
          body: JSON.stringify({ delta }),
          parse: (d) => productVariantSchema.parse(d),
        },
      );
    },
    async issueLicense(id) {
      return apiRequest(`/seller/variants/${encodeURIComponent(id)}/license`, {
        method: "POST",
        parse: (d) => productVariantSchema.parse(d),
      });
    },
  };
}

export function createMockProductVariantsClient(): ProductVariantsClient {
  const rows = new Map<string, ProductVariant>();
  let seq = 1;
  const seed = productVariantSchema.parse({
    id: "var_1",
    productId: "prod_draft_1",
    sku: "ALG-WB-01",
    label: "Paperback",
    inventory: 10,
    price: { amount: 250000, currency: "IRR" },
    delivery: "physical",
    licenseKey: null,
  });
  rows.set(String(seed.id), seed);
  return {
    async list(productId) {
      return Array.from(rows.values()).filter((r) => r.productId === productId);
    },
    async create(input) {
      const row = productVariantSchema.parse({
        id: `var_${seq++}`,
        productId: input.productId,
        sku: input.sku,
        label: input.label,
        inventory: input.inventory,
        price: input.price,
        delivery: input.delivery,
        licenseKey: null,
      });
      rows.set(String(row.id), row);
      return row;
    },
    async adjustInventory(id, delta) {
      const row = rows.get(id);
      if (!row) throw new Error("not_found");
      const next = productVariantSchema.parse({
        ...row,
        inventory: Math.max(0, row.inventory + delta),
      });
      rows.set(id, next);
      return next;
    },
    async issueLicense(id) {
      const row = rows.get(id);
      if (!row) throw new Error("not_found");
      if (row.delivery !== "digital") throw new Error("not_digital");
      const next = productVariantSchema.parse({
        ...row,
        licenseKey: `LIC-${row.sku}-${seq++}`,
      });
      rows.set(id, next);
      return next;
    },
  };
}

let active: ProductVariantsClient = createMockProductVariantsClient();
export function setProductVariantsClient(c: ProductVariantsClient) {
  active = c;
}
export function getProductVariantsClient() {
  return active;
}
