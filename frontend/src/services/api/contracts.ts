import { z } from "zod";

export const opaqueIdSchema = z.string().min(1).brand<"OpaqueId">();
export type OpaqueId = z.infer<typeof opaqueIdSchema>;

export const utcDateTimeSchema = z.string().min(1);
export const moneySchema = z.object({
  amount: z.number().finite(),
  currency: z.enum(["IRR", "USD", "EUR"]),
});
export type Money = z.infer<typeof moneySchema>;

export const apiErrorSchema = z.object({
  code: z.string(),
  messageKey: z.string(),
  status: z.number().int(),
  fieldErrors: z.record(z.string(), z.array(z.string())).optional().default({}),
  details: z.unknown().optional(),
  requestId: z.string().optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export function collectionSchema<T extends z.ZodType>(item: T) {
  return z.object({
    data: z.array(item),
    meta: paginationMetaSchema,
  });
}

export const concurrencyVersionSchema = z.object({
  version: z.number().int().nonnegative(),
});

export const fileUploadContractSchema = z.object({
  uploadId: opaqueIdSchema,
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  scanStatus: z.enum([
    "uploading",
    "scanning",
    "safe",
    "blocked",
    "scan_failed",
  ]),
});

export function createIdempotencyKey(prefix = "idem"): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
