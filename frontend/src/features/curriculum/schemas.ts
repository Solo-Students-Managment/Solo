import { z } from "zod";

export const curriculumTabs = ["modules", "units", "lessons"] as const;
export type CurriculumTab = (typeof curriculumTabs)[number];

export function resolveCurriculumTab(raw: string | null): CurriculumTab {
  if (raw && (curriculumTabs as readonly string[]).includes(raw)) {
    return raw as CurriculumTab;
  }
  return "modules";
}

export const createModuleSchema = z.object({
  title: z.string().trim().min(1, "curriculum.validation.title"),
  description: z.string().trim().optional(),
  sortOrder: z.coerce
    .number()
    .int("curriculum.validation.sortOrder")
    .min(0, "curriculum.validation.sortOrder"),
});
export type CreateModuleValues = z.infer<typeof createModuleSchema>;

export const createUnitSchema = z.object({
  moduleId: z.string().trim().min(1, "curriculum.validation.module"),
  title: z.string().trim().min(1, "curriculum.validation.title"),
  description: z.string().trim().optional(),
  sortOrder: z.coerce
    .number()
    .int("curriculum.validation.sortOrder")
    .min(0, "curriculum.validation.sortOrder"),
  prerequisiteUnitId: z.string().trim().optional(),
});
export type CreateUnitValues = z.infer<typeof createUnitSchema>;

export const createLessonSchema = z.object({
  unitId: z.string().trim().min(1, "curriculum.validation.unit"),
  title: z.string().trim().min(1, "curriculum.validation.title"),
  kind: z.enum(["lesson", "topic"]),
  objectives: z.string().trim().optional(),
  resources: z.string().trim().optional(),
  homework: z.string().trim().optional(),
  examRef: z.string().trim().optional(),
  durationMinutes: z.coerce
    .number()
    .int("curriculum.validation.duration")
    .min(1, "curriculum.validation.duration"),
  prerequisiteLessonId: z.string().trim().optional(),
  progressPercent: z.coerce
    .number()
    .int("curriculum.validation.progress")
    .min(0, "curriculum.validation.progress")
    .max(100, "curriculum.validation.progress")
    .optional(),
});
export type CreateLessonValues = z.infer<typeof createLessonSchema>;
