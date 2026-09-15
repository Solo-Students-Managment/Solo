"use client";

import { useFormContext } from "react-hook-form";

import { Input, Label } from "@/components/ui";
import { SoloFieldError } from "@/components/shared/SoloForm";
import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";

import { CALLING_CODES } from "../schemas";

type PhoneFieldsProps = {
  locale: Locale;
  legend?: string;
  callingCodeName?: string;
  nationalNumberName?: string;
  callingCodeId?: string;
  nationalNumberId?: string;
};

export function PhoneFields({
  locale,
  legend,
  callingCodeName = "callingCode",
  nationalNumberName = "nationalNumber",
  callingCodeId = "callingCode",
  nationalNumberId = "nationalNumber",
}: PhoneFieldsProps) {
  const { register } = useFormContext();

  return (
    <fieldset className="space-y-3">
      <legend className="text-foreground text-sm font-medium">
        {legend ?? t(locale, "auth", "phoneLabel")}
      </legend>
      <div className="grid grid-cols-[7.5rem_1fr] gap-2">
        <div className="space-y-1.5">
          <Label htmlFor={callingCodeId}>
            {t(locale, "auth", "callingCodeLabel")}
          </Label>
          <select
            id={callingCodeId}
            className="border-border bg-elevated text-foreground focus-visible:ring-ring h-10 w-full rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            defaultValue="+98"
            {...register(callingCodeName)}
          >
            {CALLING_CODES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={nationalNumberId}>
            {t(locale, "auth", "nationalNumberLabel")}
          </Label>
          <Input
            id={nationalNumberId}
            inputMode="numeric"
            autoComplete="tel-national"
            {...register(nationalNumberName)}
          />
          <SoloFieldError name={nationalNumberName} />
        </div>
      </div>
    </fieldset>
  );
}
