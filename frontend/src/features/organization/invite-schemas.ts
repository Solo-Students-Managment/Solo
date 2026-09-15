import { z } from "zod";

import { phonePartsSchema } from "@/features/auth";
import { ASSIGNABLE_ORG_ROLES, orgRoleSchema } from "@/services/organization";

export const inviteStaffSchema = phonePartsSchema.and(
  z.object({
    displayName: z
      .string()
      .trim()
      .min(1, "organization.validation.displayName"),
    role: orgRoleSchema.refine(
      (role) => (ASSIGNABLE_ORG_ROLES as readonly string[]).includes(role),
      { message: "organization.validation.role" },
    ),
  }),
);

export type InviteStaffValues = z.infer<typeof inviteStaffSchema>;

export function isOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}
