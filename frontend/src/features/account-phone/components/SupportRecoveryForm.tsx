"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Input, Label } from "@/components/ui";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { AuthShell, PhoneFields, toE164 } from "@/features/auth";
import { resolveLocale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { routes } from "@/lib/routes";
import { getAuthClient } from "@/services/auth";

import {
  isOnline,
  supportRecoverySchema,
  type SupportRecoveryValues,
} from "../schemas";

function TextFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<SupportRecoveryValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="firstName">
          {t(locale, "accountPhone", "firstNameLabel")}
        </Label>
        <Input
          id="firstName"
          autoComplete="given-name"
          {...register("firstName")}
        />
        <SoloFieldError name="firstName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="lastName">
          {t(locale, "accountPhone", "lastNameLabel")}
        </Label>
        <Input
          id="lastName"
          autoComplete="family-name"
          {...register("lastName")}
        />
        <SoloFieldError name="lastName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="details">
          {t(locale, "accountPhone", "detailsLabel")}
        </Label>
        <textarea
          id="details"
          rows={4}
          className="border-border bg-elevated text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          {...register("details")}
        />
        <p className="text-muted text-xs">
          {t(locale, "accountPhone", "detailsHint")}
        </p>
        <SoloFieldError name="details" />
      </div>
    </>
  );
}

export function SupportRecoveryForm() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const [ticketId, setTicketId] = useState<string | null>(null);

  if (ticketId) {
    return (
      <AuthShell
        namespace="accountPhone"
        titleKey="recoveryTitle"
        subtitleKey="recoverySubtitle"
      >
        <p className="text-sm" role="status">
          {t(locale, "accountPhone", "recoverySuccess", { ticketId })}
        </p>
        <Link
          className="text-brand mt-4 inline-block text-sm underline-offset-2 hover:underline"
          href={`${routes.auth.login()}?lang=${locale}`}
        >
          {t(locale, "accountPhone", "backToLogin")}
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      namespace="accountPhone"
      titleKey="recoveryTitle"
      subtitleKey="recoverySubtitle"
    >
      <SoloForm
        schema={supportRecoverySchema}
        defaultValues={{
          firstName: "",
          lastName: "",
          previousCallingCode: "+98",
          previousNationalNumber: "",
          callingCode: "+98",
          nationalNumber: "",
          details: "",
        }}
        submitLabel={t(locale, "accountPhone", "recoverySubmit")}
        onSubmit={async (values) => {
          if (!isOnline()) {
            pushFeedback({
              tone: "error",
              title: t(locale, "accountPhone", "offline"),
            });
            return;
          }
          try {
            const previous =
              values.previousNationalNumber && values.previousCallingCode
                ? toE164(
                    values.previousCallingCode,
                    values.previousNationalNumber,
                  )
                : undefined;
            const result = await getAuthClient().requestSupportRecovery({
              firstName: values.firstName,
              lastName: values.lastName,
              previousPhoneE164: previous,
              contactPhoneE164: toE164(
                values.callingCode,
                values.nationalNumber,
              ),
              details: values.details,
            });
            setTicketId(result.ticketId);
          } catch {
            pushFeedback({
              tone: "error",
              title: t(locale, "accountPhone", "recoveryInvalid"),
            });
          }
        }}
      >
        <TextFields locale={locale} />
        <PhoneFields
          locale={locale}
          legend={t(locale, "accountPhone", "previousPhoneLegend")}
          callingCodeName="previousCallingCode"
          nationalNumberName="previousNationalNumber"
          callingCodeId="previousCallingCode"
          nationalNumberId="previousNationalNumber"
        />
        <PhoneFields
          locale={locale}
          legend={t(locale, "accountPhone", "contactPhoneLegend")}
          callingCodeId="contactCallingCode"
          nationalNumberId="contactNationalNumber"
        />
      </SoloForm>
      <Link
        className="text-muted mt-4 inline-block text-sm underline-offset-2 hover:underline"
        href={`${routes.auth.login()}?lang=${locale}`}
      >
        {t(locale, "accountPhone", "backToLogin")}
      </Link>
    </AuthShell>
  );
}
