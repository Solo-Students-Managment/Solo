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
import { getAuthClient, safeAuthReturnUrl } from "@/services/auth";
import { resolveLocale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { routes } from "@/lib/routes";

import { loginOtpRequestSchema, otpCodeSchema, toE164 } from "../schemas";
import { PhoneFields } from "./PhoneFields";
import { withLang } from "../with-lang";

const otpOnlySchema = z.object({ code: otpCodeSchema });

export function OtpLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const returnUrl = safeAuthReturnUrl(searchParams.get("returnUrl"));
  const [challengeId, setChallengeId] = useState<string | null>(null);

  if (challengeId) {
    return (
      <div className="space-y-4">
        <SoloForm
          schema={otpOnlySchema}
          defaultValues={{ code: "" }}
          submitLabel={t(locale, "auth", "otpSubmit")}
          onSubmit={async ({ code }) => {
            try {
              await getAuthClient().verifyOtp({ challengeId, code });
              pushFeedback({
                tone: "success",
                title: t(locale, "auth", "loginSuccess"),
              });
              router.push(withLang(returnUrl, locale));
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
            <OtpInput />
            <SoloFieldError name="code" />
          </div>
        </SoloForm>
        <Link
          className="text-brand text-sm underline-offset-2 hover:underline"
          href={`${routes.auth.login()}?lang=${locale}`}
        >
          {t(locale, "auth", "passwordLoginLink")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SoloForm
        schema={loginOtpRequestSchema}
        defaultValues={{ callingCode: "+98", nationalNumber: "" }}
        submitLabel={t(locale, "auth", "resetRequestSubmit")}
        onSubmit={async (values) => {
          try {
            const result = await getAuthClient().requestOtp(
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
        {t(locale, "auth", "passwordLoginLink")}
      </Link>
    </div>
  );
}

function OtpInput() {
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
