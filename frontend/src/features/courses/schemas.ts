import { z } from "zod";

export const createCourseSchema = z.object({
  name: z.string().trim().min(1, "courses.validation.name"),
  subjectName: z.string().trim().min(1, "courses.validation.subject"),
  termId: z.string().trim().optional(),
});

export const createClassSchema = z.object({
  name: z.string().trim().min(1, "courses.validation.className"),
  capacity: z.coerce.number().int().positive("courses.validation.capacity"),
});

export const createTermSchema = z.object({
  name: z.string().trim().min(1, "courses.validation.term"),
  startsOn: z.string().trim().min(1, "courses.validation.termDates"),
  endsOn: z.string().trim().min(1, "courses.validation.termDates"),
});

export type CreateCourseValues = z.infer<typeof createCourseSchema>;
export type CreateClassValues = z.infer<typeof createClassSchema>;
export type CreateTermValues = z.infer<typeof createTermSchema>;
