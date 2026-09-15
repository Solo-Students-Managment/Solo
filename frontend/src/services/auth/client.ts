import { z } from "zod";

import { apiRequest } from "@/services/api";
import { opaqueIdSchema } from "@/services/api";
import { validateReturnUrl } from "@/lib/routes";

import {
  deviceSessionSchema,
  enableTwoFactorBeginSchema,
  enableTwoFactorConfirmSchema,
  recoveryCodesResultSchema,
  twoFactorStatusSchema,
  type DeviceSession,
  type EnableTwoFactorBegin,
  type EnableTwoFactorConfirm,
  type RecoveryCodesResult,
  type TwoFactorMethod,
  type TwoFactorStatus,
} from "./security";
import {
  changePhoneBeginSchema,
  changePhoneConfirmSchema,
  maskPhoneE164,
  supportRecoveryRequestSchema,
  type ChangePhoneBegin,
  type ChangePhoneConfirm,
  type SupportRecoveryResult,
} from "./phone";

export * from "./security";
export * from "./phone";

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
  getTwoFactorStatus(): Promise<TwoFactorStatus>;
  beginEnableTwoFactor(input: {
    method: TwoFactorMethod;
    password: string;
  }): Promise<EnableTwoFactorBegin>;
  confirmEnableTwoFactor(input: {
    challengeId: string;
    code: string;
  }): Promise<EnableTwoFactorConfirm>;
  disableTwoFactor(input: {
    password: string;
    code: string;
  }): Promise<TwoFactorStatus>;
  regenerateRecoveryCodes(input: {
    password: string;
  }): Promise<RecoveryCodesResult>;
  listSessions(): Promise<DeviceSession[]>;
  revokeSession(input: { sessionId: string; password: string }): Promise<void>;
  revokeOtherSessions(input: { password: string }): Promise<void>;
  beginChangePhone(input: {
    password: string;
    newPhoneE164: string;
  }): Promise<ChangePhoneBegin>;
  confirmChangePhone(input: {
    currentChallengeId: string;
    currentCode: string;
    newChallengeId: string;
    newCode: string;
  }): Promise<ChangePhoneConfirm>;
  requestSupportRecovery(input: {
    firstName: string;
    lastName: string;
    previousPhoneE164?: string;
    contactPhoneE164: string;
    details: string;
  }): Promise<SupportRecoveryResult>;
  switchPersona(persona: Persona): Promise<Session>;
  switchContext(input: {
    organizationId: string | null;
    subjectId?: string | null;
  }): Promise<Session>;
};

/** In-memory session metadata only — never stores tokens/passwords/OTP. */
let memorySession: Session | null = null;
let memoryTwoFactor: TwoFactorStatus = {
  enabled: false,
  smsEnabled: false,
  totpEnabled: false,
  recoveryCodesRemaining: 0,
  orgRequires2fa: false,
  adminMandatory: false,
};
let memoryDeviceSessions: DeviceSession[] = [];
let pendingTwoFactorChallenge: {
  challengeId: string;
  method: TwoFactorMethod;
} | null = null;
/** Short-lived reauth window in memory only — never localStorage. */
let reauthFreshUntil = 0;
let memoryPhoneE164 = "+989121234567";
let pendingPhoneChange: {
  currentChallengeId: string;
  newChallengeId: string;
  newPhoneE164: string;
} | null = null;

function futureExpiry(minutes = 60): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function cacheSession(session: Session): Session {
  memorySession = session;
  return session;
}

function requireSession(): Session {
  if (!memorySession) throw new Error("No session");
  return memorySession;
}

function seedDeviceSessions(userId: string): void {
  const now = Date.now();
  memoryDeviceSessions = [
    deviceSessionSchema.parse({
      id: opaqueIdSchema.parse(`ses_current_${userId}`),
      deviceLabel: "This browser",
      locationHint: "Tehran",
      userAgentSummary: "Chrome · macOS",
      lastActiveAt: new Date(now).toISOString(),
      createdAt: new Date(now - 86_400_000).toISOString(),
      expiresAt: futureExpiry(7 * 24 * 60),
      isCurrent: true,
    }),
    deviceSessionSchema.parse({
      id: opaqueIdSchema.parse(`ses_other_${userId}`),
      deviceLabel: "iPhone",
      locationHint: "Isfahan",
      userAgentSummary: "Safari · iOS",
      lastActiveAt: new Date(now - 3_600_000).toISOString(),
      createdAt: new Date(now - 7 * 86_400_000).toISOString(),
      expiresAt: futureExpiry(7 * 24 * 60),
      isCurrent: false,
    }),
  ];
}

function assertReauthFresh(): void {
  if (Date.now() > reauthFreshUntil) {
    if (memorySession) {
      memorySession = { ...memorySession, requiresReauth: true };
    }
    throw new Error("auth.reauthRequired");
  }
}

