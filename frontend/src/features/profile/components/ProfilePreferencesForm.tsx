"use client";

import { useFormContext } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { Button, ErrorState, Input, Label, Skeleton } from "@/components/ui";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { formatDateTime, nowUtc } from "@/lib/datetime";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { getProfileClient } from "@/services/profile";

import {
  isOnline,
  profileFormSchema,
  toProfilePatch,
  type ProfileFormValues,
} from "../schemas";

function ProfileFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register, watch } = useFormContext<ProfileFormValues>();
  const preview = formatDateTime(nowUtc().toISOString(), {
    timeZone: watch("timeZone"),
    calendar: watch("calendar"),
    digits: watch("digits"),
    hourCycle: watch("hourCycle"),
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">
            {t(locale, "profile", "firstNameLabel")}
          </Label>
          <Input id="firstName" {...register("firstName")} />
          <SoloFieldError name="firstName" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">
            {t(locale, "profile", "lastNameLabel")}
          </Label>
          <Input id="lastName" {...register("lastName")} />
          <SoloFieldError name="lastName" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">{t(locale, "profile", "emailLabel")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
        />
        <SoloFieldError name="email" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dateOfBirth">{t(locale, "profile", "dobLabel")}</Label>
        <Input
          id="dateOfBirth"
          placeholder="YYYY-MM-DD"
          {...register("dateOfBirth")}
        />
        <SoloFieldError name="dateOfBirth" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="locale">{t(locale, "profile", "localeLabel")}</Label>
          <select
            id="locale"
            className="border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm"
            {...register("locale")}
          >
            <option value="fa">{t(locale, "profile", "locale.fa")}</option>
            <option value="en">{t(locale, "profile", "locale.en")}</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="timeZone">
            {t(locale, "profile", "timeZoneLabel")}
          </Label>
          <select
            id="timeZone"
            className="border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm"
            {...register("timeZone")}
          >
            <option value="Asia/Tehran">Asia/Tehran</option>
            <option value="UTC">UTC</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="calendar">
            {t(locale, "profile", "calendarLabel")}
          </Label>
          <select
            id="calendar"
            className="border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm"
            {...register("calendar")}
          >
            <option value="jalali">
              {t(locale, "profile", "calendar.jalali")}
            </option>
            <option value="gregorian">
              {t(locale, "profile", "calendar.gregorian")}
            </option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="digits">{t(locale, "profile", "digitsLabel")}</Label>
          <select
            id="digits"
            className="border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm"
            {...register("digits")}
          >
            <option value="arabext">
              {t(locale, "profile", "digits.arabext")}
            </option>
            <option value="latn">{t(locale, "profile", "digits.latn")}</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hourCycle">
            {t(locale, "profile", "hourCycleLabel")}
          </Label>
          <select
            id="hourCycle"
            className="border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm"
            {...register("hourCycle")}
          >
            <option value="h23">{t(locale, "profile", "hourCycle.h23")}</option>
            <option value="h12">{t(locale, "profile", "hourCycle.h12")}</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="theme">{t(locale, "profile", "themeLabel")}</Label>
          <select
            id="theme"
            className="border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm"
            {...register("theme")}
          >
            <option value="system">
              {t(locale, "profile", "theme.system")}
            </option>
            <option value="light">{t(locale, "profile", "theme.light")}</option>
            <option value="dark">{t(locale, "profile", "theme.dark")}</option>
          </select>
        </div>
      </div>
      <p className="text-muted text-sm" role="status">
        {t(locale, "profile", "previewLabel")}: {preview}
      </p>
    </div>
  );
}

export function ProfilePreferencesForm() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => getProfileClient().getProfile(),
  });

  if (profileQuery.isLoading) return <Skeleton className="h-48 w-full" />;
  if (profileQuery.isError || !profileQuery.data) {
    return (
      <ErrorState
        title={t(locale, "profile", "loadError")}
        action={
          <Button type="button" onClick={() => void profileQuery.refetch()}>
            {t(locale, "profile", "retry")}
          </Button>
        }
      />
    );
  }

  const profile = profileQuery.data;

  return (
    <div className="mx-auto max-w-2xl space-y-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "profile", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "profile", "subtitle")}</p>
      </header>
      <SoloForm
        schema={profileFormSchema}
        defaultValues={{
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email ?? "",
          dateOfBirth: profile.dateOfBirth ?? "",
          locale: profile.locale,
          timeZone: profile.timeZone,
          calendar: profile.calendar,
          digits: profile.digits,
          hourCycle: profile.hourCycle,
          theme: profile.theme,
        }}
        submitLabel={t(locale, "profile", "save")}
        onSubmit={async (values) => {
          if (!isOnline()) {
            pushFeedback({
              tone: "error",
              title: t(locale, "profile", "offline"),
            });
            return;
          }
          await getProfileClient().updateProfile(toProfilePatch(values));
          await queryClient.invalidateQueries({ queryKey: ["profile"] });
          pushFeedback({
            tone: "success",
            title: t(locale, "profile", "saveSuccess"),
          });
        }}
      >
        <ProfileFields locale={locale} />
      </SoloForm>
    </div>
  );
}
