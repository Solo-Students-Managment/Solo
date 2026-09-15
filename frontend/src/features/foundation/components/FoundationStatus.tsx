import { localeDirection, type Locale } from "@/lib/i18n/locales";
import { getFoundationMessages } from "@/features/foundation/messages";
import { FoundationControls } from "@/features/foundation/components/FoundationControls";

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
        <p className="font-display text-4xl font-semibold tracking-tight text-brand sm:text-5xl">
          {t.brand}
        </p>
        <h1 className="font-display text-2xl font-medium text-foreground sm:text-3xl">
          {t.title}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {t.description}
        </p>
      </div>

      <dl className="grid gap-3 text-sm sm:text-base">
        <div className="flex flex-col gap-1 border-s-2 border-brand ps-4">
          <dt className="text-muted">{t.phase}</dt>
          <dd className="text-foreground">{t.layoutNote}</dd>
        </div>
      </dl>

      <FoundationControls locale={locale} labels={t} />
    </main>
  );
}
