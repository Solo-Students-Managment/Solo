import { z } from "zod";

export const createDataJobSchema = z.object({
  jobType: z.enum(["import", "export", "backup", "restore"]),
  resourceKey: z.string().trim().min(1, "dataOps.validation.resourceKey"),
});
export type CreateDataJobValues = z.infer<typeof createDataJobSchema>;
