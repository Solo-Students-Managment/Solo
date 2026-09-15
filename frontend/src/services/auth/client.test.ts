import { beforeEach, describe, expect, it } from "vitest";

import {
  __resetMockSession,
  createMockAuthClient,
  safeAuthReturnUrl,
} from "./client";

describe("mock auth client", () => {
  beforeEach(() => {
    __resetMockSession();
  });

  it("logs in and returns a session without localStorage tokens", async () => {
    const client = createMockAuthClient();
    const session = await client.login({
      phoneE164: "+989121234567",
      password: "Password1",
    });
    expect(session.userId).toContain("usr_");
    expect(await client.getSession()).not.toBeNull();
    expect(window.localStorage.length).toBe(0);
  });

  it("enables 2FA and lists device sessions in memory only", async () => {
    const client = createMockAuthClient();
    await client.login({
      phoneE164: "+989121234567",
      password: "Password1",
    });
    const begin = await client.beginEnableTwoFactor({
      method: "sms",
      password: "Password1",
    });
    const confirmed = await client.confirmEnableTwoFactor({
      challengeId: begin.challengeId,
      code: "123456",
    });
    expect(confirmed.status.enabled).toBe(true);
    expect(confirmed.recoveryCodes?.length).toBeGreaterThan(0);
    const sessions = await client.listSessions();
    expect(sessions.some((s) => s.isCurrent)).toBe(true);
    await client.revokeOtherSessions({ password: "Password1" });
    expect((await client.listSessions()).every((s) => s.isCurrent)).toBe(true);
    expect(window.localStorage.length).toBe(0);
  });

  it("changes phone via dual OTP challenges in memory only", async () => {
    const client = createMockAuthClient();
    await client.login({
      phoneE164: "+989121234567",
      password: "Password1",
    });
    const begin = await client.beginChangePhone({
      password: "Password1",
      newPhoneE164: "+989331112233",
    });
    const confirmed = await client.confirmChangePhone({
      currentChallengeId: begin.currentChallengeId,
      newChallengeId: begin.newChallengeId,
      currentCode: "123456",
      newCode: "123456",
    });
    expect(confirmed.phoneMasked).toContain("***");
    const recovery = await client.requestSupportRecovery({
      firstName: "Ali",
      lastName: "Reza",
      contactPhoneE164: "+989129998877",
      details: "Lost SIM card last week.",
    });
    expect(recovery.status).toBe("submitted");
    expect(window.localStorage.length).toBe(0);
  });

  it("expires sessions and validates return URLs", async () => {
    const client = createMockAuthClient();
    const session = await client.login({
      phoneE164: "+989121234567",
      password: "Password1",
    });
    session.expiresAt = new Date(Date.now() - 1000).toISOString();
    expect(await client.getSession()).toBeNull();
    expect(safeAuthReturnUrl("//evil")).toBe("/");
  });
});
