"use client";

import { useFormContext } from "react-hook-form";

import { Input, Label } from "@/components/ui";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";

import { reauthSchema, type ReauthValues } from "../schemas";

function PasswordField({ locale }: { locale: Locale }) {
  const { register } = useFormContext<ReauthValues>();
  return (
    <div className="space-y-1.5">
      <Label htmlFor="reauth-password">
        {t(locale, "security", "passwordLabel")}
      </Label>
      <Input
        id="reauth-password"
        type="password"
        autoComplete="current-password"
        {...register("password")}
      />
      <SoloFieldError name="password" />
    </div>
  );
}

type ReauthFormProps = {
  locale: Locale;
  onSubmit: (values: ReauthValues) => Promise<void>;
  onCancel: () => void;
};

export function ReauthForm({ locale, onSubmit, onCancel }: ReauthFormProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reauth-title"
      className="border-border bg-elevated space-y-3 rounded-lg border p-4"
    >
      <div>
        <h3 id="reauth-title" className="font-display text-lg font-medium">
          {t(locale, "security", "reauthTitle")}
        </h3>
        <p className="text-muted text-sm">
          {t(locale, "security", "reauthSubtitle")}
        </p>
      </div>
      <SoloForm
        schema={reauthSchema}
        defaultValues={{ password: "" }}
        submitLabel={t(locale, "security", "reauthSubmit")}
        onSubmit={onSubmit}
      >
        <PasswordField locale={locale} />
      </SoloForm>
      <button
        type="button"
        className="text-muted text-sm underline-offset-2 hover:underline"
        onClick={onCancel}
      >
        {t(locale, "security", "cancel")}
      </button>
    </div>
  );
}
