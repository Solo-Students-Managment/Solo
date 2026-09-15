"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { Input, Label, ErrorState, Skeleton } from "@/components/ui";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { PhoneFields, toE164 } from "@/features/auth";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { getAuthClient } from "@/services/auth";

import {
  changePhoneBeginSchema,
  changePhoneConfirmSchema,
  isOnline,
  type ChangePhoneBeginValues,
  type ChangePhoneConfirmValues,
} from "../schemas";

function PasswordField({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<ChangePhoneBeginValues>();
  return (
    <div className="space-y-1.5">
      <Label htmlFor="change-phone-password">
        {t(locale, "accountPhone", "passwordLabel")}
      </Label>
      <Input
        id="change-phone-password"
        type="password"
        autoComplete="current-password"
        {...register("password")}
      />
      <SoloFieldError name="password" />
    </div>
  );
}

function OtpFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<ChangePhoneConfirmValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="currentCode">
          {t(locale, "accountPhone", "currentCodeLabel")}
        </Label>
        <Input
          id="currentCode"
          inputMode="numeric"
          autoComplete="one-time-code"
          {...register("currentCode")}
        />
        <SoloFieldError name="currentCode" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newCode">
          {t(locale, "accountPhone", "newCodeLabel")}
        </Label>
        <Input
          id="newCode"
          inputMode="numeric"
          autoComplete="one-time-code"
          {...register("newCode")}
        />
        <SoloFieldError name="newCode" />
      </div>
    </>
  );
}

export function ChangePhoneForm() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const [challenge, setChallenge] = useState<{
    currentChallengeId: string;
    newChallengeId: string;
    currentPhoneMasked: string;
  } | null>(null);

  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const session = sessionQuery.data ?? null;
  const capability = resolveCapability(session, "account.phone.change");

  if (sessionQuery.isLoading) return <Skeleton className="h-40 w-full" />;
  if (!session || !capability.allowed) {
    const reasonKey =
      capability.reason === "reauth_required"
        ? "reason.reauth_required"
        : "reason.permission";
    return (
      <ErrorState
        title={t(locale, "accountPhone", "capabilityDenied")}
        description={t(locale, "accountPhone", reasonKey)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "accountPhone", "changeTitle")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "accountPhone", "changeSubtitle")}
        </p>
      </header>

      {!challenge ? (
        <SoloForm
          schema={changePhoneBeginSchema}
          defaultValues={{
            callingCode: "+98",
            nationalNumber: "",
            password: "",
          }}
          submitLabel={t(locale, "accountPhone", "beginSubmit")}
          onSubmit={async (values) => {
            if (!isOnline()) {
              pushFeedback({
                tone: "error",
                title: t(locale, "accountPhone", "offline"),
              });
              return;
            }
            try {
              const result = await getAuthClient().beginChangePhone({
                password: values.password,
                newPhoneE164: toE164(values.callingCode, values.nationalNumber),
              });
              setChallenge(result);
            } catch {
              pushFeedback({
                tone: "error",
                title: t(locale, "accountPhone", "invalidCredentials"),
              });
            }
          }}
        >
          <PasswordField locale={locale} />
          <PhoneFields
            locale={locale}
            legend={t(locale, "accountPhone", "newPhoneLegend")}
          />
        </SoloForm>
      ) : (
        <div className="space-y-4">
          <p className="text-muted text-sm" role="status">
            {t(locale, "accountPhone", "currentMasked", {
              masked: challenge.currentPhoneMasked,
            })}
          </p>
          <SoloForm
            schema={changePhoneConfirmSchema}
            defaultValues={{ currentCode: "", newCode: "" }}
            submitLabel={t(locale, "accountPhone", "confirmSubmit")}
            onSubmit={async (values) => {
              if (!isOnline()) {
                pushFeedback({
                  tone: "error",
                  title: t(locale, "accountPhone", "offline"),
                });
                return;
              }
              try {
                await getAuthClient().confirmChangePhone({
                  currentChallengeId: challenge.currentChallengeId,
                  newChallengeId: challenge.newChallengeId,
                  currentCode: values.currentCode,
                  newCode: values.newCode,
                });
                setChallenge(null);
                pushFeedback({
                  tone: "success",
                  title: t(locale, "accountPhone", "changeSuccess"),
                });
              } catch {
                pushFeedback({
                  tone: "error",
                  title: t(locale, "accountPhone", "invalidOtp"),
                });
              }
            }}
          >
            <OtpFields locale={locale} />
          </SoloForm>
        </div>
      )}
    </div>
  );
}
