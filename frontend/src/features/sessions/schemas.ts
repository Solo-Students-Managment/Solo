import { z } from "zod";

export const createSessionSchema = z.object({
  className: z.string().trim().min(1, "sessions.validation.class"),
  startsAt: z.string().min(1, "sessions.validation.starts"),
  endsAt: z.string().min(1, "sessions.validation.ends"),
  recurrenceLabel: z.string().optional(),
});

export type CreateSessionValues = z.infer<typeof createSessionSchema>;
