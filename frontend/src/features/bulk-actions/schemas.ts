import { z } from "zod";

export const createBulkJobSchema = z.object({
  moduleKey: z.string().trim().min(1, "bulkActions.validation.moduleKey"),
  actionKey: z.string().trim().min(1, "bulkActions.validation.actionKey"),
  itemCount: z.coerce
    .number()
    .int()
    .positive("bulkActions.validation.itemCount"),
});
export type CreateBulkJobValues = z.infer<typeof createBulkJobSchema>;
