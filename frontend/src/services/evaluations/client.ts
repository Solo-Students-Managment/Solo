import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const gradeScaleTypeSchema = z.enum([
  "out_of_20",
  "out_of_100",
  "pass_fail",
  "custom",
]);
export type GradeScaleType = z.infer<typeof gradeScaleTypeSchema>;

export const gradeScaleSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  type: gradeScaleTypeSchema,
  minValue: z.number().nullable(),
  maxValue: z.number().nullable(),
  passLabel: z.string().nullable(),
  failLabel: z.string().nullable(),
});
export type GradeScale = z.infer<typeof gradeScaleSchema>;
export const gradeScalesCollectionSchema = collectionSchema(gradeScaleSchema);

export const evaluationLevelSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  rank: z.number().int().min(1),
  description: z.string(),
});
export type EvaluationLevel = z.infer<typeof evaluationLevelSchema>;
export const evaluationLevelsCollectionSchema = collectionSchema(
  evaluationLevelSchema,
);

export const progressMetricKindSchema = z.enum(["core", "custom"]);
export type ProgressMetricKind = z.infer<typeof progressMetricKindSchema>;

export const progressMetricSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  kind: progressMetricKindSchema,
  unit: z.string().min(1),
});
export type ProgressMetric = z.infer<typeof progressMetricSchema>;
export const progressMetricsCollectionSchema =
  collectionSchema(progressMetricSchema);

export const evaluationTemplateSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  domain: z.string().min(1),
  scaleId: opaqueIdSchema,
  scaleName: z.string().min(1),
  levelId: opaqueIdSchema.nullable(),
  levelName: z.string().nullable(),
  progressMetricIds: z.array(opaqueIdSchema),
  description: z.string(),
});
export type EvaluationTemplate = z.infer<typeof evaluationTemplateSchema>;
export const evaluationTemplatesCollectionSchema = collectionSchema(
  evaluationTemplateSchema,
);

export type CreateGradeScaleInput = {
  name: string;
  type: GradeScaleType;
  minValue?: number | null;
  maxValue?: number | null;
  passLabel?: string | null;
  failLabel?: string | null;
};

export type CreateEvaluationLevelInput = {
  name: string;
  rank: number;
  description?: string;
};

export type CreateProgressMetricInput = {
  name: string;
  kind: ProgressMetricKind;
  unit: string;
};

export type CreateEvaluationTemplateInput = {
  name: string;
  domain: string;
  scaleId: string;
  levelId?: string | null;
  progressMetricIds?: string[];
  description?: string;
};

export type EvaluationsClient = {
  listTemplates(organizationId: string): Promise<{
    data: EvaluationTemplate[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  createTemplate(
    organizationId: string,
    input: CreateEvaluationTemplateInput,
  ): Promise<EvaluationTemplate>;
  listScales(organizationId: string): Promise<{
    data: GradeScale[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  createScale(
    organizationId: string,
    input: CreateGradeScaleInput,
  ): Promise<GradeScale>;
  listLevels(organizationId: string): Promise<{
    data: EvaluationLevel[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  createLevel(
    organizationId: string,
    input: CreateEvaluationLevelInput,
  ): Promise<EvaluationLevel>;
  listProgressMetrics(organizationId: string): Promise<{
    data: ProgressMetric[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  createProgressMetric(
    organizationId: string,
    input: CreateProgressMetricInput,
  ): Promise<ProgressMetric>;
};

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

const templates = new Map<string, EvaluationTemplate>();
const scales = new Map<string, GradeScale>();
const levels = new Map<string, EvaluationLevel>();
const metrics = new Map<string, ProgressMetric>();

function newOpaque(prefix: string) {
  return opaqueIdSchema.parse(
    `${prefix}_${Math.random().toString(36).slice(2, 10)}`,
  );
}

export function createHttpEvaluationsClient(): EvaluationsClient {
  return {
    async listTemplates(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/evaluation-templates`,
        {
          parse: (data) => evaluationTemplatesCollectionSchema.parse(data),
        },
      );
    },
    async createTemplate(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/evaluation-templates`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => evaluationTemplateSchema.parse(data),
        },
      );
    },
    async listScales(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/grade-scales`,
        {
          parse: (data) => gradeScalesCollectionSchema.parse(data),
        },
      );
    },
    async createScale(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/grade-scales`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => gradeScaleSchema.parse(data),
        },
      );
    },
    async listLevels(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/evaluation-levels`,
        {
          parse: (data) => evaluationLevelsCollectionSchema.parse(data),
        },
      );
    },
    async createLevel(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/evaluation-levels`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => evaluationLevelSchema.parse(data),
        },
      );
    },
    async listProgressMetrics(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/progress-metrics`,
        {
          parse: (data) => progressMetricsCollectionSchema.parse(data),
        },
      );
    },
    async createProgressMetric(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/progress-metrics`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => progressMetricSchema.parse(data),
        },
      );
    },
  };
}

