import { z } from "zod";
export const createOffboardingSchema = z.object({
  staffDisplayName: z.string().trim().min(1, "offboarding.validation.staff"),
  lastWorkingDay: z.string().trim().min(1, "offboarding.validation.day"),
});
export type CreateOffboardingValues = z.infer<typeof createOffboardingSchema>;
