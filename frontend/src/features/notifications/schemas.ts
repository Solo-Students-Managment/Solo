import { z } from "zod";

export const notificationPreferencesFormSchema = z.object({
  inApp: z.boolean(),
  sms: z.boolean(),
  webPush: z.boolean(),
  quietHoursEnabled: z.boolean(),
});

export type NotificationPreferencesFormValues = z.infer<
  typeof notificationPreferencesFormSchema
>;
