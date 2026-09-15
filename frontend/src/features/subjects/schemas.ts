import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().trim().min(1, "subjects.validation.name"),
  code: z
    .string()
    .trim()
    .min(2, "subjects.validation.code")
    .max(16, "subjects.validation.code"),
  levelLabel: z.string().trim().min(1, "subjects.validation.level"),
  teacherDisplayName: z.string().trim().min(1, "subjects.validation.teacher"),
});

export type CreateSubjectValues = z.infer<typeof createSubjectSchema>;
