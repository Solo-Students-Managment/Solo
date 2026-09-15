import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const pipelineSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  isPrivate: z.boolean(),
  stageLabels: z.array(z.string().min(1)).min(1),
});
export type Pipeline = z.infer<typeof pipelineSchema>;
export const pipelinesCollectionSchema = collectionSchema(pipelineSchema);

export const dealSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  title: z.string().min(1),
  pipelineName: z.string().min(1),
  stage: z.string().min(1),
  valueMinor: z.number().int().nonnegative(),
});
export type Deal = z.infer<typeof dealSchema>;
export const dealsCollectionSchema = collectionSchema(dealSchema);

export type CreatePipelineInput = {
  name: string;
  isPrivate: boolean;
  stageLabels: string[];
};

export type CreateDealInput = {
  title: string;
  pipelineName: string;
  stage: string;
  valueMinor: number;
};

export type CrmClient = {
  listPipelines(organizationId: string): Promise<{
    data: Pipeline[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  listDeals(organizationId: string): Promise<{
    data: Deal[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  createPipeline(
    organizationId: string,
    input: CreatePipelineInput,
  ): Promise<Pipeline>;
  createDeal(organizationId: string, input: CreateDealInput): Promise<Deal>;
};

const pipelineMemory = new Map<string, Pipeline[]>();
const dealMemory = new Map<string, Deal[]>();

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

/** Private pipelines are visible only to users who can manage private CRM data. */
export function canViewPrivatePipeline(
  isPrivate: boolean,
  canManagePrivate: boolean,
) {
  if (!isPrivate) return true;
  return canManagePrivate;
}

export function createHttpCrmClient(): CrmClient {
  return {
    async listPipelines(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/crm/pipelines`,
        { parse: (data) => pipelinesCollectionSchema.parse(data) },
      );
    },
    async listDeals(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/crm/deals`,
        { parse: (data) => dealsCollectionSchema.parse(data) },
      );
    },
    async createPipeline(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/crm/pipelines`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => pipelineSchema.parse(data),
        },
      );
    },
    async createDeal(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/crm/deals`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => dealSchema.parse(data),
        },
      );
    },
  };
}

export function createMockCrmClient(): CrmClient {
  return {
    async listPipelines(organizationId) {
      return meta(pipelineMemory.get(organizationId) ?? []);
    },
    async listDeals(organizationId) {
      return meta(dealMemory.get(organizationId) ?? []);
    },
    async createPipeline(organizationId, input) {
      const row = pipelineSchema.parse({
        id: opaqueIdSchema.parse(
          `pip_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        isPrivate: input.isPrivate,
        stageLabels: input.stageLabels
          .map((label) => label.trim())
          .filter(Boolean),
      });
      pipelineMemory.set(organizationId, [
        ...(pipelineMemory.get(organizationId) ?? []),
        row,
      ]);
      return row;
    },
    async createDeal(organizationId, input) {
      const row = dealSchema.parse({
        id: opaqueIdSchema.parse(
          `deal_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        title: input.title.trim(),
        pipelineName: input.pipelineName.trim(),
        stage: input.stage.trim(),
        valueMinor: input.valueMinor,
      });
      dealMemory.set(organizationId, [
        ...(dealMemory.get(organizationId) ?? []),
        row,
      ]);
      return row;
    },
  };
}

let client: CrmClient = createMockCrmClient();
export function getCrmClient() {
  return client;
}
export function setCrmClient(next: CrmClient) {
  client = next;
}
export function __resetMockCrm() {
  pipelineMemory.clear();
  dealMemory.clear();
  client = createMockCrmClient();
}
