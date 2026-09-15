import { z } from "zod";
export const sendDirectSchema = z.object({
  subjectScope: z.string().trim().min(1, "messaging.validation.subject"),
  participantLabel: z
    .string()
    .trim()
    .min(1, "messaging.validation.participant"),
  body: z.string().trim().min(1, "messaging.validation.body"),
});
export const sendBroadcastSchema = z.object({
  subjectScope: z.string().trim().min(1, "messaging.validation.subject"),
  body: z.string().trim().min(1, "messaging.validation.body"),
});
export type SendDirectValues = z.infer<typeof sendDirectSchema>;
export type SendBroadcastValues = z.infer<typeof sendBroadcastSchema>;
