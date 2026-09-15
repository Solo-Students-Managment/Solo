import { z } from "zod";

export const createExamSchema = z.object({
  title: z.string().trim().min(1, "exams.validation.title"),
  poolSize: z.coerce
    .number()
    .int("exams.validation.poolSize")
    .min(1, "exams.validation.poolSize"),
  randomize: z.enum(["yes", "no"]),
  maxAttempts: z.coerce
    .number()
    .int("exams.validation.maxAttempts")
    .min(1, "exams.validation.maxAttempts")
    .max(10, "exams.validation.maxAttempts"),
  timeLimitMinutes: z.string().optional(),
});
export type CreateExamValues = z.infer<typeof createExamSchema>;

export const startAttemptSchema = z.object({
  examTitle: z.string().trim().min(1, "exams.validation.title"),
  studentDisplayName: z.string().trim().min(1, "exams.validation.student"),
});
export type StartAttemptValues = z.infer<typeof startAttemptSchema>;

export const recordSignalSchema = z.object({
  attemptId: z.string().trim().min(1, "exams.validation.attempt"),
  signal: z.enum(["tab_blur", "fullscreen_exit", "copy_paste", "idle_timeout"]),
});
export type RecordSignalValues = z.infer<typeof recordSignalSchema>;

export const submitAttemptSchema = z.object({
  attemptId: z.string().trim().min(1, "exams.validation.attempt"),
});
export type SubmitAttemptValues = z.infer<typeof submitAttemptSchema>;

export function parseTimeLimitMinutes(raw: string | undefined): number | null {
  if (!raw?.trim()) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.floor(value);
}
