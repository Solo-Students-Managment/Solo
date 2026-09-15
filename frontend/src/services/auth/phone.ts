import { z } from "zod";

export const changePhoneBeginSchema = z.object({
  currentChallengeId: z.string().min(1),
  newChallengeId: z.string().min(1),
  currentPhoneMasked: z.string().min(1),
});
export type ChangePhoneBegin = z.infer<typeof changePhoneBeginSchema>;

export const changePhoneConfirmSchema = z.object({
  phoneMasked: z.string().min(1),
});
export type ChangePhoneConfirm = z.infer<typeof changePhoneConfirmSchema>;

export const supportRecoveryRequestSchema = z.object({
  ticketId: z.string().min(1),
  status: z.literal("submitted"),
});
export type SupportRecoveryResult = z.infer<
  typeof supportRecoveryRequestSchema
>;

export function maskPhoneE164(phoneE164: string): string {
  const digits = phoneE164.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `+${digits.slice(0, 2)}***${digits.slice(-2)}`;
}
