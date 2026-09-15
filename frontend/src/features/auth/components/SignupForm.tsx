"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { Input, Label, Button } from "@/components/ui";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { SoloApiError, localizeApiError } from "@/services/api";
import { getAuthClient, safeAuthReturnUrl } from "@/services/auth";
import { resolveLocale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { routes } from "@/lib/routes";

import {
  otpCodeSchema,
  signupSchema,
  toE164,
  type SignupValues,
} from "../schemas";
import { PhoneFields } from "./PhoneFields";
import { withLang } from "../with-lang";
import { z } from "zod";

function NameFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<SignupValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="firstName">{t(locale, "auth", "firstNameLabel")}</Label>
        <Input
          id="firstName"
          autoComplete="given-name"
          {...register("firstName")}
        />
        <SoloFieldError name="firstName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="lastName">{t(locale, "auth", "lastNameLabel")}</Label>
        <Input
          id="lastName"
          autoComplete="family-name"
          {...register("lastName")}
        />
        <SoloFieldError name="lastName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">{t(locale, "auth", "passwordLabel")}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />
        <SoloFieldError name="password" />
      </div>
    </>
  );
}

const otpOnlySchema = z.object({ code: otpCodeSchema });

export function SignupForm() {
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
              await getAuthClient().completeSignup({ challengeId, code });
              pushFeedback({
                tone: "success",
                title: t(locale, "auth", "signupSuccess"),
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
        <Button
          type="button"
          variant="ghost"
          onClick={() => setChallengeId(null)}
        >
          {t(locale, "auth", "passwordLoginLink")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SoloForm
        schema={signupSchema}
        defaultValues={{
          firstName: "",
          lastName: "",
          callingCode: "+98",
          nationalNumber: "",
          password: "",
        }}
        submitLabel={t(locale, "auth", "signupSubmit")}
        onSubmit={async (values) => {
          try {
            const result = await getAuthClient().signup({
              firstName: values.firstName,
              lastName: values.lastName,
              phoneE164: toE164(values.callingCode, values.nationalNumber),
              password: values.password,
            });
            setChallengeId(result.challengeId);
            pushFeedback({
              tone: "info",
              title: t(locale, "auth", "otpSent"),
            });
          } catch (error) {
            const message =
              error instanceof SoloApiError
                ? localizeApiError(error.apiError, locale)
                : t(locale, "auth", "invalidCredentials");
            pushFeedback({ tone: "error", title: message });
          }
        }}
      >
        <NameFields locale={locale} />
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
