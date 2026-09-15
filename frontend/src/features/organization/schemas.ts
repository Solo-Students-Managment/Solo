import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1, "organization.validation.name"),
  type: z.enum(["school", "institute"]),
});

export type CreateOrganizationValues = z.infer<typeof createOrganizationSchema>;

export function isOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}
