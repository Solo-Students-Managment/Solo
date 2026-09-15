"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { Button, Input, Label } from "@/components/ui";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { SoloApiError, localizeApiError } from "@/services/api";
import { getAuthClient, type TwoFactorStatus } from "@/services/auth";

import {
  confirmCodeSchema,
  disableTwoFactorSchema,
  isOnline,
  type ConfirmCodeValues,
  type DisableTwoFactorValues,
} from "../schemas";
import { ReauthForm } from "./ReauthForm";

type TwoFactorPanelProps = {
  locale: Locale;
  status: TwoFactorStatus;
  onChanged: () => void;
};

function CodeField({
  locale,
  id = "confirm-code",
}: {
  locale: Locale;
  id?: string;
}) {
  const { register } = useFormContext<ConfirmCodeValues>();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{t(locale, "security", "confirmCodeLabel")}</Label>
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="one-time-code"
        {...register("code")}
      />
      <SoloFieldError name="code" />
    </div>
  );
}

export function TwoFactorPanel({
  locale,
  status,
  onChanged,
}: TwoFactorPanelProps) {
  const [pendingMethod, setPendingMethod] = useState<"sms" | "totp" | null>(
    null,
  );
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [disabling, setDisabling] = useState(false);

  async function startEnable(method: "sms" | "totp", password: string) {
    if (!isOnline()) {
      pushFeedback({ tone: "error", title: t(locale, "security", "offline") });
      return;
    }
    try {
      const begin = await getAuthClient().beginEnableTwoFactor({
        method,
        password,
      });
      setPendingMethod(method);
      setChallengeId(begin.challengeId);
      setTotpSecret(begin.totpSecret ?? null);
    } catch (error) {
      const message =
        error instanceof SoloApiError
          ? localizeApiError(error.apiError, locale)
          : t(locale, "security", "invalidCredentials");
      pushFeedback({ tone: "error", title: message });
    }
  }

  return (
    <section className="space-y-4" aria-labelledby="two-factor-title">
      <div>
        <h2 id="two-factor-title" className="font-display text-xl font-medium">
          {t(locale, "security", "twoFactorTitle")}
        </h2>
        <p className="text-muted mt-1 text-sm">
          {t(locale, "security", "twoFactorSubtitle")}
        </p>
      </div>
      <p className="text-sm font-medium" role="status">
        {status.enabled
          ? t(locale, "security", "statusEnabled")
          : t(locale, "security", "statusDisabled")}
      </p>
      <ul className="text-muted space-y-1 text-sm">
        <li>
          {t(locale, "security", "methodSms")}: {status.smsEnabled ? "✓" : "—"}
        </li>
        <li>
          {t(locale, "security", "methodTotp")}:{" "}
          {status.totpEnabled ? "✓" : "—"}
        </li>
        <li>
          {t(locale, "security", "methodRecovery", {
            count: status.recoveryCodesRemaining,
          })}
        </li>
      </ul>

      {!status.enabled && !pendingMethod ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => setPendingMethod("sms")}>
            {t(locale, "security", "enableSms")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setPendingMethod("totp")}
          >
            {t(locale, "security", "enableTotp")}
          </Button>
        </div>
      ) : null}

      {pendingMethod && !challengeId ? (
        <ReauthForm
          locale={locale}
          onCancel={() => setPendingMethod(null)}
          onSubmit={async ({ password }) => {
            await startEnable(pendingMethod, password);
          }}
        />
      ) : null}

      {pendingMethod && challengeId ? (
        <div className="space-y-3">
          {totpSecret ? (
            <p className="text-muted text-sm">
              {t(locale, "security", "totpSecretHint")}{" "}
              <span className="text-foreground font-mono">{totpSecret}</span>
            </p>
          ) : null}
          <SoloForm
            schema={confirmCodeSchema}
            defaultValues={{ code: "" }}
            submitLabel={t(locale, "security", "reauthSubmit")}
            onSubmit={async (values) => {
              try {
                const result = await getAuthClient().confirmEnableTwoFactor({
                  challengeId,
                  code: values.code,
                });
                setRecoveryCodes(result.recoveryCodes ?? null);
                setPendingMethod(null);
                setChallengeId(null);
                setTotpSecret(null);
                pushFeedback({
                  tone: "success",
                  title: t(locale, "security", "enableSuccess"),
                });
                onChanged();
              } catch {
                pushFeedback({
                  tone: "error",
                  title: t(locale, "security", "invalidCode"),
                });
              }
            }}
          >
            <CodeField locale={locale} />
          </SoloForm>
        </div>
      ) : null}

      {status.enabled ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="danger"
            onClick={() => setDisabling(true)}
          >
            {t(locale, "security", "disable2fa")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              if (!isOnline()) {
                pushFeedback({
                  tone: "error",
                  title: t(locale, "security", "offline"),
                });
                return;
              }
              setPendingMethod(null);
              setChallengeId("recovery");
            }}
          >
            {t(locale, "security", "regenerateRecovery")}
          </Button>
        </div>
      ) : null}

      {disabling ? (
        <SoloForm
          schema={disableTwoFactorSchema}
          defaultValues={{ password: "", code: "" }}
          submitLabel={t(locale, "security", "disable2fa")}
          onSubmit={async (values: DisableTwoFactorValues) => {
            if (!isOnline()) {
              pushFeedback({
                tone: "error",
                title: t(locale, "security", "offline"),
              });
              return;
            }
            try {
              await getAuthClient().disableTwoFactor(values);
              setDisabling(false);
              pushFeedback({
                tone: "success",
                title: t(locale, "security", "disableSuccess"),
              });
              onChanged();
            } catch {
              pushFeedback({
                tone: "error",
                title: t(locale, "security", "invalidCredentials"),
              });
            }
          }}
        >
          <DisableFields locale={locale} />
        </SoloForm>
      ) : null}

      {challengeId === "recovery" ? (
        <ReauthForm
          locale={locale}
          onCancel={() => setChallengeId(null)}
          onSubmit={async ({ password }) => {
            try {
              const result = await getAuthClient().regenerateRecoveryCodes({
                password,
              });
              setRecoveryCodes(result.recoveryCodes);
              setChallengeId(null);
              pushFeedback({
                tone: "success",
                title: t(locale, "security", "recoverySuccess"),
              });
              onChanged();
            } catch {
              pushFeedback({
                tone: "error",
                title: t(locale, "security", "invalidCredentials"),
              });
            }
          }}
        />
      ) : null}

      {recoveryCodes ? (
        <div className="border-border rounded-md border border-dashed p-4">
          <h3 className="font-medium">
            {t(locale, "security", "recoveryCodesTitle")}
          </h3>
          <p className="text-muted mt-1 text-xs">
            {t(locale, "security", "recoveryCodesHint")}
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-1 font-mono text-sm">
            {recoveryCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
          <Button
            type="button"
            variant="ghost"
            className="mt-3"
            onClick={() => setRecoveryCodes(null)}
          >
            {t(locale, "security", "cancel")}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

function DisableFields({ locale }: { locale: Locale }) {
  const { register } = useFormContext<DisableTwoFactorValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="disable-password">
          {t(locale, "security", "passwordLabel")}
        </Label>
        <Input
          id="disable-password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        <SoloFieldError name="password" />
      </div>
      <CodeField locale={locale} id="disable-code" />
    </>
  );
}
