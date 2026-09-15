import { http, HttpResponse, delay } from "msw";
import { z } from "zod";

import type { ApiError } from "@/services/api";
import { opaqueIdSchema } from "@/services/api";
import {
  deviceSessionSchema,
  maskPhoneE164,
  sessionSchema,
  twoFactorStatusSchema,
  type DeviceSession,
  type TwoFactorStatus,
} from "@/services/auth/client";
import { userProfileSchema, type UserProfile } from "@/services/profile";
import {
  availableContextSchema,
  availablePersonaSchema,
  teacherDashboardSchema,
  type AvailableContext,
} from "@/services/home";
import { organizationSchema, type Organization } from "@/services/organization";
import {
  ASSIGNABLE_ORG_ROLES,
  inviteStaffResultSchema,
  orgMemberSchema,
  orgRoleSchema,
  resolveOrgRoleForUser,
  seedOwnerMembership,
  type OrgMember,
  type OrgRole,
} from "@/services/organization/members";
import {
  studentDashboardSchema,
  studentRelationshipSchema,
  type StudentRelationship,
} from "@/services/student";

export type MockScenario =
  | "success"
  | "empty"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "server_error"
  | "offline";

let scenario: MockScenario = "success";
let latencyMs = 0;

type PendingChallenge = {
  phoneE164: string;
  purpose: "login" | "signup" | "reset" | "2fa_sms" | "2fa_totp";
  firstName?: string;
  lastName?: string;
  passwordHashStub?: string;
};

const challenges = new Map<string, PendingChallenge>();
let currentSession: z.infer<typeof sessionSchema> | null = null;
let twoFactorStatus: TwoFactorStatus = {
  enabled: false,
  smsEnabled: false,
  totpEnabled: false,
  recoveryCodesRemaining: 0,
  orgRequires2fa: false,
  adminMandatory: false,
};
let deviceSessions: DeviceSession[] = [];
let currentPhoneE164 = "+989121234567";
let mockProfile: UserProfile | null = null;
const mockOrgs = new Map<string, Organization>();
const mockMembersByOrg = new Map<
  string,
  Array<OrgMember & { phoneE164: string; userId: string | null }>
>();
let mockPersonas = [
  {
    persona: "teacher" as const,
    activated: true,
    labelKey: "home.persona.teacher",
  },
  {
    persona: "student" as const,
    activated: false,
    labelKey: "home.persona.student",
  },
  {
    persona: "guardian" as const,
    activated: false,
    labelKey: "home.persona.guardian",
  },
];
let mockContexts: AvailableContext[] = [
  {
    id: null,
    kind: "personal",
    label: "Personal",
    organizationId: null,
  },
];
let mockTeacherDash = {
  plan: "teacher_free" as const,
  studentsCount: 2,
  classesCount: 1,
  upcomingSessionsCount: 1,
};
let mockPendingStudentRels: StudentRelationship[] = [
  studentRelationshipSchema.parse({
    id: opaqueIdSchema.parse("rel_stu_pending_1"),
    organizationName: "Demo School",
    subjectLabel: "Mathematics",
    teacherDisplayName: "Ms. Rezaei",
    status: "pending",
  }),
];
let mockActiveStudentRels: StudentRelationship[] = [];
let mockStudentDash = {
  activeSubjectsCount: 0,
  upcomingSessionsCount: 0,
  openAssignmentsCount: 0,
  relationships: [] as StudentRelationship[],
};
let pendingPhoneChange: {
  currentChallengeId: string;
  newChallengeId: string;
  newPhoneE164: string;
} | null = null;

const DEMO_PHONE = "+989121234567";
const DEMO_PASSWORD = "Password1";
const DEMO_OTP = "123456";

export function setMockScenario(next: MockScenario): void {
  scenario = next;
}

export function setMockLatency(ms: number): void {
  latencyMs = Math.max(0, ms);
}

export function getMockScenario(): MockScenario {
  return scenario;
}

function errorBody(status: number, code: string, messageKey: string): ApiError {
  return {
    code,
    messageKey,
    status,
    fieldErrors: {},
    requestId: `req_${code.toLowerCase()}`,
  };
}

