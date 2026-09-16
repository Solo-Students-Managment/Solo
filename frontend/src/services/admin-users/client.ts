import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const adminUserSchema = z.object({
  id: opaqueIdSchema,
  email: z.string().email(),
  displayName: z.string().min(1),
  restricted: z.boolean(),
  restrictionReason: z.string().nullable(),
});
export type AdminUser = z.infer<typeof adminUserSchema>;

export type AdminUsersClient = {
  list(): Promise<AdminUser[]>;
  restrict(userId: string, reason: string): Promise<AdminUser>;
  unrestrict(userId: string): Promise<AdminUser>;
};

const memory: AdminUser[] = [];

function seed() {
  if (memory.length) return;
  memory.push(
    adminUserSchema.parse({
      id: "usr_admin_1",
      email: "sara@example.com",
      displayName: "Sara Student",
      restricted: false,
      restrictionReason: null,
    }),
    adminUserSchema.parse({
      id: "usr_admin_2",
      email: "ali@example.com",
      displayName: "Ali Teacher",
      restricted: false,
      restrictionReason: null,
    }),
  );
}

export function createHttpAdminUsersClient(): AdminUsersClient {
  return {
    async list() {
      return apiRequest("/admin/users", {
        parse: (data) => z.array(adminUserSchema).parse(data),
      });
    },
    async restrict(userId, reason) {
      return apiRequest(`/admin/users/${encodeURIComponent(userId)}/restrict`, {
        method: "POST",
        body: JSON.stringify({ reason }),
        parse: (data) => adminUserSchema.parse(data),
      });
    },
    async unrestrict(userId) {
      return apiRequest(
        `/admin/users/${encodeURIComponent(userId)}/unrestrict`,
        {
          method: "POST",
          parse: (data) => adminUserSchema.parse(data),
        },
      );
    },
  };
}

export function createMockAdminUsersClient(): AdminUsersClient {
  return {
    async list() {
      seed();
      return [...memory];
    },
    async restrict(userId, reason) {
      seed();
      const idx = memory.findIndex((u) => u.id === userId);
      if (idx < 0) throw new Error("user_not_found");
      memory[idx] = adminUserSchema.parse({
        ...memory[idx],
        restricted: true,
        restrictionReason: reason.trim() || "policy",
      });
      return memory[idx]!;
    },
    async unrestrict(userId) {
      seed();
      const idx = memory.findIndex((u) => u.id === userId);
      if (idx < 0) throw new Error("user_not_found");
      memory[idx] = adminUserSchema.parse({
        ...memory[idx],
        restricted: false,
        restrictionReason: null,
      });
      return memory[idx]!;
    },
  };
}

let client: AdminUsersClient = createMockAdminUsersClient();
export function getAdminUsersClient() {
  return client;
}
export function setAdminUsersClient(next: AdminUsersClient) {
  client = next;
}
