"use client";

import { useFormContext } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";

import { Input, Label } from "@/components/ui";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { routes } from "@/lib/routes";
import { getAuthClient } from "@/services/auth";
import {
  getOrganizationClient,
  type OrganizationType,
} from "@/services/organization";

import {
  createOrganizationSchema,
  isOnline,
  type CreateOrganizationValues,
} from "../schemas";

function Fields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateOrganizationValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="org-name">
          {t(locale, "organization", "nameLabel")}
        </Label>
        <Input id="org-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="org-type">
          {t(locale, "organization", "typeLabel")}
        </Label>
        <select
          id="org-type"
          className="border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm"
          {...register("type")}
        >
          <option value="school">
            {t(locale, "organization", "type.school")}
          </option>
          <option value="institute">
            {t(locale, "organization", "type.institute")}
          </option>
        </select>
      </div>
    </>
  );
}

export function CreateOrganizationForm() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const router = useRouter();

  return (
    <div
      className="mx-auto max-w-md space-y-6 px-4 py-10"
      dir={dir}
      lang={locale}
    >
      <header className="space-y-2">
        <p className="font-display text-brand text-3xl font-semibold">Solo</p>
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "organization", "createTitle")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "organization", "createSubtitle")}
        </p>
      </header>
      <SoloForm
        schema={createOrganizationSchema}
        defaultValues={{ name: "", type: "school" }}
        submitLabel={t(locale, "organization", "createSubmit")}
        onSubmit={async (values) => {
          if (!isOnline()) {
            pushFeedback({
              tone: "error",
              title: t(locale, "organization", "offline"),
            });
            return;
          }
          const org = await getOrganizationClient().create({
            name: values.name,
            type: values.type as OrganizationType,
          });
          await getAuthClient().switchPersona("organization");
          await getAuthClient().switchContext({
            organizationId: org.id,
            subjectId: null,
          });
          pushFeedback({
            tone: "success",
            title: t(locale, "organization", "createSuccess"),
          });
          router.push(
            `${routes.organization.home(org.id)}${locale === "en" ? "?lang=en" : "?lang=fa"}`,
          );
        }}
      >
        <Fields locale={locale} />
      </SoloForm>
    </div>
  );
}
