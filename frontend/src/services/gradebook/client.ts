import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const gradeEntrySchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  studentDisplayName: z.string().min(1),
  subjectName: z.string().min(1),
  score: z.number().min(0).max(100),
  published: z.boolean(),
});
export type GradeEntry = z.infer<typeof gradeEntrySchema>;
export const gradebookCollectionSchema = collectionSchema(gradeEntrySchema);

export type GradebookClient = {
  list(
    organizationId: string,
  ): Promise<z.infer<typeof gradebookCollectionSchema>>;
  upsert(
    organizationId: string,
    input: { studentDisplayName: string; subjectName: string; score: number },
  ): Promise<GradeEntry>;
};

const memory = new Map<string, GradeEntry[]>();

export function createHttpGradebookClient(): GradebookClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/gradebook`,
        {
          parse: (data) => gradebookCollectionSchema.parse(data),
        },
      );
    },
    async upsert(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/gradebook`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => gradeEntrySchema.parse(data),
        },
      );
    },
  };
}

export function createMockGradebookClient(): GradebookClient {
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
    async upsert(organizationId, input) {
      const rows = memory.get(organizationId) ?? [];
      const existing = rows.findIndex(
        (r) =>
          r.studentDisplayName === input.studentDisplayName &&
          r.subjectName === input.subjectName,
      );
      const id =
        existing >= 0
          ? rows[existing]!.id
          : opaqueIdSchema.parse(
              `grd_${Math.random().toString(36).slice(2, 10)}`,
            );
      const item = gradeEntrySchema.parse({
        id,
        organizationId: opaqueIdSchema.parse(organizationId),
        studentDisplayName: input.studentDisplayName.trim(),
        subjectName: input.subjectName.trim(),
        score: input.score,
        published: true,
      });
      const next =
        existing >= 0
          ? rows.map((r, i) => (i === existing ? item : r))
          : [...rows, item];
      memory.set(organizationId, next);
      return item;
    },
  };
}

let client: GradebookClient = createMockGradebookClient();
export function getGradebookClient() {
  return client;
}
export function setGradebookClient(next: GradebookClient) {
  client = next;
}
