import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().trim().min(1, "events.validation.title"),
  startsAt: z.string().trim().min(1, "events.validation.startsAt"),
  capacity: z.coerce.number().int().positive("events.validation.capacity"),
  waitlistEnabled: z.boolean(),
});
export type CreateEventValues = z.infer<typeof createEventSchema>;
