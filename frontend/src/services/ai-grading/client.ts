import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";
export const gradingSuggestionSchema = z.object({
  id: opaqueIdSchema,
  assignmentTitle: z.string(),
  studentLabel: z.string(),
  suggestedScore: z.number(),
  similarityScore: z.number(),
  plagiarismFlag: z.boolean(),
  rationale: z.string(),
  status: z.enum(["suggested", "approved", "rejected"]),
});
export type GradingSuggestion = z.infer<typeof gradingSuggestionSchema>;
export function requiresHumanApproval(s: GradingSuggestion) {
  return s.status === "suggested";
}
export function isHeuristicOnly(score: number) {
  return score < 1;
}
export type AiGradingClient = {
  list(): Promise<GradingSuggestion[]>;
  approve(id: string): Promise<GradingSuggestion>;
  reject(id: string): Promise<GradingSuggestion>;
};
export function createHttpAiGradingClient(): AiGradingClient {
  return {
    async list() {
      return apiRequest("/ai/grading", {
        parse: (d) => z.array(gradingSuggestionSchema).parse(d),
      });
    },
    async approve(id) {
      return apiRequest(`/ai/grading/${encodeURIComponent(id)}/approve`, {
        method: "POST",
        parse: (d) => gradingSuggestionSchema.parse(d),
      });
    },
    async reject(id) {
      return apiRequest(`/ai/grading/${encodeURIComponent(id)}/reject`, {
        method: "POST",
        parse: (d) => gradingSuggestionSchema.parse(d),
      });
    },
  };
}
export function createMockAiGradingClient(): AiGradingClient {
  const rows = new Map<string, GradingSuggestion>();
  const seed = gradingSuggestionSchema.parse({
    id: "grade_1",
    assignmentTitle: "Algebra HW1",
    studentLabel: "Student A",
    suggestedScore: 86,
    similarityScore: 0.22,
    plagiarismFlag: false,
    rationale: "Heuristic only",
    status: "suggested",
  });
  rows.set(String(seed.id), seed);
  return {
    async list() {
      return Array.from(rows.values());
    },
    async approve(id) {
      const row = rows.get(id);
      if (!row) throw new Error("not_found");
      const n = gradingSuggestionSchema.parse({ ...row, status: "approved" });
      rows.set(id, n);
      return n;
    },
    async reject(id) {
      const row = rows.get(id);
      if (!row) throw new Error("not_found");
      const n = gradingSuggestionSchema.parse({ ...row, status: "rejected" });
      rows.set(id, n);
      return n;
    },
  };
}
let active: AiGradingClient = createMockAiGradingClient();
export function setAiGradingClient(c: AiGradingClient) {
  active = c;
}
export function getAiGradingClient() {
  return active;
}
