import { localeDirection, type Locale } from "@/lib/i18n/locales";

import { FoundationControls } from "./FoundationControls";
import { getFoundationMessages } from "../messages";

type FoundationStatusProps = {
  locale: Locale;
};

export function FoundationStatus({ locale }: FoundationStatusProps) {
  const t = getFoundationMessages(locale);
  const dir = localeDirection(locale);

  return (
    <main
      dir={dir}
      className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center gap-8 px-6 py-16"
    >
      <div className="space-y-3">
        <p className="font-display text-brand text-4xl font-semibold tracking-tight sm:text-5xl">
          {t.brand}
        </p>
        <h1 className="font-display text-foreground text-2xl font-medium sm:text-3xl">
          {t.title}
        </h1>
        <p className="text-muted max-w-2xl text-base leading-relaxed sm:text-lg">
          {t.description}
        </p>
      </div>

      <dl className="grid gap-3 text-sm sm:text-base">
        <div className="border-brand flex flex-col gap-1 border-s-2 ps-4">
          <dt className="text-muted">{t.phase}</dt>
          <dd className="text-foreground">{t.layoutNote}</dd>
        </div>
      </dl>

      <FoundationControls locale={locale} labels={t} />
    </main>
  );
}
