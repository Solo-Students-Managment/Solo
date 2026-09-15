import { describe, expect, it } from "vitest";

import {
  assertStorageAllowed,
  isSafeExternalUrl,
  redactSensitive,
} from "./policy";

describe("security policy", () => {
  it("classifies storage and redacts secrets", () => {
    expect(assertStorageAllowed("sensitive", "local")).toBe(false);
    expect(assertStorageAllowed("ui", "session")).toBe(true);
    expect(isSafeExternalUrl("https://example.com")).toBe(true);
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(redactSensitive("token=abc&phone=+989121234567")).toContain(
      "[REDACTED]",
    );
  });
});
