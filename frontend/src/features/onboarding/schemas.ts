import { z } from "zod";
export const createOnboardingSchema = z.object({
  staffDisplayName: z.string().trim().min(1, "onboarding.validation.staff"),
  roleTemplate: z.string().trim().min(1, "onboarding.validation.role"),
});
export type CreateOnboardingValues = z.infer<typeof createOnboardingSchema>;
