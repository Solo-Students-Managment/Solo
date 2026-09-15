import { z } from "zod";
import { selectFieldHasOptions } from "@/services/customization";

export const createFieldSchema = z
  .object({
    name: z.string().trim().min(1, "customization.validation.name"),
    fieldType: z.enum(["text", "number", "select"]),
    entityTarget: z.enum(["student", "task", "form"]),
    options: z.string(),
    required: z.coerce.boolean(),
  })
  .superRefine((value, ctx) => {
    if (!selectFieldHasOptions(value.fieldType, value.options)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "customization.validation.options",
      });
    }
  });
export type CreateFieldValues = z.infer<typeof createFieldSchema>;

export const createStatusSchema = z.object({
  name: z.string().trim().min(1, "customization.validation.name"),
  entityTarget: z.enum(["student", "task", "form"]),
  colorKey: z.string().trim().min(1, "customization.validation.color"),
});
export type CreateStatusValues = z.infer<typeof createStatusSchema>;

export const createTagSchema = z.object({
  name: z.string().trim().min(1, "customization.validation.name"),
  colorKey: z.string().trim().min(1, "customization.validation.color"),
});
export type CreateTagValues = z.infer<typeof createTagSchema>;
