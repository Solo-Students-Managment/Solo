import { z } from "zod";

import { enrollmentStatusSchema } from "@/services/enrollments";

export const createEnrollmentSchema = z.object({
  studentDisplayName: z
    .string()
    .trim()
    .min(1, "enrollments.validation.student"),
  className: z.string().trim().min(1, "enrollments.validation.class"),
  courseName: z.string().trim().min(1, "enrollments.validation.course"),
});

export const transferEnrollmentSchema = z.object({
  className: z.string().trim().min(1, "enrollments.validation.class"),
  courseName: z.string().trim().min(1, "enrollments.validation.course"),
});

export const updateEnrollmentStatusSchema = z.object({
  status: enrollmentStatusSchema.exclude(["transferred"]),
});

export type CreateEnrollmentValues = z.infer<typeof createEnrollmentSchema>;
export type TransferEnrollmentValues = z.infer<typeof transferEnrollmentSchema>;
