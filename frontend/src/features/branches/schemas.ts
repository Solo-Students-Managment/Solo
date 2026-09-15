import { z } from "zod";

export const createBranchSchema = z.object({
  name: z.string().trim().min(1, "branches.validation.name"),
  code: z
    .string()
    .trim()
    .min(2, "branches.validation.code")
    .max(12, "branches.validation.code"),
  effectiveFrom: z.string().trim().min(1, "branches.validation.effectiveFrom"),
  address: z.string().trim().optional(),
});
export type CreateBranchValues = z.infer<typeof createBranchSchema>;
