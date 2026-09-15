import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const roleTemplateKeySchema = z.enum([
  "owner",
  "manager",
  "academic_manager",
  "teacher",
  "finance",
  "support_staff",
  "custom",
]);
export type RoleTemplateKey = z.infer<typeof roleTemplateKeySchema>;

export const ROLE_TEMPLATE_KEYS = roleTemplateKeySchema.options.filter(
  (key) => key !== "custom",
) as Exclude<RoleTemplateKey, "custom">[];

export const orgRoleSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  templateKey: roleTemplateKeySchema,
  branchScoped: z.boolean(),
  permissions: z.array(z.string().min(1)).min(1),
  isSystem: z.boolean(),
});
export type OrgRoleDefinition = z.infer<typeof orgRoleSchema>;
export const orgRolesCollectionSchema = collectionSchema(orgRoleSchema);

export type CreateOrgRoleInput = {
  name: string;
  templateKey: Exclude<RoleTemplateKey, "custom"> | "custom";
  branchScoped: boolean;
  permissions: string[];
};

export type RolesClient = {
  list(organizationId: string): Promise<{
    data: OrgRoleDefinition[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(
    organizationId: string,
    input: CreateOrgRoleInput,
  ): Promise<OrgRoleDefinition>;
};

const memory = new Map<string, OrgRoleDefinition[]>();

const TEMPLATE_PERMISSIONS: Record<
  Exclude<RoleTemplateKey, "custom">,
  string[]
> = {
  owner: ["*"],
  manager: ["org.manage", "students.manage", "staff.manage"],
  academic_manager: ["students.manage", "courses.manage", "exams.manage"],
  teacher: ["courses.view", "sessions.manage", "gradebook.manage"],
  finance: ["tuition.manage", "reports.finance"],
  support_staff: ["directory.view", "tasks.manage"],
};

function meta(data: OrgRoleDefinition[]) {
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

export function permissionsForTemplate(
  templateKey: Exclude<RoleTemplateKey, "custom">,
) {
  return [...TEMPLATE_PERMISSIONS[templateKey]];
}

export function canDeleteRole(role: Pick<OrgRoleDefinition, "isSystem">) {
  return !role.isSystem;
}

function seed(organizationId: string): OrgRoleDefinition[] {
  const existing = memory.get(organizationId);
  if (existing) return existing;
  const seeded = ROLE_TEMPLATE_KEYS.map((key) =>
    orgRoleSchema.parse({
      id: opaqueIdSchema.parse(`role_${key}`),
      organizationId: opaqueIdSchema.parse(organizationId),
      name: key
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      templateKey: key,
      branchScoped: key !== "owner",
      permissions: permissionsForTemplate(key),
      isSystem: true,
    }),
  );
  memory.set(organizationId, seeded);
  return seeded;
}

export function createHttpRolesClient(): RolesClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/roles`,
        { parse: (data) => orgRolesCollectionSchema.parse(data) },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/roles`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => orgRoleSchema.parse(data),
        },
      );
    },
  };
}

export function createMockRolesClient(): RolesClient {
  return {
    async list(organizationId) {
      return meta(seed(organizationId));
    },
    async create(organizationId, input) {
      const rows = seed(organizationId);
      const templatePerms =
        input.templateKey === "custom"
          ? input.permissions
          : permissionsForTemplate(input.templateKey);
      const row = orgRoleSchema.parse({
        id: opaqueIdSchema.parse(
          `role_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        templateKey:
          input.templateKey === "custom" ? "custom" : input.templateKey,
        branchScoped: input.branchScoped,
        permissions:
          input.templateKey === "custom" ? input.permissions : templatePerms,
        isSystem: false,
      });
      memory.set(organizationId, [...rows, row]);
      return row;
    },
  };
}

let client: RolesClient = createMockRolesClient();
export function getRolesClient() {
  return client;
}
export function setRolesClient(next: RolesClient) {
  client = next;
}
export function __resetMockRoles() {
  memory.clear();
  client = createMockRolesClient();
}
