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
    seller: () => "/personal/seller",
    sellerProducts: () => "/personal/seller/products",
    sellerVariants: () => "/personal/seller/variants",
    sellerOrders: () => "/personal/seller/orders",
    sellerBalance: () => "/personal/seller/balance",
    sellerTaxonomy: () => "/personal/seller/taxonomy",
    sellerAnalytics: () => "/personal/seller/analytics",
    shipping: () => "/personal/shipping",
    wallet: () => "/personal/wallet",
  },
  teacher: {
    home: () => "/teacher",
    publicProfile: () => "/teacher/public-profile",
    activate: () => "/teacher/activate",
    plans: () => "/teacher/plans",
  },
  student: {
    home: () => "/student",
    activate: () => "/student/activate",
    publicPortfolio: () => "/student/public-portfolio",
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
    departments: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/departments`,
    positions: (orgId: string) => `/org/${encodeURIComponent(orgId)}/positions`,
    directory: (orgId: string) => `/org/${encodeURIComponent(orgId)}/directory`,
    roles: (orgId: string) => `/org/${encodeURIComponent(orgId)}/roles`,
    policies: (orgId: string) => `/org/${encodeURIComponent(orgId)}/policies`,
    shifts: (orgId: string) => `/org/${encodeURIComponent(orgId)}/shifts`,
    leave: (orgId: string) => `/org/${encodeURIComponent(orgId)}/leave`,
    staffAttendance: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/staff-attendance`,
    employeeDocuments: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/employee-documents`,
    onboarding: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/onboarding`,
    offboarding: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/offboarding`,
    approvals: (orgId: string) => `/org/${encodeURIComponent(orgId)}/approvals`,
    tasks: (orgId: string) => `/org/${encodeURIComponent(orgId)}/tasks`,
    knowledgeBase: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/knowledge-base`,
    forms: (orgId: string) => `/org/${encodeURIComponent(orgId)}/forms`,
    formSubmissions: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/form-submissions`,
    customization: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/customization`,
    automation: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/automation`,
    crm: (orgId: string) => `/org/${encodeURIComponent(orgId)}/crm`,
    dataOps: (orgId: string) => `/org/${encodeURIComponent(orgId)}/data-ops`,
    events: (orgId: string) => `/org/${encodeURIComponent(orgId)}/events`,
    analytics: (orgId: string) => `/org/${encodeURIComponent(orgId)}/analytics`,
    bulkActions: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/bulk-actions`,
    pricing: (orgId: string) => `/org/${encodeURIComponent(orgId)}/pricing`,
    subscription: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/subscription`,
    planChange: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/plan-change`,
    billing: (orgId: string) => `/org/${encodeURIComponent(orgId)}/billing`,
    usage: (orgId: string) => `/org/${encodeURIComponent(orgId)}/usage`,
    addOns: (orgId: string) => `/org/${encodeURIComponent(orgId)}/add-ons`,
    coupons: (orgId: string) => `/org/${encodeURIComponent(orgId)}/coupons`,
    checkout: (orgId: string) => `/org/${encodeURIComponent(orgId)}/checkout`,
    taxInvoices: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/tax-invoices`,
    cancel: (orgId: string) => `/org/${encodeURIComponent(orgId)}/cancel`,
    planVersions: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/plan-versions`,
    manualBilling: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/manual-billing`,
    audit: (orgId: string) => `/org/${encodeURIComponent(orgId)}/audit`,
    apiKeys: (orgId: string) => `/org/${encodeURIComponent(orgId)}/api-keys`,
    lifecycle: (orgId: string) => `/org/${encodeURIComponent(orgId)}/lifecycle`,
    publicProfile: (orgId: string) =>
      `/org/${encodeURIComponent(orgId)}/public-profile`,
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
    users: () => "/admin/users",
    support: () => "/admin/support",
    verification: () => "/admin/verification",
    audit: () => "/admin/audit",
    announcements: () => "/admin/announcements",
    incidents: () => "/admin/incidents",
    privacy: () => "/admin/privacy",
    featureFlags: () => "/admin/feature-flags",
    storage: () => "/admin/storage",
    marketplaceModeration: () => "/admin/marketplace-moderation",
  },
  marketplace: {
    cart: () => "/cart",
    orders: () => "/orders",
    promos: () => "/promos",
  },
  public: {
    profile: (slug: string) => `/p/${encodeURIComponent(slug)}`,
    form: (slug: string) => `/f/${encodeURIComponent(slug)}`,
    discovery: () => "/discover",
    catalog: () => "/catalog",
    catalogDetail: (slug: string) => `/catalog/${encodeURIComponent(slug)}`,
    trials: () => "/trials",
    reviews: () => "/reviews",
    articles: () => "/articles",
    articlesDetail: (slug: string) => `/articles/${encodeURIComponent(slug)}`,
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
