import { z } from "zod";
export const createEmployeeDocumentSchema = z.object({
  staffDisplayName: z
    .string()
    .trim()
    .min(1, "employeeDocuments.validation.staff"),
  title: z.string().trim().min(1, "employeeDocuments.validation.title"),
  category: z.string().trim().min(1, "employeeDocuments.validation.category"),
  expiresOn: z.string().optional(),
});
export type CreateEmployeeDocumentValues = z.infer<
  typeof createEmployeeDocumentSchema
>;
