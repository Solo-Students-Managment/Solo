import { z } from "zod";

export const createBankQuestionSchema = z.object({
  promptHtml: z.string().trim().min(1, "questionBank.validation.prompt"),
  type: z.enum([
    "mcq",
    "multi_select",
    "true_false",
    "short",
    "essay",
    "fill",
    "match",
    "order",
    "file",
    "audio",
    "image",
  ]),
  visibility: z.enum(["private", "personal", "shared", "school", "public"]),
  tags: z.string().optional(),
});
export type CreateBankQuestionValues = z.infer<typeof createBankQuestionSchema>;

export function hasMeaningfulPrompt(html: string): boolean {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0;
}
