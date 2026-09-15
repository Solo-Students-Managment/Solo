import { z } from "zod";

export const createGradeScaleSchema = z
  .object({
    name: z.string().trim().min(1, "evaluations.validation.name"),
    type: z.enum(["out_of_20", "out_of_100", "pass_fail", "custom"]),
    minValue: z.coerce.number().optional(),
    maxValue: z.coerce.number().optional(),
    passLabel: z.string().trim().optional(),
    failLabel: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.type === "custom") {
      const min = values.minValue;
      const max = values.maxValue;
      if (
        min == null ||
        max == null ||
        Number.isNaN(min) ||
        Number.isNaN(max)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxValue"],
          message: "evaluations.validation.customBounds",
        });
        return;
      }
      if (max <= min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxValue"],
          message: "evaluations.validation.customBounds",
        });
      }
    }
    if (values.type === "pass_fail") {
      if (!values.passLabel?.trim() || !values.failLabel?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["passLabel"],
          message: "evaluations.validation.passFailLabels",
        });
      }
    }
  });

export type CreateGradeScaleValues = z.infer<typeof createGradeScaleSchema>;

export const createEvaluationLevelSchema = z.object({
  name: z.string().trim().min(1, "evaluations.validation.name"),
  rank: z.coerce
    .number()
    .int("evaluations.validation.rank")
    .min(1, "evaluations.validation.rank"),
  description: z.string().trim().optional(),
});

export type CreateEvaluationLevelValues = z.infer<
  typeof createEvaluationLevelSchema
>;

export const createProgressMetricSchema = z.object({
  name: z.string().trim().min(1, "evaluations.validation.name"),
  kind: z.enum(["core", "custom"]),
  unit: z.string().trim().min(1, "evaluations.validation.unit"),
});

export type CreateProgressMetricValues = z.infer<
  typeof createProgressMetricSchema
>;

export const createEvaluationTemplateSchema = z.object({
  name: z.string().trim().min(1, "evaluations.validation.name"),
  domain: z.string().trim().min(1, "evaluations.validation.domain"),
  scaleId: z.string().trim().min(1, "evaluations.validation.scale"),
  levelId: z.string().trim().optional(),
  progressMetricIds: z.string().optional(),
  description: z.string().trim().optional(),
});

export type CreateEvaluationTemplateValues = z.infer<
  typeof createEvaluationTemplateSchema
>;

export function parseProgressMetricIds(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export const evaluationTabSchema = z.enum([
  "templates",
  "scales",
  "levels",
  "progress",
]);
export type EvaluationTab = z.infer<typeof evaluationTabSchema>;

export function resolveEvaluationTab(value: string | null): EvaluationTab {
  const parsed = evaluationTabSchema.safeParse(value);
  return parsed.success ? parsed.data : "templates";
}
