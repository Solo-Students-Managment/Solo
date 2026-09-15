import { z } from "zod";

export const createPipelineSchema = z.object({
  name: z.string().trim().min(1, "crm.validation.pipelineName"),
  isPrivate: z.boolean(),
  stageLabels: z.string().trim().min(1, "crm.validation.stageLabels"),
});
export type CreatePipelineValues = z.infer<typeof createPipelineSchema>;

export const createDealSchema = z.object({
  title: z.string().trim().min(1, "crm.validation.dealTitle"),
  pipelineName: z.string().trim().min(1, "crm.validation.pipelineName"),
  stage: z.string().trim().min(1, "crm.validation.stage"),
  valueMinor: z.coerce.number().int().nonnegative("crm.validation.valueMinor"),
});
export type CreateDealValues = z.infer<typeof createDealSchema>;
