"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { applyThemeMode, type ThemeMode } from "@/lib/theme/tokens";
import { cn } from "@/lib/utils/cn";

import type { FoundationMessages } from "../messages";

type FoundationControlsProps = {
  locale: Locale;
  labels: FoundationMessages;
};

function applyTheme(mode: ThemeMode): void {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyThemeMode(document.documentElement, mode, prefersDark);
}

export function FoundationControls({
  locale,
  labels,
}: FoundationControlsProps) {
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
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";
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
      router.replace(`/dev/foundation?lang=${next}`);
    });
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        <span className="text-muted text-sm" id="language-label">
          {labels.languageLabel}
        </span>
        <div
          className="flex gap-2"
          role="group"
          aria-labelledby="language-label"
        >
          {(["fa", "en"] as const).map((code) => (
            <button
              key={code}
              type="button"
              disabled={isPending || locale === code}
              onClick={() => onLocaleChange(code)}
              className={cn(
                "border-border bg-elevated text-foreground rounded-md border px-3 py-2 text-sm",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
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
        <span className="text-muted text-sm" id="theme-label">
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
                "border-border bg-elevated text-foreground rounded-md border px-3 py-2 text-sm",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
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
        className="focus:bg-elevated focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:inset-s-4 focus:top-4 focus:rounded-md focus:px-3 focus:py-2 focus:ring-2"
      >
        {locale === "fa" ? "Switch to English" : "رفتن به فارسی"}
      </Link>
    </div>
  );
}
