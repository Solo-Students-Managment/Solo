import { z } from "zod";

export const reauthSchema = z.object({
  password: z.string().min(8, "security.validation.passwordMin"),
});

export const confirmCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "security.validation.code"),
});

export const enableTwoFactorSchema = reauthSchema.and(
  z.object({
    method: z.enum(["sms", "totp"]),
  }),
);

export const disableTwoFactorSchema = reauthSchema.and(confirmCodeSchema);

export type ReauthValues = z.infer<typeof reauthSchema>;
export type ConfirmCodeValues = z.infer<typeof confirmCodeSchema>;
export type EnableTwoFactorValues = z.infer<typeof enableTwoFactorSchema>;
export type DisableTwoFactorValues = z.infer<typeof disableTwoFactorSchema>;

export function isOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}
