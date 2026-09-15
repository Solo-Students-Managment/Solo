import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const fieldTypeSchema = z.enum(["text", "number", "select"]);
export type FieldType = z.infer<typeof fieldTypeSchema>;
export const entityTargetSchema = z.enum(["student", "task", "form"]);
export type EntityTarget = z.infer<typeof entityTargetSchema>;

export const customFieldSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  fieldType: fieldTypeSchema,
  entityTarget: entityTargetSchema,
  options: z.string(),
  required: z.boolean(),
});
export type CustomField = z.infer<typeof customFieldSchema>;

export const customStatusSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  entityTarget: entityTargetSchema,
  colorKey: z.string().min(1),
});
export type CustomStatus = z.infer<typeof customStatusSchema>;

export const contextTagSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  colorKey: z.string().min(1),
});
export type ContextTag = z.infer<typeof contextTagSchema>;

export const customizationBundleSchema = z.object({
  fields: z.array(customFieldSchema),
  statuses: z.array(customStatusSchema),
  tags: z.array(contextTagSchema),
});
export type CustomizationBundle = z.infer<typeof customizationBundleSchema>;

export type CreateFieldInput = {
  name: string;
  fieldType: FieldType;
  entityTarget: EntityTarget;
  options: string;
  required: boolean;
};
export type CreateStatusInput = {
  name: string;
  entityTarget: EntityTarget;
  colorKey: string;
};
export type CreateTagInput = { name: string; colorKey: string };

export type CustomizationClient = {
  get(organizationId: string): Promise<CustomizationBundle>;
  createField(
    organizationId: string,
    input: CreateFieldInput,
  ): Promise<CustomField>;
  createStatus(
    organizationId: string,
    input: CreateStatusInput,
  ): Promise<CustomStatus>;
  createTag(organizationId: string, input: CreateTagInput): Promise<ContextTag>;
};

const memory = new Map<string, CustomizationBundle>();

function emptyBundle(): CustomizationBundle {
  return { fields: [], statuses: [], tags: [] };
}

/** Select fields must declare at least one option. */
export function selectFieldHasOptions(fieldType: FieldType, options: string) {
  if (fieldType !== "select") return true;
  return (
    options
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean).length > 0
  );
}

export function createHttpCustomizationClient(): CustomizationClient {
  return {
    async get(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/customization`,
        { parse: (data) => customizationBundleSchema.parse(data) },
      );
    },
    async createField(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/customization/fields`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => customFieldSchema.parse(data),
        },
      );
    },
    async createStatus(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/customization/statuses`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => customStatusSchema.parse(data),
        },
      );
    },
    async createTag(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/customization/tags`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => contextTagSchema.parse(data),
        },
      );
    },
  };
}

export function createMockCustomizationClient(): CustomizationClient {
  return {
    async get(organizationId) {
      return memory.get(organizationId) ?? emptyBundle();
    },
    async createField(organizationId, input) {
      if (!selectFieldHasOptions(input.fieldType, input.options)) {
        throw new Error("options required");
      }
      const row = customFieldSchema.parse({
        id: opaqueIdSchema.parse(
          `cf_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        fieldType: input.fieldType,
        entityTarget: input.entityTarget,
        options: input.options.trim(),
        required: input.required,
      });
      const current = memory.get(organizationId) ?? emptyBundle();
      memory.set(organizationId, {
        ...current,
        fields: [...current.fields, row],
      });
      return row;
    },
    async createStatus(organizationId, input) {
      const row = customStatusSchema.parse({
        id: opaqueIdSchema.parse(
          `cs_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        entityTarget: input.entityTarget,
        colorKey: input.colorKey.trim(),
      });
      const current = memory.get(organizationId) ?? emptyBundle();
      memory.set(organizationId, {
        ...current,
        statuses: [...current.statuses, row],
      });
      return row;
    },
    async createTag(organizationId, input) {
      const row = contextTagSchema.parse({
        id: opaqueIdSchema.parse(
          `tg_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        colorKey: input.colorKey.trim(),
      });
      const current = memory.get(organizationId) ?? emptyBundle();
      memory.set(organizationId, {
        ...current,
        tags: [...current.tags, row],
      });
      return row;
    },
  };
}

let client: CustomizationClient = createMockCustomizationClient();
export function getCustomizationClient() {
  return client;
}
export function setCustomizationClient(next: CustomizationClient) {
  client = next;
}
export function __resetMockCustomization() {
  memory.clear();
  client = createMockCustomizationClient();
}
