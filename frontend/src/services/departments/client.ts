import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const orgUnitStatusSchema = z.enum(["active", "archived"]);
export type OrgUnitStatus = z.infer<typeof orgUnitStatusSchema>;

export const departmentSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  code: z.string().min(1),
  status: orgUnitStatusSchema,
  effectiveFrom: z.string().min(1),
});
export type Department = z.infer<typeof departmentSchema>;
export const departmentsCollectionSchema = collectionSchema(departmentSchema);

export const teamSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  departmentId: opaqueIdSchema,
  departmentName: z.string().min(1),
  name: z.string().min(1),
  code: z.string().min(1),
  status: orgUnitStatusSchema,
});
export type Team = z.infer<typeof teamSchema>;
export const teamsCollectionSchema = collectionSchema(teamSchema);

export type CreateDepartmentInput = {
  name: string;
  code: string;
  effectiveFrom: string;
};

export type CreateTeamInput = {
  departmentId: string;
  name: string;
  code: string;
};

export type DepartmentsClient = {
  listDepartments(organizationId: string): Promise<{
    data: Department[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  createDepartment(
    organizationId: string,
    input: CreateDepartmentInput,
  ): Promise<Department>;
  listTeams(organizationId: string): Promise<{
    data: Team[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  createTeam(organizationId: string, input: CreateTeamInput): Promise<Team>;
};

const departmentsMemory = new Map<string, Department[]>();
const teamsMemory = new Map<string, Team[]>();

function meta<T>(data: T[]) {
  return {
    data,
    meta: {
      page: 1,
      pageSize: Math.max(data.length, 1),
      totalItems: data.length,
      totalPages: 1,
    },
  };
}

/** Active departments/teams accept membership; archived ones do not. */
export function canAssignToOrgUnit(status: OrgUnitStatus) {
  return status === "active";
}

export function createHttpDepartmentsClient(): DepartmentsClient {
  return {
    async listDepartments(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/departments`,
        { parse: (data) => departmentsCollectionSchema.parse(data) },
      );
    },
    async createDepartment(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/departments`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => departmentSchema.parse(data),
        },
      );
    },
    async listTeams(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/teams`,
        { parse: (data) => teamsCollectionSchema.parse(data) },
      );
    },
    async createTeam(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/teams`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => teamSchema.parse(data),
        },
      );
    },
  };
}

export function createMockDepartmentsClient(): DepartmentsClient {
  return {
    async listDepartments(organizationId) {
      return meta(departmentsMemory.get(organizationId) ?? []);
    },
    async createDepartment(organizationId, input) {
      const row = departmentSchema.parse({
        id: opaqueIdSchema.parse(
          `dept_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        code: input.code.trim().toUpperCase(),
        status: "active",
        effectiveFrom: input.effectiveFrom,
      });
      departmentsMemory.set(organizationId, [
        ...(departmentsMemory.get(organizationId) ?? []),
        row,
      ]);
      return row;
    },
    async listTeams(organizationId) {
      return meta(teamsMemory.get(organizationId) ?? []);
    },
    async createTeam(organizationId, input) {
      const dept = (departmentsMemory.get(organizationId) ?? []).find(
        (row) => String(row.id) === String(input.departmentId),
      );
      const row = teamSchema.parse({
        id: opaqueIdSchema.parse(
          `team_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        departmentId: opaqueIdSchema.parse(input.departmentId),
        departmentName: dept?.name ?? "Department",
        name: input.name.trim(),
        code: input.code.trim().toUpperCase(),
        status: "active",
      });
      teamsMemory.set(organizationId, [
        ...(teamsMemory.get(organizationId) ?? []),
        row,
      ]);
      return row;
    },
  };
}

let client: DepartmentsClient = createMockDepartmentsClient();
export function getDepartmentsClient() {
  return client;
}
export function setDepartmentsClient(next: DepartmentsClient) {
  client = next;
}
export function __resetMockDepartments() {
  departmentsMemory.clear();
  teamsMemory.clear();
  client = createMockDepartmentsClient();
}
