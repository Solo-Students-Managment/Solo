import { describe, expect, it } from "vitest";

import {
  confirmCodeSchema,
  enableTwoFactorSchema,
  reauthSchema,
} from "./schemas";

describe("account security schemas", () => {
  it("accepts valid reauth password", () => {
    expect(reauthSchema.parse({ password: "Password1" }).password).toBe(
      "Password1",
    );
  });

  it("rejects short password and invalid OTP", () => {
    expect(reauthSchema.safeParse({ password: "short" }).success).toBe(false);
    expect(confirmCodeSchema.safeParse({ code: "12" }).success).toBe(false);
    expect(
      enableTwoFactorSchema.safeParse({
        password: "Password1",
        method: "totp",
      }).success,
    ).toBe(true);
  });
});
