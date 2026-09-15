import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().trim().min(1, "roles.validation.name"),
  templateKey: z.enum([
    "owner",
    "manager",
    "academic_manager",
    "teacher",
    "finance",
    "support_staff",
    "custom",
  ]),
  branchScoped: z.coerce.boolean(),
  permissionsText: z.string().trim().min(1, "roles.validation.permissions"),
});
export type CreateRoleValues = z.infer<typeof createRoleSchema>;

export function parsePermissionsText(raw: string): string[] {
  return raw
    .split(/[,\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}
