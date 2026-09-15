import { z } from "zod";
export const publishResourceSchema = z.object({
  subjectName: z.string().trim().min(1, "resources.validation.subject"),
  title: z.string().trim().min(1, "resources.validation.title"),
  mimeHint: z.enum(["pdf", "word", "image", "audio"]),
});
export type PublishResourceValues = z.infer<typeof publishResourceSchema>;
