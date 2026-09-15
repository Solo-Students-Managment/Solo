import { z } from "zod";

export const createLessonPlanSchema = z.object({
  title: z.string().trim().min(1, "lessonPlans.validation.title"),
  bodyHtml: z.string().trim().min(1, "lessonPlans.validation.body"),
  visibility: z.enum(["personal", "school", "specific", "public"]),
  moduleRef: z.string().trim().optional(),
});
export type CreateLessonPlanValues = z.infer<typeof createLessonPlanSchema>;

export function hasMeaningfulPlanBody(html: string): boolean {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0;
}
