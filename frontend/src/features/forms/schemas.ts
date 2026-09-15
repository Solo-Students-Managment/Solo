import { z } from "zod";
import { isValidPublicSlug } from "@/services/forms";

export const createSurveyFormSchema = z
  .object({
    title: z.string().trim().min(1, "forms.validation.title"),
    description: z.string().trim().min(1, "forms.validation.description"),
    questionText: z.string().trim().min(1, "forms.validation.question"),
    slug: z.string().trim().min(1, "forms.validation.slug"),
  })
  .superRefine((value, ctx) => {
    if (!isValidPublicSlug(value.slug)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["slug"],
        message: "forms.validation.slug",
      });
    }
  });
export type CreateSurveyFormValues = z.infer<typeof createSurveyFormSchema>;

export const publicSubmitSchema = z
  .object({
    answerText: z.string().trim().min(1, "forms.validation.answer"),
    consentName: z.string().trim().min(1, "forms.validation.consentName"),
    consentAccepted: z.coerce.boolean(),
  })
  .superRefine((value, ctx) => {
    if (!value.consentAccepted) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["consentAccepted"],
        message: "forms.validation.consent",
      });
    }
  });
export type PublicSubmitValues = z.infer<typeof publicSubmitSchema>;
