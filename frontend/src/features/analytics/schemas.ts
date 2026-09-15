import { z } from "zod";

export const createSavedViewSchema = z.object({
  name: z.string().trim().min(1, "analytics.validation.viewName"),
  metricKey: z.string().trim().min(1, "analytics.validation.metricKey"),
  alertThreshold: z.coerce.number("analytics.validation.alertThreshold"),
});
export type CreateSavedViewValues = z.infer<typeof createSavedViewSchema>;

export const createGoalSchema = z.object({
  name: z.string().trim().min(1, "analytics.validation.goalName"),
  targetValue: z.coerce.number().positive("analytics.validation.targetValue"),
});
export type CreateGoalValues = z.infer<typeof createGoalSchema>;

export const updateGoalProgressSchema = z.object({
  currentValue: z.coerce
    .number()
    .nonnegative("analytics.validation.currentValue"),
});
export type UpdateGoalProgressValues = z.infer<typeof updateGoalProgressSchema>;
