import { z } from "zod";

import { apiRequest, opaqueIdSchema } from "@/services/api";

export const studentRelationshipSchema = z.object({
  id: opaqueIdSchema,
  organizationName: z.string().min(1),
  subjectLabel: z.string().min(1),
  teacherDisplayName: z.string().min(1),
  status: z.enum(["pending", "active"]),
});
export type StudentRelationship = z.infer<typeof studentRelationshipSchema>;

export const studentDashboardSchema = z.object({
  activeSubjectsCount: z.number().int().nonnegative(),
  upcomingSessionsCount: z.number().int().nonnegative(),
  openAssignmentsCount: z.number().int().nonnegative(),
  relationships: z.array(studentRelationshipSchema),
});
export type StudentDashboard = z.infer<typeof studentDashboardSchema>;

export type StudentClient = {
  listPendingRelationships(): Promise<StudentRelationship[]>;
  acceptRelationship(relationshipId: string): Promise<{ persona: "student" }>;
  getDashboard(): Promise<StudentDashboard>;
};

let pendingRelationships: StudentRelationship[] = [
  {
    id: opaqueIdSchema.parse("rel_stu_pending_1"),
    organizationName: "Demo School",
    subjectLabel: "Mathematics",
    teacherDisplayName: "Ms. Rezaei",
    status: "pending",
  },
];

let activeRelationships: StudentRelationship[] = [];

let studentDash: StudentDashboard = {
  activeSubjectsCount: 0,
  upcomingSessionsCount: 0,
  openAssignmentsCount: 0,
  relationships: [],
};

export function createHttpStudentClient(): StudentClient {
  return {
    async listPendingRelationships() {
      return apiRequest("/student/relationships/pending", {
        parse: (data) => z.array(studentRelationshipSchema).parse(data),
      });
    },
    async acceptRelationship(relationshipId) {
      return apiRequest("/auth/personas/student/activate", {
        method: "POST",
        body: JSON.stringify({ relationshipId }),
        parse: (data) =>
          z.object({ persona: z.literal("student") }).parse(data),
      });
    },
    async getDashboard() {
      return apiRequest("/student/dashboard", {
        parse: (data) => studentDashboardSchema.parse(data),
      });
    },
  };
}

export function createMockStudentClient(): StudentClient {
  return {
    async listPendingRelationships() {
      return pendingRelationships.filter((r) => r.status === "pending");
    },
    async acceptRelationship(relationshipId) {
      const found = pendingRelationships.find(
        (r) => String(r.id) === relationshipId,
      );
      if (!found) throw new Error("student.relationship.notFound");
      const activated = { ...found, status: "active" as const };
      pendingRelationships = pendingRelationships.filter(
        (r) => String(r.id) !== relationshipId,
      );
      activeRelationships = [...activeRelationships, activated];
      studentDash = {
        activeSubjectsCount: activeRelationships.length,
        upcomingSessionsCount: 1,
        openAssignmentsCount: 2,
        relationships: activeRelationships,
      };
      const { __activateMockStudentPersona } = await import("@/services/home");
      __activateMockStudentPersona();
      return { persona: "student" as const };
    },
    async getDashboard() {
      return studentDash;
    },
  };
}

let studentClient: StudentClient = createMockStudentClient();

export function getStudentClient(): StudentClient {
  return studentClient;
}

export function setStudentClient(client: StudentClient): void {
  studentClient = client;
}

export function __resetMockStudent(): void {
  pendingRelationships = [
    {
      id: opaqueIdSchema.parse("rel_stu_pending_1"),
      organizationName: "Demo School",
      subjectLabel: "Mathematics",
      teacherDisplayName: "Ms. Rezaei",
      status: "pending",
    },
  ];
  activeRelationships = [];
  studentDash = {
    activeSubjectsCount: 0,
    upcomingSessionsCount: 0,
    openAssignmentsCount: 0,
    relationships: [],
  };
  studentClient = createMockStudentClient();
}
