import { z } from "zod";
import { isValidLeaveRange } from "@/services/leave";

export const createLeaveSchema = z
  .object({
    staffDisplayName: z.string().trim().min(1, "leave.validation.staff"),
    leaveType: z.enum(["annual", "sick", "unpaid", "other"]),
    startDate: z.string().trim().min(1, "leave.validation.start"),
    endDate: z.string().trim().min(1, "leave.validation.end"),
    reason: z.string().trim().min(1, "leave.validation.reason"),
  })
  .refine((v) => isValidLeaveRange(v.startDate, v.endDate), {
    message: "leave.validation.range",
    path: ["endDate"],
  });
export type CreateLeaveValues = z.infer<typeof createLeaveSchema>;
