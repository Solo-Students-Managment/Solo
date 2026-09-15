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
      password: "secret",
    });
    expect(session.userId).toContain("usr_");
    expect(await client.getSession()).not.toBeNull();
    expect(window.localStorage.length).toBe(0);
  });

  it("expires sessions and validates return URLs", async () => {
    const client = createMockAuthClient();
    const session = await client.login({
      phoneE164: "+989121234567",
      password: "secret",
    });
    session.expiresAt = new Date(Date.now() - 1000).toISOString();
    expect(await client.getSession()).toBeNull();
    expect(safeAuthReturnUrl("//evil")).toBe("/personal");
  });
});
