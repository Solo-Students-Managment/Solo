import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const questionTypeSchema = z.enum([
  "mcq",
  "multi_select",
  "true_false",
  "short",
  "essay",
  "fill",
  "match",
  "order",
  "file",
  "audio",
  "image",
]);
export type QuestionType = z.infer<typeof questionTypeSchema>;

export const questionVisibilitySchema = z.enum([
  "private",
  "personal",
  "shared",
  "school",
  "public",
]);
export type QuestionVisibility = z.infer<typeof questionVisibilitySchema>;

export const bankQuestionSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  promptHtml: z.string().min(1),
  type: questionTypeSchema,
  visibility: questionVisibilitySchema,
  tags: z.array(z.string()),
  version: z.number().int().positive(),
  forkedFromId: opaqueIdSchema.nullable(),
});
export type BankQuestion = z.infer<typeof bankQuestionSchema>;
export const bankQuestionsCollectionSchema =
  collectionSchema(bankQuestionSchema);

export type CreateBankQuestionInput = {
  promptHtml: string;
  type: QuestionType;
  visibility: QuestionVisibility;
  tags: string[];
};

export type QuestionBankClient = {
  list(organizationId: string): Promise<{
    data: BankQuestion[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(
    organizationId: string,
    input: CreateBankQuestionInput,
  ): Promise<BankQuestion>;
  fork(organizationId: string, questionId: string): Promise<BankQuestion>;
};

const memory = new Map<string, BankQuestion[]>();

function collectionMeta(data: BankQuestion[]) {
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

export function createHttpQuestionBankClient(): QuestionBankClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/question-bank`,
        {
          parse: (data) => bankQuestionsCollectionSchema.parse(data),
        },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/question-bank`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => bankQuestionSchema.parse(data),
        },
      );
    },
    async fork(organizationId, questionId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/question-bank/${encodeURIComponent(questionId)}/fork`,
        {
          method: "POST",
          body: JSON.stringify({}),
          parse: (data) => bankQuestionSchema.parse(data),
        },
      );
    },
  };
}

export function createMockQuestionBankClient(): QuestionBankClient {
  return {
    async list(organizationId) {
      return collectionMeta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const row = bankQuestionSchema.parse({
        id: opaqueIdSchema.parse(
          `qbq_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        promptHtml: input.promptHtml,
        type: input.type,
        visibility: input.visibility,
        tags: input.tags,
        version: 1,
        forkedFromId: null,
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
    async fork(organizationId, questionId) {
      const rows = memory.get(organizationId) ?? [];
      const source = rows.find((row) => String(row.id) === questionId);
      if (!source) throw new Error("NOT_FOUND");
      const forked = bankQuestionSchema.parse({
        ...source,
        id: opaqueIdSchema.parse(
          `qbq_${Math.random().toString(36).slice(2, 10)}`,
        ),
        version: 1,
        forkedFromId: source.id,
        visibility: "private",
      });
      memory.set(organizationId, [...rows, forked]);
      return forked;
    },
  };
}

let client: QuestionBankClient = createMockQuestionBankClient();
export function getQuestionBankClient() {
  return client;
}
export function setQuestionBankClient(next: QuestionBankClient) {
  client = next;
}
export function __resetMockQuestionBank() {
  memory.clear();
  client = createMockQuestionBankClient();
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseQuestionTags(raw: string): string[] {
  return raw
    .split(/[,،]/)
    .map((part) => part.trim())
    .filter(Boolean);
}
