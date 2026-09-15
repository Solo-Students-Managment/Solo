import { z } from "zod";

export const profileFormSchema = z.object({
  firstName: z.string().trim().min(1, "profile.validation.firstName"),
  lastName: z.string().trim().min(1, "profile.validation.lastName"),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "profile.validation.email",
    ),
  dateOfBirth: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "profile.validation.dob",
    ),
  locale: z.enum(["fa", "en"]),
  timeZone: z.string().min(1),
  calendar: z.enum(["gregorian", "jalali"]),
  digits: z.enum(["latn", "arabext"]),
  hourCycle: z.enum(["h12", "h23"]),
  theme: z.enum(["light", "dark", "system"]),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function toProfilePatch(values: ProfileFormValues) {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email === "" ? null : values.email,
    dateOfBirth: values.dateOfBirth === "" ? null : values.dateOfBirth,
    locale: values.locale,
    timeZone: values.timeZone,
    calendar: values.calendar,
    digits: values.digits,
    hourCycle: values.hourCycle,
    theme: values.theme,
  };
}

export function isOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}
