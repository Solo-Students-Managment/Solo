/**
 * Typed route helpers for Solo.
 * Keep shareable UI state in search params; never put PII in URLs.
 */

export const routes = {
  home: (lang?: "fa" | "en") => (lang ? `/?lang=${lang}` : "/"),
} as const;

export type AppRoute = ReturnType<(typeof routes)[keyof typeof routes]>;
