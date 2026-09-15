"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormContext } from "react-hook-form";

import { Input, Label } from "@/components/ui";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { SoloApiError, localizeApiError } from "@/services/api";
import { getAuthClient, safeAuthReturnUrl } from "@/services/auth";
import { resolveLocale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { routes } from "@/lib/routes";

import {
  loginPasswordSchema,
  toE164,
  type LoginPasswordValues,
} from "../schemas";
import { PhoneFields } from "./PhoneFields";
import { withLang } from "../with-lang";

function PasswordField({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<LoginPasswordValues>();
  return (
    <div className="space-y-1.5">
      <Label htmlFor="password">{t(locale, "auth", "passwordLabel")}</Label>
      <Input
        id="password"
        type="password"
        autoComplete="current-password"
        {...register("password")}
      />
      <SoloFieldError name="password" />
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const returnUrl = safeAuthReturnUrl(searchParams.get("returnUrl"));

  return (
    <div className="space-y-4">
      <SoloForm
        schema={loginPasswordSchema}
        defaultValues={{
          callingCode: "+98",
          nationalNumber: "",
          password: "",
        }}
        submitLabel={t(locale, "auth", "loginSubmit")}
        onSubmit={async (values) => {
          if (typeof navigator !== "undefined" && !navigator.onLine) {
            pushFeedback({
              tone: "error",
              title: t(locale, "auth", "offline"),
            });
            return;
          }
          try {
            await getAuthClient().login({
              phoneE164: toE164(values.callingCode, values.nationalNumber),
              password: values.password,
            });
            pushFeedback({
              tone: "success",
              title: t(locale, "auth", "loginSuccess"),
            });
            router.push(withLang(returnUrl, locale));
          } catch (error) {
            const message =
              error instanceof SoloApiError
                ? localizeApiError(error.apiError, locale)
                : t(locale, "auth", "invalidCredentials");
            pushFeedback({ tone: "error", title: message });
          }
        }}
      >
        <PhoneFields locale={locale} />
        <PasswordField locale={locale} />
      </SoloForm>
      <nav
        className="flex flex-col gap-2 text-sm"
        aria-label="Auth alternatives"
      >
        <Link
          className="text-brand underline-offset-2 hover:underline"
          href={`${routes.auth.otp()}?lang=${locale}`}
        >
          {t(locale, "auth", "otpLoginLink")}
        </Link>
        <Link
          className="text-brand underline-offset-2 hover:underline"
          href={`${routes.auth.reset()}?lang=${locale}`}
        >
          {t(locale, "auth", "resetLink")}
        </Link>
        <Link
          className="text-muted underline-offset-2 hover:underline"
          href={`${routes.auth.recover()}?lang=${locale}`}
        >
          {t(locale, "auth", "recoverLink")}
        </Link>
        <Link
          className="text-muted underline-offset-2 hover:underline"
          href={`${routes.auth.signup()}?lang=${locale}`}
        >
          {t(locale, "auth", "signupLink")}
        </Link>
      </nav>
    </div>
  );
}
