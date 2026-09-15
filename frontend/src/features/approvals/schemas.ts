import { z } from "zod";
export const createApprovalSchema = z.object({
  title: z.string().trim().min(1, "approvals.validation.title"),
  requesterDisplayName: z
    .string()
    .trim()
    .min(1, "approvals.validation.requester"),
  mode: z.enum(["sequential", "parallel"]),
  summary: z.string().trim().min(1, "approvals.validation.summary"),
});
export type CreateApprovalValues = z.infer<typeof createApprovalSchema>;
