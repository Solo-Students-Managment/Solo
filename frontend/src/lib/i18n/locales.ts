export const locales = ["fa", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fa";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function localeDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "fa" ? "rtl" : "ltr";
}

export function listLocales(): readonly Locale[] {
  return locales;
}

export function resolveLocale(raw: string | string[] | undefined): Locale {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value && isLocale(value)) {
    return value;
  }
  return defaultLocale;
}

/** Direction can be overridden independently from language. */
export function resolveDirection(
  locale: Locale,
  override?: "rtl" | "ltr",
): "rtl" | "ltr" {
  return override ?? localeDirection(locale);
}
