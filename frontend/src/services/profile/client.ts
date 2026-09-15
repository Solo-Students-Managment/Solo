import { z } from "zod";

import { apiRequest } from "@/services/api";
import { opaqueIdSchema } from "@/services/api";

export const userProfileSchema = z.object({
  userId: opaqueIdSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().nullable(),
  dateOfBirth: z.string().nullable(),
  locale: z.enum(["fa", "en"]),
  timeZone: z.string().min(1),
  calendar: z.enum(["gregorian", "jalali"]),
  digits: z.enum(["latn", "arabext"]),
  hourCycle: z.enum(["h12", "h23"]),
  theme: z.enum(["light", "dark", "system"]),
});
export type UserProfile = z.infer<typeof userProfileSchema>;

export type ProfileClient = {
  getProfile(): Promise<UserProfile>;
  updateProfile(input: Partial<UserProfile>): Promise<UserProfile>;
};

let memoryProfile: UserProfile | null = null;

function defaultProfile(): UserProfile {
  return userProfileSchema.parse({
    userId: opaqueIdSchema.parse("usr_demo"),
    firstName: "Demo",
    lastName: "User",
    email: null,
    dateOfBirth: null,
    locale: "fa",
    timeZone: "Asia/Tehran",
    calendar: "jalali",
    digits: "arabext",
    hourCycle: "h23",
    theme: "system",
  });
}

export function createHttpProfileClient(): ProfileClient {
  return {
    async getProfile() {
      return apiRequest("/me/profile", {
        parse: (data) => userProfileSchema.parse(data),
      });
    },
    async updateProfile(input) {
      return apiRequest("/me/profile", {
        method: "PATCH",
        body: JSON.stringify(input),
        parse: (data) => userProfileSchema.parse(data),
      });
    },
  };
}

export function createMockProfileClient(): ProfileClient {
  return {
    async getProfile() {
      if (!memoryProfile) memoryProfile = defaultProfile();
      return memoryProfile;
    },
    async updateProfile(input) {
      if (!memoryProfile) memoryProfile = defaultProfile();
      memoryProfile = userProfileSchema.parse({ ...memoryProfile, ...input });
      return memoryProfile;
    },
  };
}

let profileClient: ProfileClient = createMockProfileClient();

export function getProfileClient(): ProfileClient {
  return profileClient;
}

export function setProfileClient(client: ProfileClient): void {
  profileClient = client;
}

export function __resetMockProfile(): void {
  memoryProfile = null;
  profileClient = createMockProfileClient();
}
