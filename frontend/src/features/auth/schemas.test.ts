import { describe, expect, it } from "vitest";

import {
  isValidE164,
  loginPasswordSchema,
  signupSchema,
  toE164,
} from "./schemas";

describe("auth phone helpers", () => {
  it("composes E.164 and strips leading zero", () => {
    expect(toE164("+98", "09121234567")).toBe("+989121234567");
    expect(isValidE164("+989121234567")).toBe(true);
    expect(isValidE164("09121234567")).toBe(false);
  });

  it("validates login password form", () => {
    const parsed = loginPasswordSchema.safeParse({
      callingCode: "+98",
      nationalNumber: "9121234567",
      password: "Password1",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects short passwords and invalid phones on signup", () => {
    expect(
      signupSchema.safeParse({
        firstName: "Sara",
        lastName: "Ahmadi",
        callingCode: "+98",
        nationalNumber: "12",
        password: "short",
      }).success,
    ).toBe(false);
  });
});
