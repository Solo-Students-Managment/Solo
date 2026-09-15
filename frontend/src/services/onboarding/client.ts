import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const onboardingStatusSchema = z.enum([
  "in_progress",
  "completed",
  "cancelled",
]);
export type OnboardingStatus = z.infer<typeof onboardingStatusSchema>;
export const onboardingStepSchema = z.enum([
  "invite",
  "documents",
  "role",
  "activate",
]);
export type OnboardingStep = z.infer<typeof onboardingStepSchema>;
export const ONBOARDING_STEPS = onboardingStepSchema.options;

export const onboardingCaseSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  staffDisplayName: z.string().min(1),
  roleTemplate: z.string().min(1),
  status: onboardingStatusSchema,
  currentStep: onboardingStepSchema,
});
export type OnboardingCase = z.infer<typeof onboardingCaseSchema>;
export const onboardingCollectionSchema =
  collectionSchema(onboardingCaseSchema);

export type CreateOnboardingInput = {
  staffDisplayName: string;
  roleTemplate: string;
};

export type OnboardingClient = {
  list(organizationId: string): Promise<{
    data: OnboardingCase[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(
    organizationId: string,
    input: CreateOnboardingInput,
  ): Promise<OnboardingCase>;
  advance(organizationId: string, caseId: string): Promise<OnboardingCase>;
};

const memory = new Map<string, OnboardingCase[]>();
function meta(data: OnboardingCase[]) {
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

export function nextOnboardingStep(
  step: OnboardingStep,
): OnboardingStep | "done" {
  const idx = ONBOARDING_STEPS.indexOf(step);
  if (idx < 0 || idx >= ONBOARDING_STEPS.length - 1) return "done";
  return ONBOARDING_STEPS[idx + 1]!;
}

export function createHttpOnboardingClient(): OnboardingClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/onboarding`,
        {
          parse: (data) => onboardingCollectionSchema.parse(data),
        },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/onboarding`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => onboardingCaseSchema.parse(data),
        },
      );
    },
    async advance(organizationId, caseId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/onboarding/${encodeURIComponent(caseId)}/advance`,
        {
          method: "POST",
          body: JSON.stringify({}),
          parse: (data) => onboardingCaseSchema.parse(data),
        },
      );
    },
  };
}

export function createMockOnboardingClient(): OnboardingClient {
  return {
    async list(organizationId) {
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const row = onboardingCaseSchema.parse({
        id: opaqueIdSchema.parse(
          `onb_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        staffDisplayName: input.staffDisplayName.trim(),
        roleTemplate: input.roleTemplate.trim(),
        status: "in_progress",
        currentStep: "invite",
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
    async advance(organizationId, caseId) {
      const rows = memory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === String(caseId));
      if (idx < 0) throw new Error("not found");
      const current = rows[idx]!;
      const next = nextOnboardingStep(current.currentStep);
      const updated = onboardingCaseSchema.parse({
        ...current,
        currentStep: next === "done" ? "activate" : next,
        status: next === "done" ? "completed" : "in_progress",
      });
      const copy = [...rows];
      copy[idx] = updated;
      memory.set(organizationId, copy);
      return updated;
    },
  };
}

let client: OnboardingClient = createMockOnboardingClient();
export function getOnboardingClient() {
  return client;
}
export function setOnboardingClient(next: OnboardingClient) {
  client = next;
}
export function __resetMockOnboarding() {
  memory.clear();
  client = createMockOnboardingClient();
}
