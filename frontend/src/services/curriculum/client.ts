import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const curriculumModuleSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  title: z.string().min(1),
  description: z.string(),
  sortOrder: z.number().int().nonnegative(),
});
export type CurriculumModule = z.infer<typeof curriculumModuleSchema>;
export const curriculumModulesCollectionSchema = collectionSchema(
  curriculumModuleSchema,
);

export const curriculumUnitSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  moduleId: opaqueIdSchema,
  moduleTitle: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  sortOrder: z.number().int().nonnegative(),
  prerequisiteUnitId: opaqueIdSchema.nullable(),
});
export type CurriculumUnit = z.infer<typeof curriculumUnitSchema>;
export const curriculumUnitsCollectionSchema =
  collectionSchema(curriculumUnitSchema);

export const lessonKindSchema = z.enum(["lesson", "topic"]);
export type LessonKind = z.infer<typeof lessonKindSchema>;

export const curriculumLessonSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  unitId: opaqueIdSchema,
  unitTitle: z.string().min(1),
  title: z.string().min(1),
  kind: lessonKindSchema,
  objectives: z.string(),
  resources: z.string(),
  homework: z.string(),
  examRef: z.string().nullable(),
  durationMinutes: z.number().int().positive(),
  prerequisiteLessonId: opaqueIdSchema.nullable(),
  progressPercent: z.number().int().min(0).max(100),
});
export type CurriculumLesson = z.infer<typeof curriculumLessonSchema>;
export const curriculumLessonsCollectionSchema = collectionSchema(
  curriculumLessonSchema,
);

export type CreateModuleInput = {
  title: string;
  description?: string;
  sortOrder: number;
};

export type CreateUnitInput = {
  moduleId: string;
  title: string;
  description?: string;
  sortOrder: number;
  prerequisiteUnitId?: string | null;
};

export type CreateLessonInput = {
  unitId: string;
  title: string;
  kind: LessonKind;
  objectives?: string;
  resources?: string;
  homework?: string;
  examRef?: string | null;
  durationMinutes: number;
  prerequisiteLessonId?: string | null;
  progressPercent?: number;
};

type CollectionMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type CurriculumClient = {
  listModules(
    organizationId: string,
  ): Promise<{ data: CurriculumModule[]; meta: CollectionMeta }>;
  createModule(
    organizationId: string,
    input: CreateModuleInput,
  ): Promise<CurriculumModule>;
  listUnits(
    organizationId: string,
  ): Promise<{ data: CurriculumUnit[]; meta: CollectionMeta }>;
  createUnit(
    organizationId: string,
    input: CreateUnitInput,
  ): Promise<CurriculumUnit>;
  listLessons(
    organizationId: string,
  ): Promise<{ data: CurriculumLesson[]; meta: CollectionMeta }>;
  createLesson(
    organizationId: string,
    input: CreateLessonInput,
  ): Promise<CurriculumLesson>;
};

function meta<T>(data: T[]) {
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

const modulesMemory = new Map<string, CurriculumModule[]>();
const unitsMemory = new Map<string, CurriculumUnit[]>();
const lessonsMemory = new Map<string, CurriculumLesson[]>();

export function createHttpCurriculumClient(): CurriculumClient {
  return {
    async listModules(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/curriculum-modules`,
        { parse: (data) => curriculumModulesCollectionSchema.parse(data) },
      );
    },
    async createModule(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/curriculum-modules`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => curriculumModuleSchema.parse(data),
        },
      );
    },
    async listUnits(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/curriculum-units`,
        { parse: (data) => curriculumUnitsCollectionSchema.parse(data) },
      );
    },
    async createUnit(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/curriculum-units`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => curriculumUnitSchema.parse(data),
        },
      );
    },
    async listLessons(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/curriculum-lessons`,
        { parse: (data) => curriculumLessonsCollectionSchema.parse(data) },
      );
    },
    async createLesson(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/curriculum-lessons`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => curriculumLessonSchema.parse(data),
        },
      );
    },
  };
}

export function createMockCurriculumClient(): CurriculumClient {
  return {
    async listModules(organizationId) {
      return meta(modulesMemory.get(organizationId) ?? []);
    },
    async createModule(organizationId, input) {
      const row = curriculumModuleSchema.parse({
        id: opaqueIdSchema.parse(
          `cmod_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        title: input.title.trim(),
        description: (input.description ?? "").trim(),
        sortOrder: input.sortOrder,
      });
      modulesMemory.set(organizationId, [
        ...(modulesMemory.get(organizationId) ?? []),
        row,
      ]);
      return row;
    },
    async listUnits(organizationId) {
      return meta(unitsMemory.get(organizationId) ?? []);
    },
    async createUnit(organizationId, input) {
      const mod = (modulesMemory.get(organizationId) ?? []).find(
        (row) => String(row.id) === input.moduleId,
      );
      if (!mod) throw new Error("NOT_FOUND");
      const row = curriculumUnitSchema.parse({
        id: opaqueIdSchema.parse(
          `cunit_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        moduleId: mod.id,
        moduleTitle: mod.title,
        title: input.title.trim(),
        description: (input.description ?? "").trim(),
        sortOrder: input.sortOrder,
        prerequisiteUnitId: input.prerequisiteUnitId
          ? opaqueIdSchema.parse(input.prerequisiteUnitId)
          : null,
      });
      unitsMemory.set(organizationId, [
        ...(unitsMemory.get(organizationId) ?? []),
        row,
      ]);
      return row;
    },
    async listLessons(organizationId) {
      return meta(lessonsMemory.get(organizationId) ?? []);
    },
    async createLesson(organizationId, input) {
      const unit = (unitsMemory.get(organizationId) ?? []).find(
        (row) => String(row.id) === input.unitId,
      );
      if (!unit) throw new Error("NOT_FOUND");
      const row = curriculumLessonSchema.parse({
        id: opaqueIdSchema.parse(
          `cles_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        unitId: unit.id,
        unitTitle: unit.title,
        title: input.title.trim(),
        kind: input.kind,
        objectives: (input.objectives ?? "").trim(),
        resources: (input.resources ?? "").trim(),
        homework: (input.homework ?? "").trim(),
        examRef: input.examRef?.trim() || null,
        durationMinutes: input.durationMinutes,
        prerequisiteLessonId: input.prerequisiteLessonId
          ? opaqueIdSchema.parse(input.prerequisiteLessonId)
          : null,
        progressPercent: input.progressPercent ?? 0,
      });
      lessonsMemory.set(organizationId, [
        ...(lessonsMemory.get(organizationId) ?? []),
        row,
      ]);
      return row;
    },
  };
}

let client: CurriculumClient = createMockCurriculumClient();
export function getCurriculumClient() {
  return client;
}
export function setCurriculumClient(next: CurriculumClient) {
  client = next;
}
export function __resetMockCurriculum() {
  modulesMemory.clear();
  unitsMemory.clear();
  lessonsMemory.clear();
  client = createMockCurriculumClient();
}

/** Pure helper: a unit can host lessons only when attached to a module. */
export function canHostLessons(unit: Pick<CurriculumUnit, "moduleId">) {
  return Boolean(unit.moduleId);
}

/** Pure helper: progress clamp for curriculum lesson tracking. */
export function clampLessonProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}
