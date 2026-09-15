import { describe, expect, it } from "vitest";

import { createManagedStudentSchema, linkGuardianSchema } from "./schemas";

describe("students schemas", () => {
  it("accepts create student values", () => {
    expect(
      createManagedStudentSchema.safeParse({
        displayName: "Ali",
        callingCode: "+98",
        nationalNumber: "9121112233",
      }).success,
    ).toBe(true);
  });

  it("accepts link guardian values", () => {
    expect(
      linkGuardianSchema.safeParse({
        displayName: "Parent",
        relationshipLabel: "Mother",
        callingCode: "+98",
        nationalNumber: "9124445566",
      }).success,
    ).toBe(true);
  });
});
