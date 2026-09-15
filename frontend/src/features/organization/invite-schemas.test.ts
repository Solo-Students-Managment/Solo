import { describe, expect, it } from "vitest";

import { inviteStaffSchema } from "./invite-schemas";

describe("inviteStaffSchema", () => {
  it("accepts assignable staff invite payload", () => {
    const parsed = inviteStaffSchema.safeParse({
      callingCode: "+98",
      nationalNumber: "9121234568",
      displayName: "New Teacher",
      role: "teacher",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects owner role invites", () => {
    const parsed = inviteStaffSchema.safeParse({
      callingCode: "+98",
      nationalNumber: "9121234568",
      displayName: "Someone",
      role: "owner",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects empty display name", () => {
    const parsed = inviteStaffSchema.safeParse({
      callingCode: "+98",
      nationalNumber: "9121234568",
      displayName: "  ",
      role: "manager",
    });
    expect(parsed.success).toBe(false);
  });
});