async function maybeFail() {
  await delay(latencyMs);
  if (scenario === "offline") {
    return HttpResponse.error();
  }
  if (scenario === "rate_limited") {
    return HttpResponse.json(
      errorBody(429, "RATE_LIMITED", "errors.rate_limited"),
      { status: 429 },
    );
  }
  if (scenario === "server_error") {
    return HttpResponse.json(errorBody(500, "SERVER", "errors.server"), {
      status: 500,
    });
  }
  return null;
}

function makeSession(displayName: string, phoneE164: string) {
  return sessionSchema.parse({
    userId: opaqueIdSchema.parse(`usr_${phoneE164.replace(/\D/g, "")}`),
    displayName,
    activePersona: "teacher",
    organizationId: null,
    subjectId: null,
    orgRole: null,
    expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
    requiresReauth: false,
  });
}

function resetTwoFactor(): void {
  twoFactorStatus = twoFactorStatusSchema.parse({
    enabled: false,
    smsEnabled: false,
    totpEnabled: false,
    recoveryCodesRemaining: 0,
    orgRequires2fa: false,
    adminMandatory: false,
  });
}

function seedSessions(userId: string): void {
  const now = Date.now();
  deviceSessions = [
    deviceSessionSchema.parse({
      id: opaqueIdSchema.parse(`ses_current_${userId}`),
      deviceLabel: "This browser",
      locationHint: "Tehran",
      userAgentSummary: "Chrome · macOS",
      lastActiveAt: new Date(now).toISOString(),
      createdAt: new Date(now - 86_400_000).toISOString(),
      expiresAt: new Date(now + 7 * 86_400_000).toISOString(),
      isCurrent: true,
    }),
    deviceSessionSchema.parse({
      id: opaqueIdSchema.parse(`ses_other_${userId}`),
      deviceLabel: "iPhone",
      locationHint: "Isfahan",
      userAgentSummary: "Safari · iOS",
      lastActiveAt: new Date(now - 3_600_000).toISOString(),
      createdAt: new Date(now - 7 * 86_400_000).toISOString(),
      expiresAt: new Date(now + 7 * 86_400_000).toISOString(),
      isCurrent: false,
    }),
  ];
}

function newChallengeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function requireAuth() {
  if (!currentSession) {
    return HttpResponse.json(
      errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
      { status: 401 },
    );
  }
  return null;
}

const students = [
  { id: "stu_1", displayName: "Sara" },
  { id: "stu_2", displayName: "Ali" },
];

