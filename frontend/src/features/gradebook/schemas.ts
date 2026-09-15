import { z } from "zod";
export const upsertGradeSchema = z.object({
  studentDisplayName: z.string().trim().min(1, "gradebook.validation.student"),
  subjectName: z.string().trim().min(1, "gradebook.validation.subject"),
  score: z.coerce.number().min(0).max(100),
});
export type UpsertGradeValues = z.infer<typeof upsertGradeSchema>;
