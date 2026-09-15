import { z } from "zod";

import { opaqueIdSchema } from "@/services/api";

export const twoFactorMethodSchema = z.enum(["sms", "totp"]);
export type TwoFactorMethod = z.infer<typeof twoFactorMethodSchema>;

export const twoFactorStatusSchema = z.object({
  enabled: z.boolean(),
  smsEnabled: z.boolean(),
  totpEnabled: z.boolean(),
  recoveryCodesRemaining: z.number().int().nonnegative(),
  orgRequires2fa: z.boolean(),
  adminMandatory: z.boolean(),
});
export type TwoFactorStatus = z.infer<typeof twoFactorStatusSchema>;

export const deviceSessionSchema = z.object({
  id: opaqueIdSchema,
  deviceLabel: z.string(),
  locationHint: z.string(),
  userAgentSummary: z.string(),
  lastActiveAt: z.string(),
  createdAt: z.string(),
  expiresAt: z.string(),
  isCurrent: z.boolean(),
});
export type DeviceSession = z.infer<typeof deviceSessionSchema>;

export const enableTwoFactorBeginSchema = z.object({
  challengeId: z.string().min(1),
  totpSecret: z.string().optional(),
  totpUri: z.string().optional(),
});
export type EnableTwoFactorBegin = z.infer<typeof enableTwoFactorBeginSchema>;

export const enableTwoFactorConfirmSchema = z.object({
  recoveryCodes: z.array(z.string()).optional(),
  status: twoFactorStatusSchema,
});
export type EnableTwoFactorConfirm = z.infer<
  typeof enableTwoFactorConfirmSchema
>;

export const recoveryCodesResultSchema = z.object({
  recoveryCodes: z.array(z.string().min(1)).min(1),
});
export type RecoveryCodesResult = z.infer<typeof recoveryCodesResultSchema>;
