import { z } from "zod";
export const createClockEventSchema = z.object({
  staffDisplayName: z
    .string()
    .trim()
    .min(1, "staffAttendance.validation.staff"),
  eventType: z.enum(["clock_in", "clock_out"]),
  branchName: z.string().trim().min(1, "staffAttendance.validation.branch"),
});
export type CreateClockEventValues = z.infer<typeof createClockEventSchema>;
