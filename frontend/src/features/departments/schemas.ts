import { z } from "zod";

export const departmentsTabs = ["departments", "teams"] as const;
export type DepartmentsTab = (typeof departmentsTabs)[number];

export function resolveDepartmentsTab(raw: string | null): DepartmentsTab {
  if (raw && (departmentsTabs as readonly string[]).includes(raw)) {
    return raw as DepartmentsTab;
  }
  return "departments";
}

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(1, "departments.validation.deptName"),
  code: z.string().trim().min(1, "departments.validation.deptCode"),
  effectiveFrom: z
    .string()
    .trim()
    .min(1, "departments.validation.effectiveFrom"),
});
export type CreateDepartmentValues = z.infer<typeof createDepartmentSchema>;

export const createTeamSchema = z.object({
  departmentId: z.string().trim().min(1, "departments.validation.department"),
  name: z.string().trim().min(1, "departments.validation.teamName"),
  code: z.string().trim().min(1, "departments.validation.teamCode"),
});
export type CreateTeamValues = z.infer<typeof createTeamSchema>;
