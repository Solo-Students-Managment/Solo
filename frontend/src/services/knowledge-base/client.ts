import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const kbArticleStatusSchema = z.enum([
  "draft",
  "in_review",
  "published",
]);
export type KbArticleStatus = z.infer<typeof kbArticleStatusSchema>;

export const kbArticleSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  title: z.string().min(1),
  spaceName: z.string().min(1),
  bodyHtml: z.string().min(1),
  tags: z.string(),
  status: kbArticleStatusSchema,
  version: z.number().int().positive(),
});
export type KbArticle = z.infer<typeof kbArticleSchema>;
export const kbArticlesCollectionSchema = collectionSchema(kbArticleSchema);

export type CreateKbArticleInput = {
  title: string;
  spaceName: string;
  bodyHtml: string;
  tags: string;
};

export type KnowledgeBaseClient = {
  list(organizationId: string): Promise<{
    data: KbArticle[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(
    organizationId: string,
    input: CreateKbArticleInput,
  ): Promise<KbArticle>;
  updateStatus(
    organizationId: string,
    articleId: string,
    status: KbArticleStatus,
  ): Promise<KbArticle>;
};

const memory = new Map<string, KbArticle[]>();
function meta(data: KbArticle[]) {
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

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasMeaningfulKbBody(html: string) {
  return stripHtml(html).length > 0;
}

const ALLOWED: Record<KbArticleStatus, KbArticleStatus[]> = {
  draft: ["in_review"],
  in_review: ["published", "draft"],
  published: ["draft"],
};

export function canTransitionKbStatus(
  from: KbArticleStatus,
  to: KbArticleStatus,
) {
  if (from === to) return false;
  return ALLOWED[from].includes(to);
}

export function createHttpKnowledgeBaseClient(): KnowledgeBaseClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/knowledge-base`,
        {
          parse: (data) => kbArticlesCollectionSchema.parse(data),
        },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/knowledge-base`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => kbArticleSchema.parse(data),
        },
      );
    },
    async updateStatus(organizationId, articleId, status) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/knowledge-base/${encodeURIComponent(articleId)}/status`,
        {
          method: "POST",
          body: JSON.stringify({ status }),
          parse: (data) => kbArticleSchema.parse(data),
        },
      );
    },
  };
}

export function createMockKnowledgeBaseClient(): KnowledgeBaseClient {
  return {
    async list(organizationId) {
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      if (!hasMeaningfulKbBody(input.bodyHtml)) {
        throw new Error("empty body");
      }
      const row = kbArticleSchema.parse({
        id: opaqueIdSchema.parse(
          `kb_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        title: input.title.trim(),
        spaceName: input.spaceName.trim(),
        bodyHtml: input.bodyHtml,
        tags: input.tags.trim(),
        status: "draft",
        version: 1,
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
    async updateStatus(organizationId, articleId, status) {
      const rows = memory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === String(articleId));
      if (idx < 0) throw new Error("not found");
      const current = rows[idx]!;
      if (!canTransitionKbStatus(current.status, status)) {
        throw new Error("invalid transition");
      }
      const updated = kbArticleSchema.parse({
        ...current,
        status,
        version: status === "published" ? current.version + 1 : current.version,
      });
      const next = [...rows];
      next[idx] = updated;
      memory.set(organizationId, next);
      return updated;
    },
  };
}

let client: KnowledgeBaseClient = createMockKnowledgeBaseClient();
export function getKnowledgeBaseClient() {
  return client;
}
export function setKnowledgeBaseClient(next: KnowledgeBaseClient) {
  client = next;
}
export function __resetMockKnowledgeBase() {
  memory.clear();
  client = createMockKnowledgeBaseClient();
}
