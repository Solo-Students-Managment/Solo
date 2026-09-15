import { z } from "zod";

export const createPolicySchema = z.object({
  title: z.string().trim().min(1, "policies.validation.title"),
  category: z.string().trim().min(1, "policies.validation.category"),
  inheritsFromParent: z.coerce.boolean(),
  sensitive: z.coerce.boolean(),
  effectiveFrom: z.string().trim().min(1, "policies.validation.effectiveFrom"),
  summary: z.string().trim().min(1, "policies.validation.summary"),
});
export type CreatePolicyValues = z.infer<typeof createPolicySchema>;
