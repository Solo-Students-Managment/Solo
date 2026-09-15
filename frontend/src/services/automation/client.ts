import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const automationRiskLevelSchema = z.enum(["low", "medium", "high"]);
export type AutomationRiskLevel = z.infer<typeof automationRiskLevelSchema>;

export const automationStatusSchema = z.enum(["draft", "active"]);
export type AutomationStatus = z.infer<typeof automationStatusSchema>;

export const automationTriggerTypeSchema = z.enum([
  "webhook",
  "schedule",
  "form_submitted",
  "enrollment_created",
]);
export type AutomationTriggerType = z.infer<typeof automationTriggerTypeSchema>;

export const automationRuleSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  triggerType: automationTriggerTypeSchema,
  riskLevel: automationRiskLevelSchema,
  status: automationStatusSchema,
  stepsSummary: z.string().min(1),
});
export type AutomationRule = z.infer<typeof automationRuleSchema>;
export const automationRulesCollectionSchema =
  collectionSchema(automationRuleSchema);

export type CreateAutomationRuleInput = {
  name: string;
  triggerType: AutomationTriggerType;
  riskLevel: AutomationRiskLevel;
  stepsSummary: string;
};

export type ActivateAutomationInput = {
  approvalGranted?: boolean;
};

export type AutomationClient = {
  list(organizationId: string): Promise<{
    data: AutomationRule[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(
    organizationId: string,
    input: CreateAutomationRuleInput,
  ): Promise<AutomationRule>;
  activate(
    organizationId: string,
    ruleId: string,
    input?: ActivateAutomationInput,
  ): Promise<AutomationRule>;
};

const memory = new Map<string, AutomationRule[]>();

function meta(data: AutomationRule[]) {
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

/** High-risk automations require explicit approval before activation. */
export function requiresApprovalGate(riskLevel: AutomationRiskLevel) {
  return riskLevel === "high";
}

export function createHttpAutomationClient(): AutomationClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/automation`,
        {
          parse: (data) => automationRulesCollectionSchema.parse(data),
        },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/automation`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => automationRuleSchema.parse(data),
        },
      );
    },
    async activate(organizationId, ruleId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/automation/${encodeURIComponent(ruleId)}/activate`,
        {
          method: "POST",
          body: JSON.stringify(input ?? {}),
          parse: (data) => automationRuleSchema.parse(data),
        },
      );
    },
  };
}

export function createMockAutomationClient(): AutomationClient {
  return {
    async list(organizationId) {
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const row = automationRuleSchema.parse({
        id: opaqueIdSchema.parse(
          `aut_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        triggerType: input.triggerType,
        riskLevel: input.riskLevel,
        status: "draft",
        stepsSummary: input.stepsSummary.trim(),
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
    async activate(organizationId, ruleId, input) {
      const rows = memory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === String(ruleId));
      if (idx < 0) throw new Error("not found");
      const current = rows[idx]!;
      if (current.status === "active") throw new Error("already active");
      if (requiresApprovalGate(current.riskLevel) && !input?.approvalGranted) {
        throw new Error("approval required");
      }
      const updated = automationRuleSchema.parse({
        ...current,
        status: "active",
      });
      const next = [...rows];
      next[idx] = updated;
      memory.set(organizationId, next);
      return updated;
    },
  };
}

let client: AutomationClient = createMockAutomationClient();
export function getAutomationClient() {
  return client;
}
export function setAutomationClient(next: AutomationClient) {
  client = next;
}
export function __resetMockAutomation() {
  memory.clear();
  client = createMockAutomationClient();
}
