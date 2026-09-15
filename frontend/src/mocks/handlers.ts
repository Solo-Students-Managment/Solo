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
    currentSession = sessionSchema.parse({
      ...currentSession,
      organizationId: body.organizationId,
      subjectId: body.subjectId ?? null,
    });
    return HttpResponse.json(currentSession);
  }),
];
