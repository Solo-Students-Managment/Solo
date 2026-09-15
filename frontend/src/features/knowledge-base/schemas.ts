import { z } from "zod";
import { hasMeaningfulKbBody } from "@/services/knowledge-base";

export const createKbArticleSchema = z
  .object({
    title: z.string().trim().min(1, "knowledgeBase.validation.title"),
    spaceName: z.string().trim().min(1, "knowledgeBase.validation.space"),
    bodyHtml: z.string().min(1, "knowledgeBase.validation.body"),
    tags: z.string(),
  })
  .superRefine((value, ctx) => {
    if (!hasMeaningfulKbBody(value.bodyHtml)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bodyHtml"],
        message: "knowledgeBase.validation.body",
      });
    }
  });
export type CreateKbArticleValues = z.infer<typeof createKbArticleSchema>;
