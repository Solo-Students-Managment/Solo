import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const auditEntrySchema = z.object({
  id: opaqueIdSchema,
  actorId: opaqueIdSchema,
  action: z.string().min(1),
  targetType: z.string().min(1),
  targetId: opaqueIdSchema,
  organizationId: opaqueIdSchema.nullable(),
  createdAt: z.string().min(1),
  metadata: z.record(z.string(), z.string()).default({}),
});
export type AuditEntry = z.infer<typeof auditEntrySchema>;

export type AuditClient = {
  list(scope: { organizationId?: string | null }): Promise<AuditEntry[]>;
};

const memory: AuditEntry[] = [];

function seed() {
  if (memory.length) return;
  memory.push(
    auditEntrySchema.parse({
      id: "aud_1",
      actorId: "usr_1",
      action: "user.restrict",
      targetType: "user",
      targetId: "usr_admin_1",
      organizationId: null,
      createdAt: new Date().toISOString(),
      metadata: { reason: "policy" },
    }),
    auditEntrySchema.parse({
      id: "aud_2",
      actorId: "usr_1",
      action: "billing.invoice.send",
      targetType: "invoice",
      targetId: "inv_1",
      organizationId: "org_demo",
      createdAt: new Date().toISOString(),
      metadata: {},
    }),
  );
}

export function createHttpAuditClient(): AuditClient {
  return {
    async list(scope) {
      const q = scope.organizationId
        ? `?organizationId=${encodeURIComponent(scope.organizationId)}`
        : "";
      return apiRequest(`/audit${q}`, {
        parse: (data) => z.array(auditEntrySchema).parse(data),
      });
    },
  };
}

export function createMockAuditClient(): AuditClient {
  return {
    async list(scope) {
      seed();
      if (scope.organizationId) {
        return memory.filter((e) => e.organizationId === scope.organizationId);
      }
      return [...memory];
    },
  };
}

let client: AuditClient = createMockAuditClient();
export function getAuditClient() {
  return client;
}
export function setAuditClient(next: AuditClient) {
  client = next;
}
