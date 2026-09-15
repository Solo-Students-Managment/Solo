import type { Locale } from "@/lib/i18n/locales";
import { resolveLocale as resolveLocaleBase } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";

export type FoundationMessages = {
  brand: string;
  title: string;
  description: string;
  phase: string;
  layoutNote: string;
  languageLabel: string;
  themeLabel: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
};

export function getFoundationMessages(locale: Locale): FoundationMessages {
  return {
    brand: t(locale, "foundation", "brand"),
    title: t(locale, "foundation", "title"),
    description: t(locale, "foundation", "description"),
    phase: t(locale, "foundation", "phase"),
    layoutNote: t(locale, "foundation", "layoutNote"),
    languageLabel: t(locale, "foundation", "languageLabel"),
    themeLabel: t(locale, "foundation", "themeLabel"),
    themeLight: t(locale, "foundation", "themeLight"),
    themeDark: t(locale, "foundation", "themeDark"),
    themeSystem: t(locale, "foundation", "themeSystem"),
  };
}

export function resolveLocale(raw: string | string[] | undefined): Locale {
  return resolveLocaleBase(raw);
}
