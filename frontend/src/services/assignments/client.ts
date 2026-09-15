import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const assignmentCollaborationModeSchema = z.enum([
  "individual",
  "group",
]);
export type AssignmentCollaborationMode = z.infer<
  typeof assignmentCollaborationModeSchema
>;

export const gradeReleaseStateSchema = z.enum(["hidden", "released"]);
export type GradeReleaseState = z.infer<typeof gradeReleaseStateSchema>;

export const assignmentSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  title: z.string().min(1),
  type: z.enum([
    "homework",
    "project",
    "essay",
    "presentation",
    "research",
    "practice",
    "custom",
  ]),
  dueAt: z.string().min(1),
  status: z.enum(["draft", "published", "closed"]),
  submissionsCount: z.number().int().nonnegative(),
  collaborationMode: assignmentCollaborationModeSchema.default("individual"),
  peerReviewEnabled: z.boolean().default(false),
  maxRevisions: z.number().int().nonnegative().default(1),
  gradeRelease: gradeReleaseStateSchema.default("hidden"),
  teamsCount: z.number().int().nonnegative().default(0),
  peerReviewsCount: z.number().int().nonnegative().default(0),
  revisionsCount: z.number().int().nonnegative().default(0),
});
export type Assignment = z.infer<typeof assignmentSchema>;
export const assignmentsCollectionSchema = collectionSchema(assignmentSchema);

export const submissionMimeSchema = z.enum(["pdf", "word", "image", "audio"]);
export type SubmissionMime = z.infer<typeof submissionMimeSchema>;

export const assignmentTeamSchema = z.object({
  id: opaqueIdSchema,
  assignmentId: opaqueIdSchema,
  name: z.string().min(1),
  memberNames: z.array(z.string().min(1)).min(1),
});
export type AssignmentTeam = z.infer<typeof assignmentTeamSchema>;
export const assignmentTeamsCollectionSchema =
  collectionSchema(assignmentTeamSchema);

export type CreateAssignmentInput = {
  title: string;
  type: Assignment["type"];
  dueAt: string;
  collaborationMode?: AssignmentCollaborationMode;
  peerReviewEnabled?: boolean;
  maxRevisions?: number;
};

export type AssignmentsClient = {
  list(
    organizationId: string,
  ): Promise<z.infer<typeof assignmentsCollectionSchema>>;
  create(
    organizationId: string,
    input: CreateAssignmentInput,
  ): Promise<Assignment>;
  submit(
    organizationId: string,
    assignmentId: string,
    input: { studentDisplayName: string; mimeHint: SubmissionMime },
  ): Promise<Assignment>;
  listTeams(
    organizationId: string,
    assignmentId: string,
  ): Promise<z.infer<typeof assignmentTeamsCollectionSchema>>;
  createTeam(
    organizationId: string,
    assignmentId: string,
    input: { name: string; memberNames: string[] },
  ): Promise<AssignmentTeam>;
  addPeerReview(
    organizationId: string,
    assignmentId: string,
    input: { reviewerName: string; revieweeName: string; score: number },
  ): Promise<Assignment>;
  requestRevision(
    organizationId: string,
    assignmentId: string,
    input: { studentDisplayName: string; note?: string },
  ): Promise<Assignment>;
  releaseGrades(
    organizationId: string,
    assignmentId: string,
  ): Promise<Assignment>;
};

const memory = new Map<string, Assignment[]>();
const teamsMemory = new Map<string, AssignmentTeam[]>();

function teamKey(organizationId: string, assignmentId: string) {
  return `${organizationId}:${assignmentId}`;
}

function collectionMeta<T>(data: T[]) {
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

export function canRequestRevision(
  assignment: Pick<Assignment, "revisionsCount" | "maxRevisions">,
): boolean {
  return assignment.revisionsCount < assignment.maxRevisions;
}

export function createHttpAssignmentsClient(): AssignmentsClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/assignments`,
        {
          parse: (data) => assignmentsCollectionSchema.parse(data),
        },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/assignments`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => assignmentSchema.parse(data),
        },
      );
    },
    async submit(organizationId, assignmentId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/assignments/${encodeURIComponent(assignmentId)}/submissions`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => assignmentSchema.parse(data),
        },
      );
    },
    async listTeams(organizationId, assignmentId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/assignments/${encodeURIComponent(assignmentId)}/teams`,
        {
          parse: (data) => assignmentTeamsCollectionSchema.parse(data),
        },
      );
    },
    async createTeam(organizationId, assignmentId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/assignments/${encodeURIComponent(assignmentId)}/teams`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => assignmentTeamSchema.parse(data),
        },
      );
    },
    async addPeerReview(organizationId, assignmentId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/assignments/${encodeURIComponent(assignmentId)}/peer-reviews`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => assignmentSchema.parse(data),
        },
      );
    },
    async requestRevision(organizationId, assignmentId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/assignments/${encodeURIComponent(assignmentId)}/revisions`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => assignmentSchema.parse(data),
        },
      );
    },
    async releaseGrades(organizationId, assignmentId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/assignments/${encodeURIComponent(assignmentId)}/grade-release`,
        {
          method: "POST",
          body: JSON.stringify({}),
          parse: (data) => assignmentSchema.parse(data),
        },
      );
    },
  };
}

