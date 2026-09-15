/**
 * Typed route helpers for Solo.
 * Keep shareable UI state in search params; never put PII in URLs.
 */

export const routes = {
  home: (lang?: "fa" | "en") => (lang ? `/?lang=${lang}` : "/"),
} as const;

export type AppHomeRoute = ReturnType<(typeof routes)["home"]>;

export function isAppHomeRoute(value: string): value is AppHomeRoute {
  return value === "/" || value.startsWith("/?lang=");
}
