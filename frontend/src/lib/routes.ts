/**
 * Typed route helpers for Solo.
 * Keep shareable UI state in search params; never put PII in URLs.
 */

export type RouteSurface =
  "personal" | "teacher" | "organization" | "admin" | "public" | "auth";

export type ListSearchParams = {
  tab?: string;
  page?: number;
  sort?: string;
  filter?: string;
  view?: string;
};

export const routes = {
  home: (lang?: "fa" | "en") => (lang ? `/?lang=${lang}` : "/"),
  auth: {
    login: () => "/auth/login",
    signup: () => "/auth/signup",
    otp: () => "/auth/otp",
    reset: () => "/auth/reset",
    recover: () => "/auth/recover",
  },
  personal: {
    home: () => "/personal",
    security: () => "/personal/security",
    phone: () => "/personal/phone",
  },
  teacher: {
    home: () => "/teacher",
  },
  organization: {
    home: (orgId: string) => `/org/${encodeURIComponent(orgId)}`,
  },
  admin: {
    home: () => "/admin",
  },
  public: {
    profile: (slug: string) => `/p/${encodeURIComponent(slug)}`,
  },
  states: {
    notFound: () => "/state/not-found",
    forbidden: () => "/state/forbidden",
    deleted: () => "/state/deleted",
    archived: () => "/state/archived",
  },
} as const;

export type AppHomeRoute = ReturnType<(typeof routes)["home"]>;

export function isAppHomeRoute(value: string): value is AppHomeRoute {
  return value === "/" || value.startsWith("/?lang=");
}

export function buildListSearch(params: ListSearchParams): string {
  const search = new URLSearchParams();
  if (params.tab) search.set("tab", params.tab);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  if (params.sort) search.set("sort", params.sort);
  if (params.filter) search.set("filter", params.filter);
  if (params.view) search.set("view", params.view);
  const value = search.toString();
  return value ? `?${value}` : "";
}

const SAFE_RETURN_PATH = /^\/(?!\/)[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]*$/;

export function validateReturnUrl(
  candidate: string | null | undefined,
  fallback = "/",
): string {
  if (!candidate) return fallback;
  if (!candidate.startsWith("/")) return fallback;
  if (candidate.startsWith("//")) return fallback;
  if (!SAFE_RETURN_PATH.test(candidate)) return fallback;
  if (/token|password|otp|phone=/i.test(candidate)) return fallback;
  return candidate;
}

export function withReturnUrl(path: string, returnUrl: string): string {
  const safe = validateReturnUrl(returnUrl);
  const url = new URL(path, "https://solo.local");
  url.searchParams.set("returnUrl", safe);
  return `${url.pathname}${url.search}`;
}
