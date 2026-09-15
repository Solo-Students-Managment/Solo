"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { FoundationMessages } from "@/features/foundation/messages";
import type { Locale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils/cn";

type ThemeMode = "light" | "dark" | "system";

type FoundationControlsProps = {
  locale: Locale;
  labels: FoundationMessages;
};

function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = mode === "dark" || (mode === "system" && prefersDark);
  root.classList.toggle("dark", isDark);
  root.dataset.theme = mode;
}

export function FoundationControls({ locale, labels }: FoundationControlsProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
  }, [locale]);

  useEffect(() => {
    const stored = window.sessionStorage.getItem("solo.theme");
    const initial: ThemeMode =
      stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function onThemeChange(next: ThemeMode): void {
    setTheme(next);
    window.sessionStorage.setItem("solo.theme", next);
    applyTheme(next);
  }

  function onLocaleChange(next: Locale): void {
    startTransition(() => {
      router.replace(`/?lang=${next}`);
    });
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted" id="language-label">
          {labels.languageLabel}
        </span>
        <div className="flex gap-2" role="group" aria-labelledby="language-label">
          {(["fa", "en"] as const).map((code) => (
            <button
              key={code}
              type="button"
              disabled={isPending || locale === code}
              onClick={() => onLocaleChange(code)}
              className={cn(
                "rounded-md border border-border bg-elevated px-3 py-2 text-sm text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-default disabled:opacity-60",
                locale === code && "border-brand text-brand",
              )}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted" id="theme-label">
          {labels.themeLabel}
        </span>
        <div className="flex gap-2" role="group" aria-labelledby="theme-label">
          {(
            [
              ["light", labels.themeLight],
              ["dark", labels.themeDark],
              ["system", labels.themeSystem],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={theme === value}
              onClick={() => onThemeChange(value)}
              className={cn(
                "rounded-md border border-border bg-elevated px-3 py-2 text-sm text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                theme === value && "border-brand text-brand",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Link
        href={`/?lang=${locale === "fa" ? "en" : "fa"}`}
        className="sr-only focus:not-sr-only focus:absolute focus:inset-s-4 focus:top-4 focus:rounded-md focus:bg-elevated focus:px-3 focus:py-2 focus:ring-2 focus:ring-ring"
      >
        {locale === "fa" ? "Switch to English" : "رفتن به فارسی"}
      </Link>
    </div>
  );
}
