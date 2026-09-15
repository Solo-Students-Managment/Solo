import { z } from "zod";

export const createAssignmentSchema = z.object({
  title: z.string().trim().min(1, "assignments.validation.title"),
  type: z.enum([
    "homework",
    "project",
    "essay",
    "presentation",
    "research",
    "practice",
    "custom",
  ]),
  dueAt: z.string().min(1, "assignments.validation.dueAt"),
});
export type CreateAssignmentValues = z.infer<typeof createAssignmentSchema>;

export const recordSubmissionSchema = z.object({
  assignmentTitle: z.string().trim().min(1, "assignments.validation.title"),
  studentDisplayName: z
    .string()
    .trim()
    .min(1, "assignments.validation.student"),
  mimeHint: z.enum(["pdf", "word", "image", "audio"]),
});
export type RecordSubmissionValues = z.infer<typeof recordSubmissionSchema>;
