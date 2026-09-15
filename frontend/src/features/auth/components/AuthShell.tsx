"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t, type MessageNamespace } from "@/lib/i18n/t";

type AuthShellProps = {
  titleKey: string;
  subtitleKey: string;
  namespace?: MessageNamespace;
  children: React.ReactNode;
};

export function AuthShell({
  titleKey,
  subtitleKey,
  namespace = "auth",
  children,
}: AuthShellProps) {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const ns = namespace;

  return (
    <main
      className="bg-background text-foreground flex min-h-dvh flex-col items-center justify-center px-4 py-10"
      dir={dir}
      lang={locale}
    >
      <div className="w-full max-w-md space-y-8">
        <header className="space-y-2 text-center">
          <p className="font-display text-brand text-3xl font-semibold tracking-tight">
            {t(locale, "auth", "brand")}
          </p>
          <h1 className="font-display text-2xl font-medium">
            {t(locale, ns, titleKey)}
          </h1>
          <p className="text-muted text-sm">{t(locale, ns, subtitleKey)}</p>
        </header>
        <div className="bg-elevated border-border rounded-lg border p-6 shadow-sm">
          {children}
        </div>
        <p className="text-muted text-center text-xs">
          {t(locale, "auth", "demoHint")}
        </p>
        <div className="flex justify-center gap-3 text-sm">
          <Link
            className="text-muted underline-offset-2 hover:underline"
            href={`?lang=${locale === "fa" ? "en" : "fa"}`}
          >
            {locale === "fa" ? "EN" : "FA"}
          </Link>
        </div>
      </div>
    </main>
  );
}
