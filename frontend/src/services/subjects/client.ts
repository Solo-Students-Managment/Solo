import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const subjectSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema.nullable(),
  name: z.string().min(1),
  code: z.string().min(1).max(16),
  levelLabel: z.string().min(1),
  teacherDisplayName: z.string().min(1),
  active: z.boolean(),
});
export type Subject = z.infer<typeof subjectSchema>;

export const subjectsCollectionSchema = collectionSchema(subjectSchema);
export type SubjectsCollection = z.infer<typeof subjectsCollectionSchema>;

export type CreateSubjectInput = {
  name: string;
  code: string;
  levelLabel: string;
  teacherDisplayName: string;
};

export type SubjectClient = {
  list(organizationId: string | null): Promise<SubjectsCollection>;
  create(organizationId: string, input: CreateSubjectInput): Promise<Subject>;
  setActive(subjectId: string, active: boolean): Promise<Subject>;
};

const subjects = new Map<string, Subject>();

function seedDefaults() {
  if (subjects.size > 0) return;
  const personal = subjectSchema.parse({
    id: opaqueIdSchema.parse("sub_math_personal"),
    organizationId: null,
    name: "Mathematics",
    code: "MATH",
    levelLabel: "Grade 8",
    teacherDisplayName: "Ms. Rezaei",
    active: true,
  });
  subjects.set(personal.id, personal);
}

seedDefaults();

export function createHttpSubjectClient(): SubjectClient {
  return {
    async list(organizationId) {
      const query = organizationId
        ? `?organizationId=${encodeURIComponent(organizationId)}`
        : "";
      return apiRequest(`/subjects${query}`, {
        parse: (data) => subjectsCollectionSchema.parse(data),
      });
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/subjects`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => subjectSchema.parse(data),
        },
      );
    },
    async setActive(subjectId, active) {
      return apiRequest(`/subjects/${encodeURIComponent(subjectId)}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
        parse: (data) => subjectSchema.parse(data),
      });
    },
  };
}

export function createMockSubjectClient(): SubjectClient {
  return {
    async list(organizationId) {
      seedDefaults();
      const data = [...subjects.values()].filter((row) =>
        organizationId
          ? String(row.organizationId) === organizationId
          : row.organizationId === null,
      );
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
        `sub_${Math.random().toString(36).slice(2, 10)}`,
      );
      const subject = subjectSchema.parse({
        id,
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        code: input.code.trim().toUpperCase(),
        levelLabel: input.levelLabel.trim(),
        teacherDisplayName: input.teacherDisplayName.trim(),
        active: true,
      });
      subjects.set(id, subject);
      return subject;
    },
    async setActive(subjectId, active) {
      const current = subjects.get(subjectId);
      if (!current) throw new Error("subject.notFound");
      const next = { ...current, active };
      subjects.set(subjectId, next);
      return next;
    },
  };
}

let subjectClient: SubjectClient = createMockSubjectClient();

export function getSubjectClient(): SubjectClient {
  return subjectClient;
}

export function setSubjectClient(client: SubjectClient): void {
  subjectClient = client;
}

export function __resetMockSubjects(): void {
  subjects.clear();
  seedDefaults();
  subjectClient = createMockSubjectClient();
}
