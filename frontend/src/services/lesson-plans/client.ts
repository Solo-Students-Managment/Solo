import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const lessonPlanVisibilitySchema = z.enum([
  "personal",
  "school",
  "specific",
  "public",
]);
export type LessonPlanVisibility = z.infer<typeof lessonPlanVisibilitySchema>;

export const lessonPlanSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  title: z.string().min(1),
  bodyHtml: z.string().min(1),
  visibility: lessonPlanVisibilitySchema,
  moduleRef: z.string().nullable(),
  version: z.number().int().positive(),
  snapshotOfId: opaqueIdSchema.nullable(),
  clonedFromId: opaqueIdSchema.nullable(),
});
export type LessonPlan = z.infer<typeof lessonPlanSchema>;
export const lessonPlansCollectionSchema = collectionSchema(lessonPlanSchema);

export type CreateLessonPlanInput = {
  title: string;
  bodyHtml: string;
  visibility: LessonPlanVisibility;
  moduleRef?: string | null;
};

export type LessonPlansClient = {
  list(organizationId: string): Promise<{
    data: LessonPlan[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(
    organizationId: string,
    input: CreateLessonPlanInput,
  ): Promise<LessonPlan>;
  clone(organizationId: string, planId: string): Promise<LessonPlan>;
  snapshot(organizationId: string, planId: string): Promise<LessonPlan>;
};

const memory = new Map<string, LessonPlan[]>();

function meta(data: LessonPlan[]) {
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

export function hasMeaningfulBody(html: string) {
  return stripHtml(html).length > 0;
}

/** Pure: cloning must bump version and keep source immutable identity. */
export function nextCloneVersion(sourceVersion: number) {
  return sourceVersion + 1;
}

export function createHttpLessonPlansClient(): LessonPlansClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/lesson-plans`,
        { parse: (data) => lessonPlansCollectionSchema.parse(data) },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/lesson-plans`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => lessonPlanSchema.parse(data),
        },
      );
    },
    async clone(organizationId, planId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/lesson-plans/${encodeURIComponent(planId)}/clone`,
        {
          method: "POST",
          body: JSON.stringify({}),
          parse: (data) => lessonPlanSchema.parse(data),
        },
      );
    },
    async snapshot(organizationId, planId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/lesson-plans/${encodeURIComponent(planId)}/snapshot`,
        {
          method: "POST",
          body: JSON.stringify({}),
          parse: (data) => lessonPlanSchema.parse(data),
        },
      );
    },
  };
}

export function createMockLessonPlansClient(): LessonPlansClient {
  return {
    async list(organizationId) {
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const row = lessonPlanSchema.parse({
        id: opaqueIdSchema.parse(
          `lplan_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        title: input.title.trim(),
        bodyHtml: input.bodyHtml,
        visibility: input.visibility,
        moduleRef: input.moduleRef?.trim() || null,
        version: 1,
        snapshotOfId: null,
        clonedFromId: null,
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
    async clone(organizationId, planId) {
      const rows = memory.get(organizationId) ?? [];
      const source = rows.find((row) => String(row.id) === planId);
      if (!source) throw new Error("NOT_FOUND");
      const cloned = lessonPlanSchema.parse({
        ...source,
        id: opaqueIdSchema.parse(
          `lplan_${Math.random().toString(36).slice(2, 10)}`,
        ),
        version: nextCloneVersion(source.version),
        snapshotOfId: null,
        clonedFromId: source.id,
      });
      memory.set(organizationId, [...rows, cloned]);
      return cloned;
    },
    async snapshot(organizationId, planId) {
      const rows = memory.get(organizationId) ?? [];
      const source = rows.find((row) => String(row.id) === planId);
      if (!source) throw new Error("NOT_FOUND");
      const snap = lessonPlanSchema.parse({
        ...source,
        id: opaqueIdSchema.parse(
          `lplan_${Math.random().toString(36).slice(2, 10)}`,
        ),
        title: `${source.title} (snapshot)`,
        version: source.version,
        snapshotOfId: source.id,
        clonedFromId: null,
      });
      memory.set(organizationId, [...rows, snap]);
      return snap;
    },
  };
}

let client: LessonPlansClient = createMockLessonPlansClient();
export function getLessonPlansClient() {
  return client;
}
export function setLessonPlansClient(next: LessonPlansClient) {
  client = next;
}
export function __resetMockLessonPlans() {
  memory.clear();
  client = createMockLessonPlansClient();
}
