"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { Input, Label } from "@/components/ui";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { SoloApiError, localizeApiError } from "@/services/api";
import { getAuthClient } from "@/services/auth";
import { resolveLocale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { routes } from "@/lib/routes";

import {
  otpCodeSchema,
  passwordSchema,
  resetRequestSchema,
  toE164,
} from "../schemas";
import { PhoneFields } from "./PhoneFields";

const confirmSchema = z.object({
  code: otpCodeSchema,
  newPassword: passwordSchema,
});

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const [challengeId, setChallengeId] = useState<string | null>(null);

  if (challengeId) {
    return (
      <div className="space-y-4">
        <SoloForm
          schema={confirmSchema}
          defaultValues={{ code: "", newPassword: "" }}
          submitLabel={t(locale, "auth", "resetConfirmSubmit")}
          onSubmit={async (values) => {
            try {
              await getAuthClient().resetPassword({
                challengeId,
                code: values.code,
                newPassword: values.newPassword,
              });
              pushFeedback({
                tone: "success",
                title: t(locale, "auth", "resetSuccess"),
              });
              router.push(`${routes.auth.login()}?lang=${locale}`);
            } catch (error) {
              const message =
                error instanceof SoloApiError
                  ? localizeApiError(error.apiError, locale)
                  : t(locale, "auth", "invalidOtp");
              pushFeedback({ tone: "error", title: message });
            }
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="code">{t(locale, "auth", "otpLabel")}</Label>
            <CodeInput />
            <SoloFieldError name="code" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">
              {t(locale, "auth", "newPasswordLabel")}
            </Label>
            <PasswordInput />
            <SoloFieldError name="newPassword" />
          </div>
        </SoloForm>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SoloForm
        schema={resetRequestSchema}
        defaultValues={{ callingCode: "+98", nationalNumber: "" }}
        submitLabel={t(locale, "auth", "resetRequestSubmit")}
        onSubmit={async (values) => {
          try {
            const result = await getAuthClient().requestPasswordReset(
              toE164(values.callingCode, values.nationalNumber),
            );
            setChallengeId(result.challengeId);
            pushFeedback({
              tone: "info",
              title: t(locale, "auth", "otpSent"),
            });
          } catch (error) {
            const message =
              error instanceof SoloApiError
                ? localizeApiError(error.apiError, locale)
                : t(locale, "auth", "offline");
            pushFeedback({ tone: "error", title: message });
          }
        }}
      >
        <PhoneFields locale={locale} />
      </SoloForm>
      <Link
        className="text-brand text-sm underline-offset-2 hover:underline"
        href={`${routes.auth.login()}?lang=${locale}`}
      >
        {t(locale, "auth", "loginLink")}
      </Link>
    </div>
  );
}

function CodeInput() {
  const { register } = useFormContext<{ code: string }>();
  return (
    <Input
      id="code"
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      {...register("code")}
    />
  );
}

function PasswordInput() {
  const { register } = useFormContext<{ newPassword: string }>();
  return (
    <Input
      id="newPassword"
      type="password"
      autoComplete="new-password"
      {...register("newPassword")}
    />
  );
}