function findAssignment(organizationId: string, assignmentId: string) {
  const rows = memory.get(organizationId) ?? [];
  const idx = rows.findIndex((row) => String(row.id) === assignmentId);
  if (idx < 0) return null;
  return { rows, idx, current: rows[idx]! };
}

export function createMockAssignmentsClient(): AssignmentsClient {
  return {
    async list(organizationId) {
      return collectionMeta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const id = opaqueIdSchema.parse(
        `asg_${Math.random().toString(36).slice(2, 10)}`,
      );
      const item = assignmentSchema.parse({
        id,
        organizationId: opaqueIdSchema.parse(organizationId),
        title: input.title.trim(),
        type: input.type,
        dueAt: input.dueAt,
        status: "published",
        submissionsCount: 0,
        collaborationMode: input.collaborationMode ?? "individual",
        peerReviewEnabled: input.peerReviewEnabled ?? false,
        maxRevisions: input.maxRevisions ?? 1,
        gradeRelease: "hidden",
        teamsCount: 0,
        peerReviewsCount: 0,
        revisionsCount: 0,
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), item]);
      return item;
    },
    async submit(organizationId, assignmentId, input) {
      submissionMimeSchema.parse(input.mimeHint);
      const found = findAssignment(organizationId, assignmentId);
      if (!found) throw new Error("NOT_FOUND");
      const updated = assignmentSchema.parse({
        ...found.current,
        submissionsCount: found.current.submissionsCount + 1,
      });
      memory.set(
        organizationId,
        found.rows.map((row, index) => (index === found.idx ? updated : row)),
      );
      return updated;
    },
    async listTeams(organizationId, assignmentId) {
      return collectionMeta(
        teamsMemory.get(teamKey(organizationId, assignmentId)) ?? [],
      );
    },
    async createTeam(organizationId, assignmentId, input) {
      const found = findAssignment(organizationId, assignmentId);
      if (!found) throw new Error("NOT_FOUND");
      if (found.current.collaborationMode !== "group") {
        throw new Error("assignments.notGroup");
      }
      const team = assignmentTeamSchema.parse({
        id: opaqueIdSchema.parse(
          `atm_${Math.random().toString(36).slice(2, 10)}`,
        ),
        assignmentId: found.current.id,
        name: input.name.trim(),
        memberNames: input.memberNames
          .map((name) => name.trim())
          .filter(Boolean),
      });
      const key = teamKey(organizationId, assignmentId);
      teamsMemory.set(key, [...(teamsMemory.get(key) ?? []), team]);
      const updated = assignmentSchema.parse({
        ...found.current,
        teamsCount: found.current.teamsCount + 1,
      });
      memory.set(
        organizationId,
        found.rows.map((row, index) => (index === found.idx ? updated : row)),
      );
      return team;
    },
    async addPeerReview(organizationId, assignmentId, input) {
      const found = findAssignment(organizationId, assignmentId);
      if (!found) throw new Error("NOT_FOUND");
      if (!found.current.peerReviewEnabled) {
        throw new Error("assignments.peerReviewDisabled");
      }
      const updated = assignmentSchema.parse({
        ...found.current,
        peerReviewsCount: found.current.peerReviewsCount + 1,
      });
      memory.set(
        organizationId,
        found.rows.map((row, index) => (index === found.idx ? updated : row)),
      );
      void input;
      return updated;
    },
    async requestRevision(organizationId, assignmentId, input) {
      const found = findAssignment(organizationId, assignmentId);
      if (!found) throw new Error("NOT_FOUND");
      if (!canRequestRevision(found.current)) {
        throw new Error("assignments.revisionLimit");
      }
      const updated = assignmentSchema.parse({
        ...found.current,
        revisionsCount: found.current.revisionsCount + 1,
      });
      memory.set(
        organizationId,
        found.rows.map((row, index) => (index === found.idx ? updated : row)),
      );
      void input;
      return updated;
    },
    async releaseGrades(organizationId, assignmentId) {
      const found = findAssignment(organizationId, assignmentId);
      if (!found) throw new Error("NOT_FOUND");
      const updated = assignmentSchema.parse({
        ...found.current,
        gradeRelease: "released",
      });
      memory.set(
        organizationId,
        found.rows.map((row, index) => (index === found.idx ? updated : row)),
      );
      return updated;
    },
  };
}

let client: AssignmentsClient = createMockAssignmentsClient();
export function getAssignmentsClient() {
  return client;
}
export function setAssignmentsClient(next: AssignmentsClient) {
  client = next;
}
export function __resetMockAssignments() {
  memory.clear();
  teamsMemory.clear();
  client = createMockAssignmentsClient();
}

export function __getMockAssignmentTeams() {
  return teamsMemory;
}