export const handlers = [
  http.get("/api/health", async () => {
    await delay(latencyMs);
    return HttpResponse.json({ ok: true, scenario });
  }),

  http.get("/api/students", async () => {
    await delay(latencyMs);

    if (scenario === "offline") {
      return HttpResponse.error();
    }
    if (scenario === "forbidden") {
      return HttpResponse.json(
        errorBody(403, "FORBIDDEN", "errors.forbidden"),
        { status: 403 },
      );
    }
    if (scenario === "not_found") {
      return HttpResponse.json(
        errorBody(404, "NOT_FOUND", "errors.not_found"),
        { status: 404 },
      );
    }
    if (scenario === "conflict") {
      return HttpResponse.json(
        errorBody(409, "CONFLICT", "errors.validation"),
        { status: 409 },
      );
    }
    if (scenario === "rate_limited") {
      return HttpResponse.json(
        errorBody(429, "RATE_LIMITED", "errors.rate_limited"),
        { status: 429 },
      );
    }
    if (scenario === "server_error") {
      return HttpResponse.json(errorBody(500, "SERVER", "errors.server"), {
        status: 500,
      });
    }
    if (scenario === "empty") {
      return HttpResponse.json({
        data: [],
        meta: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
      });
    }

    return HttpResponse.json({
      data: students,
      meta: {
        page: 1,
        pageSize: 20,
        totalItems: students.length,
        totalPages: 1,
      },
    });
  }),

  http.get("/api/auth/session", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    if (!currentSession) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    return HttpResponse.json(currentSession);
  }),

  http.post("/api/auth/login", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const body = (await request.json()) as {
      phoneE164?: string;
      password?: string;
    };
    if (body.phoneE164 !== DEMO_PHONE || body.password !== DEMO_PASSWORD) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    currentSession = makeSession("Demo User", body.phoneE164);
    currentPhoneE164 = body.phoneE164;
    pendingPhoneChange = null;
    resetTwoFactor();
    seedSessions(currentSession.userId);
    return HttpResponse.json(currentSession);
  }),

  http.post("/api/auth/logout", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    currentSession = null;
    deviceSessions = [];
    pendingPhoneChange = null;
    currentPhoneE164 = DEMO_PHONE;
    resetTwoFactor();
    return HttpResponse.json({ ok: true });
  }),

  http.post("/api/auth/signup", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const body = (await request.json()) as {
      firstName: string;
      lastName: string;
      phoneE164: string;
      password: string;
    };
    const challengeId = newChallengeId("otp_signup");
    challenges.set(challengeId, {
      phoneE164: body.phoneE164,
      purpose: "signup",
      firstName: body.firstName,
      lastName: body.lastName,
      passwordHashStub: body.password ? "set" : undefined,
    });
    return HttpResponse.json({ challengeId });
  }),

  http.post("/api/auth/signup/verify", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const body = (await request.json()) as {
      challengeId: string;
      code: string;
    };
    const challenge = challenges.get(body.challengeId);
    if (
      !challenge ||
      challenge.purpose !== "signup" ||
      body.code !== DEMO_OTP
    ) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    challenges.delete(body.challengeId);
    currentSession = makeSession(
      `${challenge.firstName ?? "New"} ${challenge.lastName ?? "User"}`,
      challenge.phoneE164,
    );
    seedSessions(currentSession.userId);
    return HttpResponse.json(currentSession);
  }),

  http.post("/api/auth/otp/request", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const body = (await request.json()) as { phoneE164: string };
    const challengeId = newChallengeId("otp_login");
    challenges.set(challengeId, {
      phoneE164: body.phoneE164,
      purpose: "login",
    });
    return HttpResponse.json({ challengeId });
  }),

  http.post("/api/auth/otp/verify", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const body = (await request.json()) as {
      challengeId: string;
      code: string;
    };
    const challenge = challenges.get(body.challengeId);
    if (!challenge || body.code !== DEMO_OTP) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    challenges.delete(body.challengeId);
    currentSession = makeSession("OTP User", challenge.phoneE164);
    seedSessions(currentSession.userId);
    return HttpResponse.json(currentSession);
  }),

  http.post("/api/auth/password/reset/request", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const body = (await request.json()) as { phoneE164: string };
    const challengeId = newChallengeId("otp_reset");
    challenges.set(challengeId, {
      phoneE164: body.phoneE164,
      purpose: "reset",
    });
    return HttpResponse.json({ challengeId });
  }),

  http.post("/api/auth/password/reset/confirm", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const body = (await request.json()) as {
      challengeId: string;
      code: string;
      newPassword: string;
    };
    const challenge = challenges.get(body.challengeId);
    if (
      !challenge ||
      challenge.purpose !== "reset" ||
      body.code !== DEMO_OTP ||
      !body.newPassword
    ) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    challenges.delete(body.challengeId);
    return HttpResponse.json({ ok: true });
  }),

  http.post("/api/auth/reauth", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as { password?: string };
    if (body.password !== DEMO_PASSWORD) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    currentSession = { ...currentSession!, requiresReauth: false };
    return HttpResponse.json({ ok: true });
  }),

  http.get("/api/auth/2fa", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    return HttpResponse.json(twoFactorStatus);
  }),

  http.post("/api/auth/2fa/enable/begin", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as {
      method?: "sms" | "totp";
      password?: string;
    };
    if (body.password !== DEMO_PASSWORD || !body.method) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    const challengeId = newChallengeId(`2fa_${body.method}`);
    challenges.set(challengeId, {
      phoneE164: DEMO_PHONE,
      purpose: body.method === "totp" ? "2fa_totp" : "2fa_sms",
    });
    currentSession = { ...currentSession!, requiresReauth: false };
    if (body.method === "totp") {
      return HttpResponse.json({
        challengeId,
        totpSecret: "SOLODEMOSECRET",
        totpUri: "otpauth://totp/Solo:demo?secret=SOLODEMOSECRET&issuer=Solo",
      });
    }
    return HttpResponse.json({ challengeId });
  }),

  http.post("/api/auth/2fa/enable/confirm", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as {
      challengeId?: string;
      code?: string;
    };
    const challenge = body.challengeId
      ? challenges.get(body.challengeId)
      : undefined;
    if (
      !challenge ||
      (challenge.purpose !== "2fa_sms" && challenge.purpose !== "2fa_totp") ||
      body.code !== DEMO_OTP
    ) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    challenges.delete(body.challengeId!);
    twoFactorStatus = twoFactorStatusSchema.parse({
      enabled: true,
      smsEnabled: challenge.purpose === "2fa_sms",
      totpEnabled: challenge.purpose === "2fa_totp",
      recoveryCodesRemaining: 8,
      orgRequires2fa: false,
      adminMandatory: false,
    });
    return HttpResponse.json({
      recoveryCodes: [
        "RCVR-1111",
        "RCVR-2222",
        "RCVR-3333",
        "RCVR-4444",
        "RCVR-5555",
        "RCVR-6666",
        "RCVR-7777",
        "RCVR-8888",
      ],
      status: twoFactorStatus,
    });
  }),

  http.post("/api/auth/2fa/disable", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as {
      password?: string;
      code?: string;
    };
    if (body.password !== DEMO_PASSWORD || body.code !== DEMO_OTP) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    resetTwoFactor();
    return HttpResponse.json(twoFactorStatus);
  }),

  http.post("/api/auth/2fa/recovery/regenerate", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as { password?: string };
    if (body.password !== DEMO_PASSWORD || !twoFactorStatus.enabled) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    twoFactorStatus = {
      ...twoFactorStatus,
      recoveryCodesRemaining: 8,
    };
    return HttpResponse.json({
      recoveryCodes: [
        "RCVR-AAAA",
        "RCVR-BBBB",
        "RCVR-CCCC",
        "RCVR-DDDD",
        "RCVR-EEEE",
        "RCVR-FFFF",
        "RCVR-GGGG",
        "RCVR-HHHH",
      ],
    });
  }),

  http.get("/api/auth/sessions", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    if (deviceSessions.length === 0 && currentSession) {
      seedSessions(currentSession.userId);
    }
    if (scenario === "empty") {
      return HttpResponse.json(deviceSessions.filter((s) => s.isCurrent));
    }
    return HttpResponse.json(deviceSessions);
  }),

  http.delete("/api/auth/sessions/:sessionId", async ({ params, request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as { password?: string };
    if (body.password !== DEMO_PASSWORD) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    const sessionId = String(params.sessionId);
    const target = deviceSessions.find((s) => s.id === sessionId);
    if (!target) {
      return HttpResponse.json(
        errorBody(404, "NOT_FOUND", "errors.not_found"),
        { status: 404 },
      );
    }
    if (target.isCurrent) {
      return HttpResponse.json(
        errorBody(409, "CONFLICT", "errors.validation"),
        { status: 409 },
      );
    }
    deviceSessions = deviceSessions.filter((s) => s.id !== sessionId);
    return HttpResponse.json({ ok: true });
  }),

  http.post("/api/auth/sessions/revoke-others", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as { password?: string };
    if (body.password !== DEMO_PASSWORD) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    deviceSessions = deviceSessions.filter((s) => s.isCurrent);
    return HttpResponse.json({ ok: true });
  }),

  http.post("/api/auth/phone/change/begin", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as {
      password?: string;
      newPhoneE164?: string;
    };
    if (body.password !== DEMO_PASSWORD || !body.newPhoneE164) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    if (body.newPhoneE164 === currentPhoneE164) {
      return HttpResponse.json(
        errorBody(409, "CONFLICT", "errors.validation"),
        { status: 409 },
      );
    }
    const currentChallengeId = newChallengeId("phone_cur");
    const newChallengeIdValue = newChallengeId("phone_new");
    pendingPhoneChange = {
      currentChallengeId,
      newChallengeId: newChallengeIdValue,
      newPhoneE164: body.newPhoneE164,
    };
    currentSession = { ...currentSession!, requiresReauth: false };
    return HttpResponse.json({
      currentChallengeId,
      newChallengeId: newChallengeIdValue,
      currentPhoneMasked: maskPhoneE164(currentPhoneE164),
    });
  }),

  http.post("/api/auth/phone/change/confirm", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as {
      currentChallengeId?: string;
      currentCode?: string;
      newChallengeId?: string;
      newCode?: string;
    };
    if (
      !pendingPhoneChange ||
      body.currentChallengeId !== pendingPhoneChange.currentChallengeId ||
      body.newChallengeId !== pendingPhoneChange.newChallengeId ||
      body.currentCode !== DEMO_OTP ||
      body.newCode !== DEMO_OTP
    ) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    currentPhoneE164 = pendingPhoneChange.newPhoneE164;
    const phoneMasked = maskPhoneE164(currentPhoneE164);
    pendingPhoneChange = null;
    return HttpResponse.json({ phoneMasked });
  }),

  http.post("/api/auth/recovery/support", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const body = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      previousPhoneE164?: string;
      contactPhoneE164?: string;
      details?: string;
    };
    if (
      !body.firstName ||
      !body.lastName ||
      !body.contactPhoneE164 ||
      !body.details?.trim()
    ) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "errors.validation"),
        { status: 400 },
      );
    }
    return HttpResponse.json({
      ticketId: newChallengeId("tkt"),
      status: "submitted",
    });
  }),

  http.get("/api/me/profile", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    if (!mockProfile) {
      mockProfile = userProfileSchema.parse({
        userId: currentSession!.userId,
        firstName: "Demo",
        lastName: "User",
        email: null,
        dateOfBirth: null,
        locale: "fa",
        timeZone: "Asia/Tehran",
        calendar: "jalali",
        digits: "arabext",
        hourCycle: "h23",
        theme: "system",
      });
    }
    return HttpResponse.json(mockProfile);
  }),

  http.patch("/api/me/profile", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as Partial<UserProfile>;
    if (!mockProfile) {
      mockProfile = userProfileSchema.parse({
        userId: currentSession!.userId,
        firstName: "Demo",
        lastName: "User",
        email: null,
        dateOfBirth: null,
        locale: "fa",
        timeZone: "Asia/Tehran",
        calendar: "jalali",
        digits: "arabext",
        hourCycle: "h23",
        theme: "system",
      });
    }
    mockProfile = userProfileSchema.parse({ ...mockProfile, ...body });
    return HttpResponse.json(mockProfile);
  }),

  http.get("/api/auth/personas", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    return HttpResponse.json(
      mockPersonas.map((p) => availablePersonaSchema.parse(p)),
    );
  }),

  http.get("/api/auth/contexts", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    return HttpResponse.json(
      mockContexts.map((c) => availableContextSchema.parse(c)),
    );
  }),

  http.post("/api/auth/personas/teacher/activate", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    mockPersonas = mockPersonas.map((p) =>
      p.persona === "teacher" ? { ...p, activated: true } : p,
    );
    mockTeacherDash = {
      plan: "teacher_free",
      studentsCount: 2,
      classesCount: 1,
      upcomingSessionsCount: 1,
    };
    return HttpResponse.json({ persona: "teacher" });
  }),

  http.get("/api/teacher/dashboard", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    return HttpResponse.json(teacherDashboardSchema.parse(mockTeacherDash));
  }),

  http.get("/api/student/relationships/pending", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    if (scenario === "empty") {
      return HttpResponse.json([]);
    }
    return HttpResponse.json(mockPendingStudentRels);
  }),

  http.post("/api/auth/personas/student/activate", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as { relationshipId?: string };
    const found = mockPendingStudentRels.find(
      (r) => String(r.id) === body.relationshipId,
    );
    if (!found) {
      return HttpResponse.json(
        errorBody(404, "NOT_FOUND", "student.relationship.notFound"),
        { status: 404 },
      );
    }
    const activated = studentRelationshipSchema.parse({
      ...found,
      status: "active",
    });
    mockPendingStudentRels = mockPendingStudentRels.filter(
      (r) => String(r.id) !== body.relationshipId,
    );
    mockActiveStudentRels = [...mockActiveStudentRels, activated];
    mockStudentDash = {
      activeSubjectsCount: mockActiveStudentRels.length,
      upcomingSessionsCount: 1,
      openAssignmentsCount: 2,
      relationships: mockActiveStudentRels,
    };
    mockPersonas = mockPersonas.map((p) =>
      p.persona === "student" ? { ...p, activated: true } : p,
    );
    return HttpResponse.json({ persona: "student" });
  }),

  http.get("/api/student/dashboard", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    return HttpResponse.json(studentDashboardSchema.parse(mockStudentDash));
  }),

  http.post("/api/organizations", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const body = (await request.json()) as { name?: string; type?: string };
    if (!body.name || (body.type !== "school" && body.type !== "institute")) {
      return HttpResponse.json(
        errorBody(400, "VALIDATION", "errors.validation"),
        { status: 400 },
      );
    }
    const id = opaqueIdSchema.parse(
      `org_${Math.random().toString(36).slice(2, 10)}`,
    );
    const mainBranchId = opaqueIdSchema.parse(`br_main_${id}`);
    const org = organizationSchema.parse({
      id,
      name: body.name,
      type: body.type,
      mainBranchId,
      mainBranchName: "Main Branch",
      ownerRole: "owner",
      trialDaysLeft: 14,
      branchesCount: 1,
      membersCount: 1,
      publicProfilePublished: false,
    });
    mockOrgs.set(id, org);
    seedOwnerMembership({
      organizationId: id,
      userId: currentSession!.userId,
      displayName: currentSession!.displayName,
      phoneE164: currentPhoneE164,
      mainBranchId,
    });
    mockMembersByOrg.set(id, [
      {
        id: opaqueIdSchema.parse(`mem_owner_${id}`),
        organizationId: id,
        displayName: currentSession!.displayName,
        phoneMasked: maskPhoneE164(currentPhoneE164),
        phoneE164: currentPhoneE164,
        userId: currentSession!.userId,
        role: "owner",
        branchIds: [mainBranchId],
        status: "active",
        joinedAt: new Date().toISOString(),
      },
    ]);
    mockContexts = [
      ...mockContexts.filter((c) => c.organizationId !== id),
      {
        id,
        kind: "organization",
        label: org.name,
        organizationId: id,
      },
    ];
    return HttpResponse.json(org);
  }),

  http.get("/api/organizations/:orgId", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    const org = mockOrgs.get(String(params.orgId));
    if (!org) {
      return HttpResponse.json(
        errorBody(404, "NOT_FOUND", "errors.not_found"),
        { status: 404 },
      );
    }
    return HttpResponse.json(org);
  }),

  http.get("/api/organizations/:orgId/members", async ({ params }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    const unauthorized = requireAuth();
    if (unauthorized) return unauthorized;
    if (scenario === "forbidden") {
      return HttpResponse.json(
        errorBody(403, "FORBIDDEN", "errors.forbidden"),
        { status: 403 },
      );
    }
    const orgId = String(params.orgId);
    if (!mockOrgs.get(orgId)) {
      return HttpResponse.json(
        errorBody(404, "NOT_FOUND", "errors.not_found"),
        { status: 404 },
      );
    }
    if (scenario === "empty") {
      return HttpResponse.json({
        data: [],
        meta: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
      });
    }
    const rows = mockMembersByOrg.get(orgId) ?? [];
    const data = rows.map((row) =>
      orgMemberSchema.parse({
        id: row.id,
        organizationId: row.organizationId,
        displayName: row.displayName,
        phoneMasked: row.phoneMasked,
        role: row.role,
        branchIds: row.branchIds,
        status: row.status,
        invitedAt: row.invitedAt,
        joinedAt: row.joinedAt,
      }),
    );
    return HttpResponse.json({
      data,
      meta: {
        page: 1,
        pageSize: Math.max(data.length, 1),
        totalItems: data.length,
        totalPages: 1,
      },
    });
  }),

  http.post(
    "/api/organizations/:orgId/members/invite",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      if (scenario === "forbidden") {
        return HttpResponse.json(
          errorBody(403, "FORBIDDEN", "errors.forbidden"),
          { status: 403 },
        );
      }
      const orgId = String(params.orgId);
      const org = mockOrgs.get(orgId);
      if (!org) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const body = (await request.json()) as {
        phoneE164?: string;
        role?: string;
        displayName?: string;
      };
      const roleParsed = orgRoleSchema.safeParse(body.role);
      if (
        !body.phoneE164 ||
        !roleParsed.success ||
        !ASSIGNABLE_ORG_ROLES.includes(roleParsed.data) ||
        !body.displayName?.trim()
      ) {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const rows = mockMembersByOrg.get(orgId) ?? [];
      if (rows.some((row) => row.phoneE164 === body.phoneE164)) {
        return HttpResponse.json(
          errorBody(409, "CONFLICT", "organization.invite.duplicate"),
          { status: 409 },
        );
      }
      const id = opaqueIdSchema.parse(
        `mem_${Math.random().toString(36).slice(2, 10)}`,
      );
      const member = {
        id,
        organizationId: org.id,
        displayName: body.displayName.trim(),
        phoneMasked: maskPhoneE164(body.phoneE164),
        phoneE164: body.phoneE164,
        userId: null as string | null,
        role: roleParsed.data as OrgRole,
        branchIds: [org.mainBranchId],
        status: "invited" as const,
        invitedAt: new Date().toISOString(),
      };
      mockMembersByOrg.set(orgId, [...rows, member]);
      mockOrgs.set(orgId, {
        ...org,
        membersCount: org.membersCount + 1,
      });
      return HttpResponse.json(
        inviteStaffResultSchema.parse({
          inviteId: id,
          status: "sent",
          member: orgMemberSchema.parse({
            id: member.id,
            organizationId: member.organizationId,
            displayName: member.displayName,
            phoneMasked: member.phoneMasked,
            role: member.role,
            branchIds: member.branchIds,
            status: member.status,
            invitedAt: member.invitedAt,
          }),
        }),
      );
    },
  ),

  http.patch(
    "/api/organizations/:orgId/members/:memberId",
    async ({ params, request }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const memberId = String(params.memberId);
      const rows = mockMembersByOrg.get(orgId) ?? [];
      const index = rows.findIndex((row) => String(row.id) === memberId);
      if (index < 0) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      const body = (await request.json()) as { role?: string };
      const roleParsed = orgRoleSchema.safeParse(body.role);
      if (!roleParsed.success || roleParsed.data === "owner") {
        return HttpResponse.json(
          errorBody(400, "VALIDATION", "errors.validation"),
          { status: 400 },
        );
      }
      const current = rows[index]!;
      if (current.role === "owner") {
        return HttpResponse.json(
          errorBody(409, "CONFLICT", "organization.roles.ownerImmutable"),
          { status: 409 },
        );
      }
      const next = { ...current, role: roleParsed.data };
      const updated = [...rows];
      updated[index] = next;
      mockMembersByOrg.set(orgId, updated);
      return HttpResponse.json(
        orgMemberSchema.parse({
          id: next.id,
          organizationId: next.organizationId,
          displayName: next.displayName,
          phoneMasked: next.phoneMasked,
          role: next.role,
          branchIds: next.branchIds,
          status: next.status,
          invitedAt: next.invitedAt,
          joinedAt: next.joinedAt,
        }),
      );
    },
  ),

  http.delete(
    "/api/organizations/:orgId/members/:memberId",
    async ({ params }) => {
      const failed = await maybeFail();
      if (failed) return failed;
      const unauthorized = requireAuth();
      if (unauthorized) return unauthorized;
      const orgId = String(params.orgId);
      const memberId = String(params.memberId);
      const rows = mockMembersByOrg.get(orgId) ?? [];
      const target = rows.find((row) => String(row.id) === memberId);
      if (!target) {
        return HttpResponse.json(
          errorBody(404, "NOT_FOUND", "errors.not_found"),
          { status: 404 },
        );
      }
      if (target.role === "owner") {
        return HttpResponse.json(
          errorBody(409, "CONFLICT", "organization.member.ownerCannotRevoke"),
          { status: 409 },
        );
      }
      mockMembersByOrg.set(
        orgId,
        rows.filter((row) => String(row.id) !== memberId),
      );
      const org = mockOrgs.get(orgId);
      if (org) {
        mockOrgs.set(orgId, {
          ...org,
          membersCount: Math.max(1, org.membersCount - 1),
        });
      }
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.post("/api/auth/persona", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    if (!currentSession) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    const body = (await request.json()) as { persona: string };
    currentSession = sessionSchema.parse({
      ...currentSession,
      activePersona: body.persona,
    });
    return HttpResponse.json(currentSession);
  }),

  http.post("/api/auth/context", async ({ request }) => {
    const failed = await maybeFail();
    if (failed) return failed;
    if (!currentSession) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    const body = (await request.json()) as {
      organizationId: string | null;
      subjectId?: string | null;
    };
    let orgRole = null as OrgRole | null;
    if (body.organizationId) {
      const fromSeed = resolveOrgRoleForUser(
        body.organizationId,
        currentSession.userId,
      );
      const fromHandler = (
        mockMembersByOrg.get(body.organizationId) ?? []
      ).find(
        (row) =>
          row.userId === currentSession!.userId && row.status === "active",
      )?.role;
      orgRole = fromSeed ?? fromHandler ?? "owner";
    }
    currentSession = sessionSchema.parse({
      ...currentSession,
      organizationId: body.organizationId,
      subjectId: body.subjectId ?? null,
      orgRole,
    });
    return HttpResponse.json(currentSession);
  }),
];
