import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { toJalaali } from "jalaali-js";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(duration);

export type CalendarSystem = "gregorian" | "jalali";
export type DigitSystem = "latn" | "arabext";
export type HourCycle = "h12" | "h23";

export type DateTimePreferences = {
  timeZone: string;
  calendar: CalendarSystem;
  digits: DigitSystem;
  hourCycle: HourCycle;
};

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

let frozenNow: string | null = null;

export function freezeNow(isoUtc: string): void {
  frozenNow = isoUtc;
}

export function unfreezeNow(): void {
  frozenNow = null;
}

export function nowUtc(): dayjs.Dayjs {
  return frozenNow ? dayjs.utc(frozenNow) : dayjs.utc();
}

export function toPersianDigits(input: string): string {
  return input.replace(
    /\d/g,
    (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit,
  );
}

export function applyDigits(input: string, digits: DigitSystem): string {
  return digits === "arabext" ? toPersianDigits(input) : input;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatJalaliDate(local: dayjs.Dayjs): string {
  const { jy, jm, jd } = toJalaali(
    local.year(),
    local.month() + 1,
    local.date(),
  );
  return `${jy}/${pad(jm)}/${pad(jd)}`;
}

export function formatDateTime(
  isoUtc: string,
  prefs: DateTimePreferences,
  pattern: "date" | "time" | "datetime" = "datetime",
): string {
  const local = dayjs.utc(isoUtc).tz(prefs.timeZone);

  const datePart =
    prefs.calendar === "jalali"
      ? formatJalaliDate(local)
      : local.format("YYYY-MM-DD");
  const timePart =
    prefs.hourCycle === "h12" ? local.format("hh:mm A") : local.format("HH:mm");

  let formatted: string;
  if (pattern === "date") {
    formatted = datePart;
  } else if (pattern === "time") {
    formatted = timePart;
  } else {
    formatted = `${datePart} ${timePart}`;
  }

  return applyDigits(formatted, prefs.digits);
}

export function formatRelative(
  isoUtc: string,
  prefs: DateTimePreferences,
): string {
  const value = dayjs.utc(isoUtc).tz(prefs.timeZone);
  return applyDigits(value.from(nowUtc().tz(prefs.timeZone)), prefs.digits);
}

export function formatDurationMs(
  ms: number,
  prefs: DateTimePreferences,
): string {
  const value = dayjs.duration(ms);
  const hours = Math.floor(value.asHours());
  const minutes = value.minutes();
  return applyDigits(`${hours}h ${minutes}m`, prefs.digits);
}

export function isDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function startOfWeek(
  isoUtc: string,
  prefs: DateTimePreferences,
  weekStartsOn: 0 | 6 = 6,
): string {
  const local = dayjs.utc(isoUtc).tz(prefs.timeZone).startOf("day");
  const day = local.day();
  const diff = (day - weekStartsOn + 7) % 7;
  return local.subtract(diff, "day").utc().toISOString();
}
