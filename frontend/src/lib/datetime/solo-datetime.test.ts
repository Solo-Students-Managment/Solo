import { afterEach, describe, expect, it } from "vitest";

import {
  applyDigits,
  formatDateTime,
  formatDurationMs,
  freezeNow,
  isDateOnly,
  unfreezeNow,
} from "./solo-datetime";

describe("SoloDateTime", () => {
  afterEach(() => {
    unfreezeNow();
  });

  it("formats gregorian UTC into a timezone", () => {
    const formatted = formatDateTime(
      "2024-03-20T12:00:00.000Z",
      {
        timeZone: "Asia/Tehran",
        calendar: "gregorian",
        digits: "latn",
        hourCycle: "h23",
      },
      "datetime",
    );
    expect(formatted).toContain("2024-03-20");
    expect(formatted).toContain("15:30");
  });

  it("formats jalali with persian digits", () => {
    const formatted = formatDateTime(
      "2024-03-20T12:00:00.000Z",
      {
        timeZone: "Asia/Tehran",
        calendar: "jalali",
        digits: "arabext",
        hourCycle: "h23",
      },
      "date",
    );
    expect(formatted).toMatch(/[۰-۹]/);
    expect(formatted).toContain("/");
  });

  it("supports frozen time and duration helpers", () => {
    freezeNow("2024-01-01T00:00:00.000Z");
    expect(
      formatDurationMs(90 * 60 * 1000, {
        timeZone: "UTC",
        calendar: "gregorian",
        digits: "latn",
        hourCycle: "h23",
      }),
    ).toBe("1h 30m");
    expect(applyDigits("12", "arabext")).toBe("۱۲");
    expect(isDateOnly("2024-01-01")).toBe(true);
    expect(isDateOnly("2024-01-01T00:00:00.000Z")).toBe(false);
  });
});