function defaultTwoFactorStatus(): TwoFactorStatus {
  return {
    enabled: false,
    smsEnabled: false,
    totpEnabled: false,
    recoveryCodesRemaining: 0,
    orgRequires2fa: false,
    adminMandatory: false,
  };
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
    async getTwoFactorStatus() {
      return apiRequest("/auth/2fa", {
        parse: (data) => twoFactorStatusSchema.parse(data),
      });
    },
    async beginEnableTwoFactor(input) {
      return apiRequest("/auth/2fa/enable/begin", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => enableTwoFactorBeginSchema.parse(data),
      });
    },
    async confirmEnableTwoFactor(input) {
      return apiRequest("/auth/2fa/enable/confirm", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => enableTwoFactorConfirmSchema.parse(data),
      });
    },
    async disableTwoFactor(input) {
      return apiRequest("/auth/2fa/disable", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => twoFactorStatusSchema.parse(data),
      });
    },
    async regenerateRecoveryCodes(input) {
      return apiRequest("/auth/2fa/recovery/regenerate", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => recoveryCodesResultSchema.parse(data),
      });
    },
    async listSessions() {
      return apiRequest("/auth/sessions", {
        parse: (data) => z.array(deviceSessionSchema).parse(data),
      });
    },
    async revokeSession(input) {
      await apiRequest(
        `/auth/sessions/${encodeURIComponent(input.sessionId)}`,
        {
          method: "DELETE",
          body: JSON.stringify({ password: input.password }),
          parse: () => undefined,
        },
      );
    },
    async revokeOtherSessions(input) {
      await apiRequest("/auth/sessions/revoke-others", {
        method: "POST",
        body: JSON.stringify(input),
        parse: () => undefined,
      });
    },
    async beginChangePhone(input) {
      return apiRequest("/auth/phone/change/begin", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => changePhoneBeginSchema.parse(data),
      });
    },
    async confirmChangePhone(input) {
      return apiRequest("/auth/phone/change/confirm", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => changePhoneConfirmSchema.parse(data),
      });
    },
    async requestSupportRecovery(input) {
      return apiRequest("/auth/recovery/support", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => supportRecoveryRequestSchema.parse(data),
      });
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
      const session = cacheSession({
        userId: opaqueIdSchema.parse(`usr_${phoneE164.replace(/\D/g, "")}`),
        displayName: "Demo User",
        activePersona: "teacher",
        organizationId: null,
        subjectId: null,
        expiresAt: futureExpiry(),
        requiresReauth: false,
      });
      seedDeviceSessions(session.userId);
      memoryTwoFactor = defaultTwoFactorStatus();
      return session;
    },
    async logout() {
      memorySession = null;
      memoryDeviceSessions = [];
      memoryTwoFactor = defaultTwoFactorStatus();
      pendingTwoFactorChallenge = null;
      reauthFreshUntil = 0;
    },
    async signup() {
      return { challengeId: "otp_signup_1" };
    },
    async completeSignup() {
      const session = cacheSession({
        userId: opaqueIdSchema.parse("usr_signup"),
        displayName: "New User",
        activePersona: "teacher",
        organizationId: null,
        subjectId: null,
        expiresAt: futureExpiry(),
        requiresReauth: false,
      });
      seedDeviceSessions(session.userId);
      return session;
    },
    async requestOtp() {
      return { challengeId: "otp_challenge_1" };
    },
    async verifyOtp({ code }) {
      if (code !== "123456") {
        throw new Error("auth.invalidOtp");
      }
      const session = cacheSession({
        userId: opaqueIdSchema.parse("usr_otp"),
        displayName: "OTP User",
        activePersona: "teacher",
        organizationId: null,
        subjectId: null,
        expiresAt: futureExpiry(),
        requiresReauth: false,
      });
      seedDeviceSessions(session.userId);
      return session;
    },
    async requestPasswordReset() {
      return { challengeId: "otp_reset_1" };
    },
    async resetPassword() {
      return;
    },
    async reauth(password) {
      requireSession();
      if (password !== "Password1") {
        throw new Error("auth.invalidCredentials");
      }
      reauthFreshUntil = Date.now() + 5 * 60_000;
      memorySession = { ...memorySession!, requiresReauth: false };
    },
    async getTwoFactorStatus() {
      requireSession();
      return memoryTwoFactor;
    },
    async beginEnableTwoFactor({ method, password }) {
      requireSession();
      if (password !== "Password1") throw new Error("auth.invalidCredentials");
      reauthFreshUntil = Date.now() + 5 * 60_000;
      const challengeId = `2fa_${method}_${Math.random().toString(36).slice(2, 8)}`;
      pendingTwoFactorChallenge = { challengeId, method };
      if (method === "totp") {
        return {
          challengeId,
          totpSecret: "SOLODEMOSECRET",
          totpUri: "otpauth://totp/Solo:demo?secret=SOLODEMOSECRET&issuer=Solo",
        };
      }
      return { challengeId };
    },
    async confirmEnableTwoFactor({ challengeId, code }) {
      requireSession();
      assertReauthFresh();
      if (
        !pendingTwoFactorChallenge ||
        pendingTwoFactorChallenge.challengeId !== challengeId
      ) {
        throw new Error("auth.invalidOtp");
      }
      if (code !== "123456") throw new Error("auth.invalidOtp");
      const method = pendingTwoFactorChallenge.method;
      pendingTwoFactorChallenge = null;
      memoryTwoFactor = {
        ...memoryTwoFactor,
        enabled: true,
        smsEnabled: method === "sms" ? true : memoryTwoFactor.smsEnabled,
        totpEnabled: method === "totp" ? true : memoryTwoFactor.totpEnabled,
        recoveryCodesRemaining: 8,
      };
      return {
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
        status: memoryTwoFactor,
      };
    },
    async disableTwoFactor({ password, code }) {
      requireSession();
      if (password !== "Password1") throw new Error("auth.invalidCredentials");
      if (code !== "123456") throw new Error("auth.invalidOtp");
      reauthFreshUntil = Date.now() + 5 * 60_000;
      memoryTwoFactor = defaultTwoFactorStatus();
      return memoryTwoFactor;
    },
    async regenerateRecoveryCodes({ password }) {
      requireSession();
      if (password !== "Password1") throw new Error("auth.invalidCredentials");
      reauthFreshUntil = Date.now() + 5 * 60_000;
      if (!memoryTwoFactor.enabled) throw new Error("auth.twoFactorRequired");
      memoryTwoFactor = { ...memoryTwoFactor, recoveryCodesRemaining: 8 };
      return {
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
      };
    },
    async listSessions() {
      const session = requireSession();
      if (memoryDeviceSessions.length === 0) {
        seedDeviceSessions(session.userId);
      }
      return memoryDeviceSessions;
    },
    async revokeSession({ sessionId, password }) {
      requireSession();
      if (password !== "Password1") throw new Error("auth.invalidCredentials");
      reauthFreshUntil = Date.now() + 5 * 60_000;
      const target = memoryDeviceSessions.find((s) => s.id === sessionId);
      if (!target) throw new Error("auth.sessionNotFound");
      if (target.isCurrent) throw new Error("auth.cannotRevokeCurrent");
      memoryDeviceSessions = memoryDeviceSessions.filter(
        (s) => s.id !== sessionId,
      );
    },
    async revokeOtherSessions({ password }) {
      requireSession();
      if (password !== "Password1") throw new Error("auth.invalidCredentials");
      reauthFreshUntil = Date.now() + 5 * 60_000;
      memoryDeviceSessions = memoryDeviceSessions.filter((s) => s.isCurrent);
    },
    async beginChangePhone({ password, newPhoneE164 }) {
      requireSession();
      if (password !== "Password1") throw new Error("auth.invalidCredentials");
      if (newPhoneE164 === memoryPhoneE164) {
        throw new Error("auth.phoneUnchanged");
      }
      reauthFreshUntil = Date.now() + 5 * 60_000;
      const currentChallengeId = `phone_cur_${Math.random().toString(36).slice(2, 8)}`;
      const newChallengeId = `phone_new_${Math.random().toString(36).slice(2, 8)}`;
      pendingPhoneChange = {
        currentChallengeId,
        newChallengeId,
        newPhoneE164,
      };
      return {
        currentChallengeId,
        newChallengeId,
        currentPhoneMasked: maskPhoneE164(memoryPhoneE164),
      };
    },
    async confirmChangePhone({
      currentChallengeId,
      currentCode,
      newChallengeId,
      newCode,
    }) {
      requireSession();
      if (
        !pendingPhoneChange ||
        pendingPhoneChange.currentChallengeId !== currentChallengeId ||
        pendingPhoneChange.newChallengeId !== newChallengeId
      ) {
        throw new Error("auth.invalidOtp");
      }
      if (currentCode !== "123456" || newCode !== "123456") {
        throw new Error("auth.invalidOtp");
      }
      memoryPhoneE164 = pendingPhoneChange.newPhoneE164;
      const masked = maskPhoneE164(memoryPhoneE164);
      pendingPhoneChange = null;
      return { phoneMasked: masked };
    },
    async requestSupportRecovery(input) {
      if (!input.contactPhoneE164 || !input.details.trim()) {
        throw new Error("auth.recoveryInvalid");
      }
      return {
        ticketId: `tkt_${Math.random().toString(36).slice(2, 10)}`,
        status: "submitted" as const,
      };
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
  return validateReturnUrl(candidate, "/");
}

/** Test helper */
export function __resetMockSession(): void {
  memorySession = null;
  memoryDeviceSessions = [];
  memoryTwoFactor = defaultTwoFactorStatus();
  pendingTwoFactorChallenge = null;
  pendingPhoneChange = null;
  memoryPhoneE164 = "+989121234567";
  reauthFreshUntil = 0;
  authClient = createMockAuthClient();
}
