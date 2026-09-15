import { describe, expect, it } from "vitest";

import { notificationPreferencesFormSchema } from "./schemas";

describe("notification schemas", () => {
  it("accepts preferences", () => {
    expect(
      notificationPreferencesFormSchema.safeParse({
        inApp: true,
        sms: false,
        webPush: true,
        quietHoursEnabled: false,
      }).success,
    ).toBe(true);
  });
});
