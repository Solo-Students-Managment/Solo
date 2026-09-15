import { z } from "zod";
import { isValidShiftWindow } from "@/services/shifts";

export const createShiftSchema = z
  .object({
    name: z.string().trim().min(1, "shifts.validation.name"),
    weekday: z.coerce.number().int().min(0).max(6),
    startTime: z.string().trim().min(1, "shifts.validation.start"),
    endTime: z.string().trim().min(1, "shifts.validation.end"),
    branchName: z.string().trim().min(1, "shifts.validation.branch"),
  })
  .refine((v) => isValidShiftWindow(v.startTime, v.endTime), {
    message: "shifts.validation.window",
    path: ["endTime"],
  });
export type CreateShiftValues = z.infer<typeof createShiftSchema>;