export function createMockEvaluationsClient(): EvaluationsClient {
  return {
    async listTemplates(organizationId) {
      const data = [...templates.values()].filter(
        (row) => String(row.organizationId) === organizationId,
      );
      return collectionMeta(data);
    },
    async createTemplate(organizationId, input) {
      const scale = scales.get(input.scaleId);
      if (!scale || String(scale.organizationId) !== organizationId) {
        throw new Error("evaluations.scaleNotFound");
      }
      const level =
        input.levelId != null && input.levelId !== ""
          ? levels.get(input.levelId)
          : null;
      if (
        input.levelId &&
        (!level || String(level.organizationId) !== organizationId)
      ) {
        throw new Error("evaluations.levelNotFound");
      }
      const metricIds = (input.progressMetricIds ?? []).filter((id) => {
        const metric = metrics.get(id);
        return metric && String(metric.organizationId) === organizationId;
      });
      const row = evaluationTemplateSchema.parse({
        id: newOpaque("evt"),
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        domain: input.domain.trim(),
        scaleId: scale.id,
        scaleName: scale.name,
        levelId: level?.id ?? null,
        levelName: level?.name ?? null,
        progressMetricIds: metricIds,
        description: (input.description ?? "").trim(),
      });
      templates.set(row.id, row);
      return row;
    },
    async listScales(organizationId) {
      const data = [...scales.values()].filter(
        (row) => String(row.organizationId) === organizationId,
      );
      return collectionMeta(data);
    },
    async createScale(organizationId, input) {
      const defaults = scaleBoundsForType(input.type);
      const row = gradeScaleSchema.parse({
        id: newOpaque("esc"),
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        type: input.type,
        minValue:
          input.type === "custom" ? (input.minValue ?? 0) : defaults.minValue,
        maxValue:
          input.type === "custom" ? (input.maxValue ?? 100) : defaults.maxValue,
        passLabel:
          input.type === "pass_fail" ? input.passLabel?.trim() || "Pass" : null,
        failLabel:
          input.type === "pass_fail" ? input.failLabel?.trim() || "Fail" : null,
      });
      scales.set(row.id, row);
      return row;
    },
    async listLevels(organizationId) {
      const data = [...levels.values()]
        .filter((row) => String(row.organizationId) === organizationId)
        .sort((a, b) => a.rank - b.rank);
      return collectionMeta(data);
    },
    async createLevel(organizationId, input) {
      const row = evaluationLevelSchema.parse({
        id: newOpaque("elv"),
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        rank: input.rank,
        description: (input.description ?? "").trim(),
      });
      levels.set(row.id, row);
      return row;
    },
    async listProgressMetrics(organizationId) {
      const data = [...metrics.values()].filter(
        (row) => String(row.organizationId) === organizationId,
      );
      return collectionMeta(data);
    },
    async createProgressMetric(organizationId, input) {
      const row = progressMetricSchema.parse({
        id: newOpaque("epm"),
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        kind: input.kind,
        unit: input.unit.trim(),
      });
      metrics.set(row.id, row);
      return row;
    },
  };
}

export function scaleBoundsForType(type: GradeScaleType): {
  minValue: number | null;
  maxValue: number | null;
} {
  switch (type) {
    case "out_of_20":
      return { minValue: 0, maxValue: 20 };
    case "out_of_100":
      return { minValue: 0, maxValue: 100 };
    case "pass_fail":
      return { minValue: null, maxValue: null };
    case "custom":
      return { minValue: 0, maxValue: 100 };
  }
}

export function isScoreWithinScale(
  scale: Pick<GradeScale, "type" | "minValue" | "maxValue">,
  score: number,
): boolean {
  if (scale.type === "pass_fail") return false;
  const min = scale.minValue ?? 0;
  const max = scale.maxValue ?? 100;
  return score >= min && score <= max;
}

let evaluationsClient: EvaluationsClient = createMockEvaluationsClient();

export function getEvaluationsClient(): EvaluationsClient {
  return evaluationsClient;
}

export function setEvaluationsClient(client: EvaluationsClient): void {
  evaluationsClient = client;
}

export function __resetMockEvaluations(): void {
  templates.clear();
  scales.clear();
  levels.clear();
  metrics.clear();
  evaluationsClient = createMockEvaluationsClient();
}

export function __getMockEvaluationStores() {
  return { templates, scales, levels, metrics };
}
