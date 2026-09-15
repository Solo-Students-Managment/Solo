import { describe, expect, it, beforeEach, afterEach } from "vitest";

import {
  canEnableDevTools,
  canEnableMocks,
  getPublicEnv,
  resetPublicEnvCache,
} from "./env";

const ORIGINAL = { ...process.env };

describe("public env schema", () => {
  beforeEach(() => {
    resetPublicEnvCache();
    process.env = { ...ORIGINAL };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL };
    resetPublicEnvCache();
  });

  it("loads local defaults with mocks enabled", () => {
    delete process.env.NEXT_PUBLIC_APP_ENV;
    delete process.env.NEXT_PUBLIC_ENABLE_MSW;
    const env = getPublicEnv();
    expect(env.NEXT_PUBLIC_APP_ENV).toBe("local");
    expect(canEnableMocks(env)).toBe(true);
    expect(canEnableDevTools(env)).toBe(true);
  });

  it("rejects MSW in production", () => {
    process.env.NEXT_PUBLIC_APP_ENV = "production";
    process.env.NEXT_PUBLIC_ENABLE_MSW = "true";
    process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS = "false";
    expect(() => getPublicEnv()).toThrow(/MSW must be disabled/);
  });

  it("allows production when mocks and dev tools are off", () => {
    process.env.NEXT_PUBLIC_APP_ENV = "production";
    process.env.NEXT_PUBLIC_ENABLE_MSW = "false";
    process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS = "false";
    const env = getPublicEnv();
    expect(canEnableMocks(env)).toBe(false);
    expect(canEnableDevTools(env)).toBe(false);
  });
});
