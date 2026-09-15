import { z } from "zod";

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
  }): Promise<Session>;
  requestOtp(phoneE164: string): Promise<{ challengeId: string }>;
  verifyOtp(input: { challengeId: string; code: string }): Promise<Session>;
  resetPassword(input: {
    challengeId: string;
    code: string;
    newPassword: string;
  }): Promise<void>;
  reauth(password: string): Promise<void>;
  switchPersona(persona: Persona): Promise<Session>;
  switchContext(input: {
    organizationId: string | null;
    subjectId?: string | null;
  }): Promise<Session>;
};

let memorySession: Session | null = null;

function futureExpiry(minutes = 60): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

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
    async login({ phoneE164 }) {
      memorySession = {
        userId: opaqueIdSchema.parse(`usr_${phoneE164.replace(/\D/g, "")}`),
        displayName: "Demo User",
        activePersona: "teacher",
        organizationId: null,
        subjectId: null,
        expiresAt: futureExpiry(),
        requiresReauth: false,
      };
      return memorySession;
    },
    async logout() {
      memorySession = null;
    },
    async signup({ firstName, lastName, phoneE164 }) {
      memorySession = {
        userId: opaqueIdSchema.parse(`usr_${phoneE164.replace(/\D/g, "")}`),
        displayName: `${firstName} ${lastName}`,
        activePersona: "teacher",
        organizationId: null,
        subjectId: null,
        expiresAt: futureExpiry(),
        requiresReauth: false,
      };
      return memorySession;
    },
    async requestOtp() {
      return { challengeId: "otp_challenge_1" };
    },
    async verifyOtp() {
      memorySession = {
        userId: opaqueIdSchema.parse("usr_otp"),
        displayName: "OTP User",
        activePersona: "teacher",
        organizationId: null,
        subjectId: null,
        expiresAt: futureExpiry(),
        requiresReauth: false,
      };
      return memorySession;
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
