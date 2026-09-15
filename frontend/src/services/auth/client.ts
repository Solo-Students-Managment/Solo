import { z } from "zod";

import { apiRequest } from "@/services/api";
import { opaqueIdSchema } from "@/services/api";
import { validateReturnUrl } from "@/lib/routes";

export const personaSchema = z.enum([
  "student",
  "guardian",
  "teacher",
  "organization",
  "admin_solo",
]);
export type Persona = z.infer<typeof personaSchema>;

export const sessionSchema = z.object({
  userId: opaqueIdSchema,
  displayName: z.string(),
  activePersona: personaSchema,
  organizationId: opaqueIdSchema.nullable(),
  subjectId: opaqueIdSchema.nullable(),
  expiresAt: z.string(),
  requiresReauth: z.boolean().default(false),
});
export type Session = z.infer<typeof sessionSchema>;

export type AuthClient = {
  getSession(): Promise<Session | null>;
  login(input: { phoneE164: string; password: string }): Promise<Session>;
  logout(): Promise<void>;
  signup(input: {
    firstName: string;
    lastName: string;
    phoneE164: string;
    password: string;
  }): Promise<{ challengeId: string }>;
  completeSignup(input: {
    challengeId: string;
    code: string;
  }): Promise<Session>;
  requestOtp(phoneE164: string): Promise<{ challengeId: string }>;
  verifyOtp(input: { challengeId: string; code: string }): Promise<Session>;
  resetPassword(input: {
    challengeId: string;
    code: string;
    newPassword: string;
  }): Promise<void>;
  requestPasswordReset(phoneE164: string): Promise<{ challengeId: string }>;
  reauth(password: string): Promise<void>;
  switchPersona(persona: Persona): Promise<Session>;
  switchContext(input: {
    organizationId: string | null;
    subjectId?: string | null;
  }): Promise<Session>;
};

/** In-memory session metadata only — never stores tokens/passwords/OTP. */
let memorySession: Session | null = null;

function futureExpiry(minutes = 60): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function cacheSession(session: Session): Session {
  memorySession = session;
  return session;
}

export function createHttpAuthClient(): AuthClient {
  return {
    async getSession() {
      try {
        const session = await apiRequest("/auth/session", {
          parse: (data) => sessionSchema.parse(data),
        });
        return cacheSession(session);
      } catch {
        memorySession = null;
        return null;
      }
    },
    async login(input) {
      const session = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => sessionSchema.parse(data),
      });
      return cacheSession(session);
    },
    async logout() {
      await apiRequest("/auth/logout", { method: "POST", parse: () => null });
      memorySession = null;
    },
    async signup(input) {
      return apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => z.object({ challengeId: z.string() }).parse(data),
      });
    },
    async completeSignup(input) {
      const session = await apiRequest("/auth/signup/verify", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => sessionSchema.parse(data),
      });
      return cacheSession(session);
    },
    async requestOtp(phoneE164) {
      return apiRequest("/auth/otp/request", {
        method: "POST",
        body: JSON.stringify({ phoneE164 }),
        parse: (data) => z.object({ challengeId: z.string() }).parse(data),
      });
    },
    async verifyOtp(input) {
      const session = await apiRequest("/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => sessionSchema.parse(data),
      });
      return cacheSession(session);
    },
    async requestPasswordReset(phoneE164) {
      return apiRequest("/auth/password/reset/request", {
        method: "POST",
        body: JSON.stringify({ phoneE164 }),
        parse: (data) => z.object({ challengeId: z.string() }).parse(data),
      });
    },
    async resetPassword(input) {
      await apiRequest("/auth/password/reset/confirm", {
        method: "POST",
        body: JSON.stringify(input),
        parse: () => undefined,
      });
    },
    async reauth(password) {
      await apiRequest("/auth/reauth", {
        method: "POST",
        body: JSON.stringify({ password }),
        parse: () => undefined,
      });
      if (memorySession) {
        memorySession = { ...memorySession, requiresReauth: false };
      }
    },
    async switchPersona(persona) {
      const session = await apiRequest("/auth/persona", {
        method: "POST",
        body: JSON.stringify({ persona }),
        parse: (data) => sessionSchema.parse(data),
      });
      return cacheSession(session);
    },
    async switchContext(input) {
      const session = await apiRequest("/auth/context", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => sessionSchema.parse(data),
      });
      return cacheSession(session);
    },
  };
}

/** Offline-capable mock used in unit tests without MSW network. */
export function createMockAuthClient(): AuthClient {
  return {
    async getSession() {
      if (!memorySession) return null;
      if (Date.parse(memorySession.expiresAt) <= Date.now()) {
        memorySession = null;
        return null;
      }
      return memorySession;
    },
    async login({ phoneE164, password }) {
      if (password !== "Password1") {
        throw new Error("auth.invalidCredentials");
      }
      return cacheSession({
        userId: opaqueIdSchema.parse(`usr_${phoneE164.replace(/\D/g, "")}`),
        displayName: "Demo User",
        activePersona: "teacher",
        organizationId: null,
        subjectId: null,
        expiresAt: futureExpiry(),
        requiresReauth: false,
      });
    },
    async logout() {
      memorySession = null;
    },
    async signup() {
      return { challengeId: "otp_signup_1" };
    },
    async completeSignup() {
      return cacheSession({
        userId: opaqueIdSchema.parse("usr_signup"),
        displayName: "New User",
        activePersona: "teacher",
        organizationId: null,
        subjectId: null,
        expiresAt: futureExpiry(),
        requiresReauth: false,
      });
    },
    async requestOtp() {
      return { challengeId: "otp_challenge_1" };
    },
    async verifyOtp({ code }) {
      if (code !== "123456") {
        throw new Error("auth.invalidOtp");
      }
      return cacheSession({
        userId: opaqueIdSchema.parse("usr_otp"),
        displayName: "OTP User",
        activePersona: "teacher",
        organizationId: null,
        subjectId: null,
        expiresAt: futureExpiry(),
        requiresReauth: false,
      });
    },
    async requestPasswordReset() {
      return { challengeId: "otp_reset_1" };
    },
    async resetPassword() {
      return;
    },
    async reauth() {
      if (!memorySession) throw new Error("No session");
      memorySession = { ...memorySession, requiresReauth: false };
    },
    async switchPersona(persona) {
      if (!memorySession) throw new Error("No session");
      memorySession = { ...memorySession, activePersona: persona };
      return memorySession;
    },
    async switchContext({ organizationId, subjectId = null }) {
      if (!memorySession) throw new Error("No session");
      memorySession = {
        ...memorySession,
        organizationId: organizationId
          ? opaqueIdSchema.parse(organizationId)
          : null,
        subjectId: subjectId ? opaqueIdSchema.parse(subjectId) : null,
      };
      return memorySession;
    },
  };
}

let authClient: AuthClient = createMockAuthClient();

export function getAuthClient(): AuthClient {
  return authClient;
}

export function setAuthClient(client: AuthClient): void {
  authClient = client;
}

export function safeAuthReturnUrl(
  candidate: string | null | undefined,
): string {
  return validateReturnUrl(candidate, "/personal");
}

/** Test helper */
export function __resetMockSession(): void {
  memorySession = null;
  authClient = createMockAuthClient();
}
