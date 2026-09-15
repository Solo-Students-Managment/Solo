import { describe, expect, it } from "vitest";

import { profileFormSchema, toProfilePatch } from "./schemas";

describe("profileFormSchema", () => {
  it("accepts empty email and DOB then patches to null", () => {
    const parsed = profileFormSchema.parse({
      firstName: "Ali",
      lastName: "Reza",
      email: "",
      dateOfBirth: "",
      locale: "fa",
      timeZone: "Asia/Tehran",
      calendar: "jalali",
      digits: "arabext",
      hourCycle: "h23",
      theme: "system",
    });
    expect(toProfilePatch(parsed).email).toBeNull();
    expect(toProfilePatch(parsed).dateOfBirth).toBeNull();
  });

  it("rejects invalid email and DOB", () => {
    expect(
      profileFormSchema.safeParse({
        firstName: "Ali",
        lastName: "Reza",
        email: "not-an-email",
        dateOfBirth: "01-01-2000",
        locale: "en",
        timeZone: "UTC",
        calendar: "gregorian",
        digits: "latn",
        hourCycle: "h12",
        theme: "light",
      }).success,
    ).toBe(false);
  });
});
