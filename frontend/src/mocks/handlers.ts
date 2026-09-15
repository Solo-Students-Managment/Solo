import { http, HttpResponse, delay } from "msw";
import { z } from "zod";

import type { ApiError } from "@/services/api";
import { opaqueIdSchema } from "@/services/api";
import { sessionSchema } from "@/services/auth/client";

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
  purpose: "login" | "signup" | "reset";
  firstName?: string;
  lastName?: string;
  passwordHashStub?: string;
};

const challenges = new Map<string, PendingChallenge>();
let currentSession: z.infer<typeof sessionSchema> | null = null;

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

function newChallengeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
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
    return HttpResponse.json(currentSession);
  }),

  http.post("/api/auth/logout", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    currentSession = null;
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

  http.post("/api/auth/reauth", async () => {
    const failed = await maybeFail();
    if (failed) return failed;
    if (!currentSession) {
      return HttpResponse.json(
        errorBody(401, "UNAUTHORIZED", "errors.unauthorized"),
        { status: 401 },
      );
    }
    currentSession = { ...currentSession, requiresReauth: false };
    return HttpResponse.json({ ok: true });
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
