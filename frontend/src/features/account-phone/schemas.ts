import { z } from "zod";

import {
  otpCodeSchema,
  passwordSchema,
  phonePartsSchema,
  toE164,
  isValidE164,
} from "@/features/auth";

export const changePhoneBeginSchema = phonePartsSchema.and(
  z.object({
    password: passwordSchema,
  }),
);

export const changePhoneConfirmSchema = z.object({
  currentCode: otpCodeSchema,
  newCode: otpCodeSchema,
});

export const supportRecoverySchema = z
  .object({
    firstName: z.string().trim().min(1, "accountPhone.validation.firstName"),
    lastName: z.string().trim().min(1, "accountPhone.validation.lastName"),
    previousCallingCode: z
      .string()
      .regex(/^\+\d{1,4}$/)
      .optional(),
    previousNationalNumber: z.string().optional(),
    callingCode: z.string().regex(/^\+\d{1,4}$/),
    nationalNumber: z
      .string()
      .min(5, "accountPhone.validation.phone")
      .max(15, "accountPhone.validation.phone")
      .regex(/^\d+$/, "accountPhone.validation.phone"),
    details: z.string().trim().min(10, "accountPhone.validation.details"),
  })
  .refine((v) => isValidE164(toE164(v.callingCode, v.nationalNumber)), {
    message: "accountPhone.validation.phone",
    path: ["nationalNumber"],
  });

export type ChangePhoneBeginValues = z.infer<typeof changePhoneBeginSchema>;
export type ChangePhoneConfirmValues = z.infer<typeof changePhoneConfirmSchema>;
export type SupportRecoveryValues = z.infer<typeof supportRecoverySchema>;

export function isOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}
