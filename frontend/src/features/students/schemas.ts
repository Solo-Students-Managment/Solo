import { z } from "zod";

import { phonePartsSchema } from "@/features/auth";

export const createManagedStudentSchema = phonePartsSchema.and(
  z.object({
    displayName: z.string().trim().min(1, "students.validation.displayName"),
  }),
);

export const linkGuardianSchema = phonePartsSchema.and(
  z.object({
    displayName: z.string().trim().min(1, "students.validation.displayName"),
    relationshipLabel: z
      .string()
      .trim()
      .min(1, "students.validation.relationship"),
  }),
);

export type CreateManagedStudentValues = z.infer<
  typeof createManagedStudentSchema
>;
export type LinkGuardianValues = z.infer<typeof linkGuardianSchema>;
