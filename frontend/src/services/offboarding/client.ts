import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const offboardingStatusSchema = z.enum([
  "in_progress",
  "completed",
  "cancelled",
]);
export type OffboardingStatus = z.infer<typeof offboardingStatusSchema>;
export const offboardingStepSchema = z.enum([
  "access_review",
  "asset_return",
  "knowledge_transfer",
  "deactivate",
]);
export type OffboardingStep = z.infer<typeof offboardingStepSchema>;
export const OFFBOARDING_STEPS = offboardingStepSchema.options;

export const offboardingCaseSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  staffDisplayName: z.string().min(1),
  status: offboardingStatusSchema,
  currentStep: offboardingStepSchema,
  lastWorkingDay: z.string().min(1),
});
export type OffboardingCase = z.infer<typeof offboardingCaseSchema>;
export const offboardingCollectionSchema = collectionSchema(
  offboardingCaseSchema,
);

export type CreateOffboardingInput = {
  staffDisplayName: string;
  lastWorkingDay: string;
};

export type OffboardingClient = {
  list(organizationId: string): Promise<{
    data: OffboardingCase[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(
    organizationId: string,
    input: CreateOffboardingInput,
  ): Promise<OffboardingCase>;
  advance(organizationId: string, caseId: string): Promise<OffboardingCase>;
};

const memory = new Map<string, OffboardingCase[]>();
function meta(data: OffboardingCase[]) {
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

export function nextOffboardingStep(
  step: OffboardingStep,
): OffboardingStep | "done" {
  const idx = OFFBOARDING_STEPS.indexOf(step);
  if (idx < 0 || idx >= OFFBOARDING_STEPS.length - 1) return "done";
  return OFFBOARDING_STEPS[idx + 1]!;
}

export function createHttpOffboardingClient(): OffboardingClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/offboarding`,
        {
          parse: (data) => offboardingCollectionSchema.parse(data),
        },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/offboarding`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => offboardingCaseSchema.parse(data),
        },
      );
    },
    async advance(organizationId, caseId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/offboarding/${encodeURIComponent(caseId)}/advance`,
        {
          method: "POST",
          body: JSON.stringify({}),
          parse: (data) => offboardingCaseSchema.parse(data),
        },
      );
    },
  };
}

export function createMockOffboardingClient(): OffboardingClient {
  return {
    async list(organizationId) {
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const row = offboardingCaseSchema.parse({
        id: opaqueIdSchema.parse(
          `off_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        staffDisplayName: input.staffDisplayName.trim(),
        status: "in_progress",
        currentStep: "access_review",
        lastWorkingDay: input.lastWorkingDay,
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
    async advance(organizationId, caseId) {
      const rows = memory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === String(caseId));
      if (idx < 0) throw new Error("not found");
      const current = rows[idx]!;
      const next = nextOffboardingStep(current.currentStep);
      const updated = offboardingCaseSchema.parse({
        ...current,
        currentStep: next === "done" ? "deactivate" : next,
        status: next === "done" ? "completed" : "in_progress",
      });
      const copy = [...rows];
      copy[idx] = updated;
      memory.set(organizationId, copy);
      return updated;
    },
  };
}

let client: OffboardingClient = createMockOffboardingClient();
export function getOffboardingClient() {
  return client;
}
export function setOffboardingClient(next: OffboardingClient) {
  client = next;
}
export function __resetMockOffboarding() {
  memory.clear();
  client = createMockOffboardingClient();
}
