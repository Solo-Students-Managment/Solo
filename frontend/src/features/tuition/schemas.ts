import { z } from "zod";
export const recordTuitionSchema = z.object({
  studentDisplayName: z.string().trim().min(1, "tuition.validation.student"),
  amountMinor: z.coerce.number().int().nonnegative(),
  dueAt: z.string().min(1, "tuition.validation.dueAt"),
  status: z.enum(["due", "partial", "paid", "waived"]),
});
export type RecordTuitionValues = z.infer<typeof recordTuitionSchema>;
