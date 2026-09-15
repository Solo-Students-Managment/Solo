import type { Locale } from "@/lib/i18n/locales";

/** Preserve UI locale on post-auth redirects without putting PII in the URL. */
export function withLang(path: string, locale: Locale): string {
  const url = new URL(path, "https://solo.local");
  url.searchParams.set("lang", locale);
  return `${url.pathname}${url.search}`;
}
