/**
 * Typed route helpers for Solo.
 * Keep shareable UI state in search params; never put PII in URLs.
 */

export type RouteSurface =
  | "personal"
  | "teacher"
  | "student"
  | "guardian"
  | "organization"
  | "admin"
  | "public"
  | "auth";

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
    profile: () => "/personal/profile",
  },
  teacher: {
    home: () => "/teacher",
    activate: () => "/teacher/activate",
  },
  student: {
    home: () => "/student",
    activate: () => "/student/activate",
  },
  guardian: {
    home: () => "/guardian",
    activate: () => "/guardian/activate",
  },
  organization: {
    home: (orgId: string) => `/org/${encodeURIComponent(orgId)}`,
    create: () => "/org/new",
    members: (orgId: string) => `/org/${encodeURIComponent(orgId)}/members`,
    branches: (orgId: string) => `/org/${encodeURIComponent(orgId)}/branches`,
    facilities: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/facilities`,
    subjects: (orgId: string) => `/org/${encodeURIComponent(orgId)}/subjects`,
    students: (orgId: string) => `/org/${encodeURIComponent(orgId)}/students`,
    student: (orgId: string, studentId: string) =>
      `/org/${encodeURIComponent(orgId)}/students/${encodeURIComponent(studentId)}`,
    courses: (orgId: string) => `/org/${encodeURIComponent(orgId)}/courses`,
    enrollments: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/enrollments`,
    sessions: (orgId: string) => `/org/${encodeURIComponent(orgId)}/sessions`,
    session: (orgId: string, sessionId: string) =>
      `/org/${encodeURIComponent(orgId)}/sessions/${encodeURIComponent(sessionId)}`,
    attendance: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/attendance`,
    assignments: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/assignments`,
    gradebook: (orgId: string) => `/org/${encodeURIComponent(orgId)}/gradebook`,
    evaluations: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/evaluations`,
    questionBank: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/question-bank`,
    exams: (orgId: string) => `/org/${encodeURIComponent(orgId)}/exams`,
    curriculum: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/curriculum`,
    lessonPlans: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/lesson-plans`,
    tuition: (orgId: string) => `/org/${encodeURIComponent(orgId)}/tuition`,
    resources: (orgId: string) => `/org/${encodeURIComponent(orgId)}/resources`,
    reports: (orgId: string) => `/org/${encodeURIComponent(orgId)}/reports`,
  },
  messaging: {
    home: () => "/personal/messages",
  },
  chat: {
    home: () => "/personal/chat",
  },
  notifications: {
    home: () => "/personal/notifications",
  },
  calendar: {
    home: () => "/personal/calendar",
  },
  search: {
    home: () => "/personal/search",
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
