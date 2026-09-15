import { z } from "zod";

export const createCourseSchema = z.object({
  name: z.string().trim().min(1, "courses.validation.name"),
  subjectName: z.string().trim().min(1, "courses.validation.subject"),
});

export const createClassSchema = z.object({
  name: z.string().trim().min(1, "courses.validation.className"),
  capacity: z.coerce.number().int().positive("courses.validation.capacity"),
});

export type CreateCourseValues = z.infer<typeof createCourseSchema>;
export type CreateClassValues = z.infer<typeof createClassSchema>;
