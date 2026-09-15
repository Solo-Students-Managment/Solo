import { z } from "zod";

export const submissionCommentSchema = z.object({
  comment: z.string().trim().min(1, "formSubmissions.validation.comment"),
});
export type SubmissionCommentValues = z.infer<typeof submissionCommentSchema>;
