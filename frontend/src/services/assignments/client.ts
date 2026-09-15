import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

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
});
export type Assignment = z.infer<typeof assignmentSchema>;
export const assignmentsCollectionSchema = collectionSchema(assignmentSchema);

export const submissionMimeSchema = z.enum(["pdf", "word", "image", "audio"]);
export type SubmissionMime = z.infer<typeof submissionMimeSchema>;

export type AssignmentsClient = {
  list(
    organizationId: string,
  ): Promise<z.infer<typeof assignmentsCollectionSchema>>;
  create(
    organizationId: string,
    input: { title: string; type: Assignment["type"]; dueAt: string },
  ): Promise<Assignment>;
  submit(
    organizationId: string,
    assignmentId: string,
    input: { studentDisplayName: string; mimeHint: SubmissionMime },
  ): Promise<Assignment>;
};

const memory = new Map<string, Assignment[]>();

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
  };
}

export function createMockAssignmentsClient(): AssignmentsClient {
  return {
    async list(organizationId) {
      const data = memory.get(organizationId) ?? [];
      return {
        data,
        meta: {
          page: 1,
          pageSize: Math.max(data.length, 1),
          totalItems: data.length,
          totalPages: 1,
        },
      };
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
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), item]);
      return item;
    },
    async submit(organizationId, assignmentId, input) {
      submissionMimeSchema.parse(input.mimeHint);
      const rows = memory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === assignmentId);
      if (idx < 0) {
        throw new Error("NOT_FOUND");
      }
      const current = rows[idx]!;
      const updated = assignmentSchema.parse({
        ...current,
        submissionsCount: current.submissionsCount + 1,
      });
      memory.set(
        organizationId,
        rows.map((row, index) => (index === idx ? updated : row)),
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
  client = createMockAssignmentsClient();
}
