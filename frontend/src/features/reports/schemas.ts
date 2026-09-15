import { z } from "zod";
export const saveReportViewSchema = z.object({
  name: z.string().trim().min(1, "reports.validation.name"),
  kind: z.enum(["attendance", "grades", "enrollment"]),
  format: z.enum(["csv", "json"]),
});
export type SaveReportViewValues = z.infer<typeof saveReportViewSchema>;
