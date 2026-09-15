import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const examSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  title: z.string().min(1),
  poolSize: z.number().int().positive(),
  randomize: z.boolean(),
  maxAttempts: z.number().int().positive(),
  timeLimitMinutes: z.number().int().positive().nullable(),
  status: z.enum(["draft", "published"]),
});
export type Exam = z.infer<typeof examSchema>;
export const examsCollectionSchema = collectionSchema(examSchema);

export type CreateExamInput = {
  title: string;
  poolSize: number;
  randomize: boolean;
  maxAttempts: number;
  timeLimitMinutes: number | null;
};

export type ExamsClient = {
  list(organizationId: string): Promise<z.infer<typeof examsCollectionSchema>>;
  create(organizationId: string, input: CreateExamInput): Promise<Exam>;
  publish(organizationId: string, examId: string): Promise<Exam>;
};

const memory = new Map<string, Exam[]>();

function meta(data: Exam[]) {
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

export function createHttpExamsClient(): ExamsClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/exams`,
        { parse: (data) => examsCollectionSchema.parse(data) },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/exams`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => examSchema.parse(data),
        },
      );
    },
    async publish(organizationId, examId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/exams/${encodeURIComponent(examId)}/publish`,
        {
          method: "POST",
          body: JSON.stringify({}),
          parse: (data) => examSchema.parse(data),
        },
      );
    },
  };
}

export function createMockExamsClient(): ExamsClient {
  return {
    async list(organizationId) {
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const row = examSchema.parse({
        id: opaqueIdSchema.parse(
          `exm_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        title: input.title.trim(),
        poolSize: input.poolSize,
        randomize: input.randomize,
        maxAttempts: input.maxAttempts,
        timeLimitMinutes: input.timeLimitMinutes,
        status: "draft",
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
    async publish(organizationId, examId) {
      const rows = memory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === examId);
      if (idx < 0) throw new Error("NOT_FOUND");
      const updated = examSchema.parse({
        ...rows[idx]!,
        status: "published",
      });
      memory.set(
        organizationId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      return updated;
    },
  };
}

let client: ExamsClient = createMockExamsClient();
export function getExamsClient() {
  return client;
}
export function setExamsClient(next: ExamsClient) {
  client = next;
}
export function __resetMockExams() {
  memory.clear();
  client = createMockExamsClient();
}

export function isExamPublishable(exam: Pick<Exam, "poolSize" | "status">) {
  return exam.status === "draft" && exam.poolSize > 0;
}
