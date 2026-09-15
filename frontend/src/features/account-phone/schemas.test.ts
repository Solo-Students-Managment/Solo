import { describe, expect, it } from "vitest";

import { changePhoneBeginSchema, supportRecoverySchema } from "./schemas";

describe("account phone schemas", () => {
  it("accepts change-phone begin values", () => {
    const parsed = changePhoneBeginSchema.parse({
      callingCode: "+98",
      nationalNumber: "9120000000",
      password: "Password1",
    });
    expect(parsed.nationalNumber).toBe("9120000000");
  });

  it("requires recovery details and contact phone", () => {
    expect(
      supportRecoverySchema.safeParse({
        firstName: "Ali",
        lastName: "Reza",
        callingCode: "+98",
        nationalNumber: "9121234567",
        details: "short",
      }).success,
    ).toBe(false);
    expect(
      supportRecoverySchema.safeParse({
        firstName: "Ali",
        lastName: "Reza",
        callingCode: "+98",
        nationalNumber: "9121234567",
        details: "I lost my SIM card last week.",
      }).success,
    ).toBe(true);
  });
});
