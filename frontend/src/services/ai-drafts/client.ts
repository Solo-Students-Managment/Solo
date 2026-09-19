import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const draftTypeSchema = z.enum([
  "lesson",
  "feedback",
  "report",
  "question",
]);
export type DraftType = z.infer<typeof draftTypeSchema>;
export const draftStatusSchema = z.enum([
  "draft",
  "pending_review",
  "approved",
  "rejected",
]);
export type DraftStatus = z.infer<typeof draftStatusSchema>;

export const aiDraftSchema = z.object({
  id: opaqueIdSchema,
  type: draftTypeSchema,
  title: z.string().min(1),
  content: z.string().min(1),
  status: draftStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type AiDraft = z.infer<typeof aiDraftSchema>;

export function canApprove(draft: AiDraft): boolean {
  return draft.status === "pending_review" || draft.status === "draft";
}

export type AiDraftsClient = {
  list(): Promise<AiDraft[]>;
  create(input: {
    type: DraftType;
    title: string;
    content: string;
  }): Promise<AiDraft>;
  submitForReview(id: string): Promise<AiDraft>;
  approve(id: string): Promise<AiDraft>;
  reject(id: string, reason: string): Promise<AiDraft>;
};

export function createHttpAiDraftsClient(): AiDraftsClient {
  return {
    async list() {
      return apiRequest("/ai/drafts", {
        parse: (d) => z.array(aiDraftSchema).parse(d),
      });
    },
    async create(input) {
      return apiRequest("/ai/drafts", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (d) => aiDraftSchema.parse(d),
      });
    },
    async submitForReview(id) {
      return apiRequest(`/ai/drafts/${encodeURIComponent(id)}/submit`, {
        method: "POST",
        parse: (d) => aiDraftSchema.parse(d),
      });
    },
    async approve(id) {
      return apiRequest(`/ai/drafts/${encodeURIComponent(id)}/approve`, {
        method: "POST",
        parse: (d) => aiDraftSchema.parse(d),
      });
    },
    async reject(id, reason) {
      return apiRequest(`/ai/drafts/${encodeURIComponent(id)}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
        parse: (d) => aiDraftSchema.parse(d),
      });
    },
  };
}

export function createMockAiDraftsClient(): AiDraftsClient {
  const rows = new Map<string, AiDraft>();
  let seq = 2;
  rows.set(
    "aid_1",
    aiDraftSchema.parse({
      id: "aid_1",
      type: "lesson",
      title: "Geometry intro",
      content: "Draft lesson outline (requires human review before publish).",
      status: "pending_review",
      createdAt: "2026-09-18T10:00:00.000Z",
      updatedAt: "2026-09-18T10:00:00.000Z",
    }),
  );
  return {
    async list() {
      return Array.from(rows.values());
    },
    async create(input) {
      const row = aiDraftSchema.parse({
        id: `aid_${seq++}`,
        ...input,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      rows.set(String(row.id), row);
      return row;
    },
    async submitForReview(id) {
      const row = rows.get(id);
      if (!row) throw new Error("not_found");
      const next = aiDraftSchema.parse({
        ...row,
        status: "pending_review",
        updatedAt: new Date().toISOString(),
      });
      rows.set(id, next);
      return next;
    },
    async approve(id) {
      const row = rows.get(id);
      if (!row) throw new Error("not_found");
      if (!canApprove(row)) throw new Error("invalid_status");
      const next = aiDraftSchema.parse({
        ...row,
        status: "approved",
        updatedAt: new Date().toISOString(),
      });
      rows.set(id, next);
      return next;
    },
    async reject(id, reason) {
      const row = rows.get(id);
      if (!row) throw new Error("not_found");
      const next = aiDraftSchema.parse({
        ...row,
        status: "rejected",
        content: `${row.content}\nRejected: ${reason}`,
        updatedAt: new Date().toISOString(),
      });
      rows.set(id, next);
      return next;
    },
  };
}

let active: AiDraftsClient = createMockAiDraftsClient();
export function setAiDraftsClient(c: AiDraftsClient) {
  active = c;
}
export function getAiDraftsClient() {
  return active;
}
