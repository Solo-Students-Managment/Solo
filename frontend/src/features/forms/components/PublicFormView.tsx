"use client";

import { useFormContext } from "react-hook-form";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import {
  EmptyState,
  ErrorState,
  Input,
  Label,
  Skeleton,
} from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { getFormsClient } from "@/services/forms";
import { publicSubmitSchema, type PublicSubmitValues } from "../schemas";

function PublicFields({
  locale,
  questionText,
}: {
  locale: ReturnType<typeof resolveLocale>;
  questionText: string;
}) {
  const { register } = useFormContext<PublicSubmitValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="pub-answer">{questionText}</Label>
        <textarea
          id="pub-answer"
          className="border-border bg-elevated min-h-24 w-full rounded-md border px-2 py-2 text-sm"
          {...register("answerText")}
        />
        <SoloFieldError name="answerText" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pub-name">
          {t(locale, "forms", "consentNameLabel")}
        </Label>
        <Input id="pub-name" {...register("consentName")} />
        <SoloFieldError name="consentName" />
      </div>
      <div className="flex items-start gap-3">
        <input
          id="pub-consent"
          type="checkbox"
          className="mt-1 size-5"
          {...register("consentAccepted")}
        />
        <Label htmlFor="pub-consent">
          {t(locale, "forms", "consentCheckbox")}
        </Label>
      </div>
      <SoloFieldError name="consentAccepted" />
    </>
  );
}

export function PublicFormView() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);

  const formQuery = useQuery({
    queryKey: ["public-form", slug],
    queryFn: () => getFormsClient().getPublic(slug),
  });

  if (formQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (formQuery.isError || !formQuery.data) {
    return (
      <main className="mx-auto max-w-xl space-y-4 p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "forms", "publicNotFound")} />
      </main>
    );
  }

  const form = formQuery.data;

  return (
    <main className="mx-auto max-w-xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">{form.title}</h1>
        <p className="text-muted text-sm">{form.description}</p>
      </header>

      <SoloForm
        schema={publicSubmitSchema}
        defaultValues={{
          answerText: "",
          consentName: "",
          consentAccepted: false,
        }}
        submitLabel={t(locale, "forms", "submitPublic")}
        onSubmit={async (values: PublicSubmitValues) => {
          await getFormsClient().submitPublic(slug, values);
          pushFeedback({
            tone: "success",
            title: t(locale, "forms", "submitSuccess"),
          });
        }}
      >
        <PublicFields locale={locale} questionText={form.questionText} />
      </SoloForm>

      {formQuery.isFetched && !form ? (
        <EmptyState title={t(locale, "forms", "publicNotFound")} />
      ) : null}
    </main>
  );
}
