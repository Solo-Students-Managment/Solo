import { z } from "zod";

export const createAutomationSchema = z.object({
  name: z.string().trim().min(1, "automation.validation.name"),
  triggerType: z.enum([
    "webhook",
    "schedule",
    "form_submitted",
    "enrollment_created",
  ]),
  riskLevel: z.enum(["low", "medium", "high"]),
  stepsSummary: z.string().trim().min(1, "automation.validation.stepsSummary"),
});
export type CreateAutomationValues = z.infer<typeof createAutomationSchema>;
