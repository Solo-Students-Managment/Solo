import { z } from "zod";

import { apiRequest, opaqueIdSchema } from "@/services/api";

export const guardianRelationshipSchema = z.object({
  id: opaqueIdSchema,
  studentDisplayName: z.string().min(1),
  relationshipLabel: z.string().min(1),
  organizationName: z.string().min(1),
  status: z.enum(["pending", "active"]),
});
export type GuardianRelationship = z.infer<typeof guardianRelationshipSchema>;

export const guardianDashboardSchema = z.object({
  linkedStudentsCount: z.number().int().nonnegative(),
  upcomingSessionsCount: z.number().int().nonnegative(),
  unreadUpdatesCount: z.number().int().nonnegative(),
  relationships: z.array(guardianRelationshipSchema),
});
export type GuardianDashboard = z.infer<typeof guardianDashboardSchema>;

export type GuardianClient = {
  listPendingRelationships(): Promise<GuardianRelationship[]>;
  acceptRelationship(relationshipId: string): Promise<{ persona: "guardian" }>;
  getDashboard(): Promise<GuardianDashboard>;
};

let pendingRelationships: GuardianRelationship[] = [
  {
    id: opaqueIdSchema.parse("rel_grd_pending_1"),
    studentDisplayName: "Sara",
    relationshipLabel: "Parent",
    organizationName: "Demo School",
    status: "pending",
  },
];

let activeRelationships: GuardianRelationship[] = [];

let guardianDash: GuardianDashboard = {
  linkedStudentsCount: 0,
  upcomingSessionsCount: 0,
  unreadUpdatesCount: 0,
  relationships: [],
};

export function createHttpGuardianClient(): GuardianClient {
  return {
    async listPendingRelationships() {
      return apiRequest("/guardian/relationships/pending", {
        parse: (data) => z.array(guardianRelationshipSchema).parse(data),
      });
    },
    async acceptRelationship(relationshipId) {
      return apiRequest("/auth/personas/guardian/activate", {
        method: "POST",
        body: JSON.stringify({ relationshipId }),
        parse: (data) =>
          z.object({ persona: z.literal("guardian") }).parse(data),
      });
    },
    async getDashboard() {
      return apiRequest("/guardian/dashboard", {
        parse: (data) => guardianDashboardSchema.parse(data),
      });
    },
  };
}

export function createMockGuardianClient(): GuardianClient {
  return {
    async listPendingRelationships() {
      return pendingRelationships.filter((r) => r.status === "pending");
    },
    async acceptRelationship(relationshipId) {
      const found = pendingRelationships.find(
        (r) => String(r.id) === relationshipId,
      );
      if (!found) throw new Error("guardian.relationship.notFound");
      const activated = { ...found, status: "active" as const };
      pendingRelationships = pendingRelationships.filter(
        (r) => String(r.id) !== relationshipId,
      );
      activeRelationships = [...activeRelationships, activated];
      guardianDash = {
        linkedStudentsCount: activeRelationships.length,
        upcomingSessionsCount: 1,
        unreadUpdatesCount: 3,
        relationships: activeRelationships,
      };
      const { __activateMockGuardianPersona } = await import("@/services/home");
      __activateMockGuardianPersona();
      return { persona: "guardian" as const };
    },
    async getDashboard() {
      return guardianDash;
    },
  };
}

let guardianClient: GuardianClient = createMockGuardianClient();

export function getGuardianClient(): GuardianClient {
  return guardianClient;
}

export function setGuardianClient(client: GuardianClient): void {
  guardianClient = client;
}

export function __resetMockGuardian(): void {
  pendingRelationships = [
    {
      id: opaqueIdSchema.parse("rel_grd_pending_1"),
      studentDisplayName: "Sara",
      relationshipLabel: "Parent",
      organizationName: "Demo School",
      status: "pending",
    },
  ];
  activeRelationships = [];
  guardianDash = {
    linkedStudentsCount: 0,
    upcomingSessionsCount: 0,
    unreadUpdatesCount: 0,
    relationships: [],
  };
  guardianClient = createMockGuardianClient();
}
