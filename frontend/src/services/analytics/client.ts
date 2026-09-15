import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const savedViewSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  metricKey: z.string().min(1),
  alertThreshold: z.number(),
});
export type SavedView = z.infer<typeof savedViewSchema>;
export const savedViewsCollectionSchema = collectionSchema(savedViewSchema);

export const goalSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  targetValue: z.number(),
  currentValue: z.number(),
});
export type Goal = z.infer<typeof goalSchema>;
export const goalsCollectionSchema = collectionSchema(goalSchema);

export type CreateSavedViewInput = {
  name: string;
  metricKey: string;
  alertThreshold: number;
};

export type CreateGoalInput = {
  name: string;
  targetValue: number;
};

export type AnalyticsClient = {
  listViews(organizationId: string): Promise<{
    data: SavedView[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  listGoals(organizationId: string): Promise<{
    data: Goal[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  createView(
    organizationId: string,
    input: CreateSavedViewInput,
  ): Promise<SavedView>;
  createGoal(organizationId: string, input: CreateGoalInput): Promise<Goal>;
  updateGoalProgress(
    organizationId: string,
    goalId: string,
    currentValue: number,
  ): Promise<Goal>;
};

const viewMemory = new Map<string, SavedView[]>();
const goalMemory = new Map<string, Goal[]>();

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

export function isGoalMet(goal: Goal) {
  return goal.currentValue >= goal.targetValue;
}

export function createHttpAnalyticsClient(): AnalyticsClient {
  return {
    async listViews(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/analytics/views`,
        { parse: (data) => savedViewsCollectionSchema.parse(data) },
      );
    },
    async listGoals(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/analytics/goals`,
        { parse: (data) => goalsCollectionSchema.parse(data) },
      );
    },
    async createView(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/analytics/views`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => savedViewSchema.parse(data),
        },
      );
    },
    async createGoal(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/analytics/goals`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => goalSchema.parse(data),
        },
      );
    },
    async updateGoalProgress(organizationId, goalId, currentValue) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/analytics/goals/${encodeURIComponent(goalId)}/progress`,
        {
          method: "POST",
          body: JSON.stringify({ currentValue }),
          parse: (data) => goalSchema.parse(data),
        },
      );
    },
  };
}

export function createMockAnalyticsClient(): AnalyticsClient {
  return {
    async listViews(organizationId) {
      return meta(viewMemory.get(organizationId) ?? []);
    },
    async listGoals(organizationId) {
      return meta(goalMemory.get(organizationId) ?? []);
    },
    async createView(organizationId, input) {
      const row = savedViewSchema.parse({
        id: opaqueIdSchema.parse(
          `view_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        metricKey: input.metricKey.trim(),
        alertThreshold: input.alertThreshold,
      });
      viewMemory.set(organizationId, [
        ...(viewMemory.get(organizationId) ?? []),
        row,
      ]);
      return row;
    },
    async createGoal(organizationId, input) {
      const row = goalSchema.parse({
        id: opaqueIdSchema.parse(
          `goal_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        targetValue: input.targetValue,
        currentValue: 0,
      });
      goalMemory.set(organizationId, [
        ...(goalMemory.get(organizationId) ?? []),
        row,
      ]);
      return row;
    },
    async updateGoalProgress(organizationId, goalId, currentValue) {
      const rows = goalMemory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === String(goalId));
      if (idx < 0) throw new Error("not found");
      const updated = goalSchema.parse({
        ...rows[idx]!,
        currentValue,
      });
      const next = [...rows];
      next[idx] = updated;
      goalMemory.set(organizationId, next);
      return updated;
    },
  };
}

let client: AnalyticsClient = createMockAnalyticsClient();
export function getAnalyticsClient() {
  return client;
}
export function setAnalyticsClient(next: AnalyticsClient) {
  client = next;
}
export function __resetMockAnalytics() {
  viewMemory.clear();
  goalMemory.clear();
  client = createMockAnalyticsClient();
}
