import { z } from "zod";

/** National digits only; compose with calling code into E.164. */
export const CALLING_CODES = [
  { code: "+98", label: "IR +98" },
  { code: "+1", label: "US/CA +1" },
  { code: "+44", label: "UK +44" },
  { code: "+90", label: "TR +90" },
] as const;

export type CallingCode = (typeof CALLING_CODES)[number]["code"];

export function toE164(callingCode: string, nationalNumber: string): string {
  const digits = nationalNumber.replace(/\D/g, "").replace(/^0+/, "");
  const code = callingCode.startsWith("+") ? callingCode : `+${callingCode}`;
  return `${code}${digits}`;
}

export function isValidE164(value: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(value);
}

export const phonePartsSchema = z
  .object({
    callingCode: z.string().regex(/^\+\d{1,4}$/),
    nationalNumber: z
      .string()
      .min(5, "auth.validation.phoneShort")
      .max(15, "auth.validation.phoneLong")
      .regex(/^\d+$/, "auth.validation.phoneDigits"),
  })
  .refine(
    (parts) => isValidE164(toE164(parts.callingCode, parts.nationalNumber)),
    {
      message: "auth.validation.phoneInvalid",
      path: ["nationalNumber"],
    },
  );

export const passwordSchema = z
  .string()
  .min(8, "auth.validation.passwordMin")
  .max(128, "auth.validation.passwordMax");

export const otpCodeSchema = z
  .string()
  .regex(/^\d{6}$/, "auth.validation.otpLength");

export const loginPasswordSchema = phonePartsSchema.and(
  z.object({
    password: passwordSchema,
  }),
);

export const loginOtpRequestSchema = phonePartsSchema;

export const loginOtpVerifySchema = z.object({
  challengeId: z.string().min(1),
  code: otpCodeSchema,
});

export const signupSchema = phonePartsSchema.and(
  z.object({
    firstName: z.string().trim().min(1, "auth.validation.firstName"),
    lastName: z.string().trim().min(1, "auth.validation.lastName"),
    password: passwordSchema,
  }),
);

export const resetRequestSchema = phonePartsSchema;

export const resetConfirmSchema = z.object({
  challengeId: z.string().min(1),
  code: otpCodeSchema,
  newPassword: passwordSchema,
});

export type LoginPasswordValues = z.infer<typeof loginPasswordSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ResetConfirmValues = z.infer<typeof resetConfirmSchema>;
