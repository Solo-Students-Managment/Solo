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
  collaborationMode: z.enum(["individual", "group"]),
  peerReviewEnabled: z.enum(["yes", "no"]),
  maxRevisions: z.coerce
    .number()
    .int("assignments.validation.maxRevisions")
    .min(0, "assignments.validation.maxRevisions")
    .max(10, "assignments.validation.maxRevisions"),
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

export const createTeamSchema = z.object({
  assignmentTitle: z.string().trim().min(1, "assignments.validation.title"),
  teamName: z.string().trim().min(1, "assignments.validation.teamName"),
  memberNames: z.string().trim().min(1, "assignments.validation.members"),
});
export type CreateTeamValues = z.infer<typeof createTeamSchema>;

export const peerReviewSchema = z.object({
  assignmentTitle: z.string().trim().min(1, "assignments.validation.title"),
  reviewerName: z.string().trim().min(1, "assignments.validation.reviewer"),
  revieweeName: z.string().trim().min(1, "assignments.validation.reviewee"),
  score: z.coerce
    .number()
    .min(0, "assignments.validation.score")
    .max(100, "assignments.validation.score"),
});
export type PeerReviewValues = z.infer<typeof peerReviewSchema>;

export const revisionRequestSchema = z.object({
  assignmentTitle: z.string().trim().min(1, "assignments.validation.title"),
  studentDisplayName: z
    .string()
    .trim()
    .min(1, "assignments.validation.student"),
  note: z.string().trim().optional(),
});
export type RevisionRequestValues = z.infer<typeof revisionRequestSchema>;

export const releaseGradesSchema = z.object({
  assignmentTitle: z.string().trim().min(1, "assignments.validation.title"),
});
export type ReleaseGradesValues = z.infer<typeof releaseGradesSchema>;

export function parseMemberNames(raw: string): string[] {
  return raw
    .split(/[,،]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function findAssignmentByTitle<T extends { title: string }>(
  rows: T[],
  title: string,
): T | undefined {
  const needle = title.trim().toLowerCase();
  return rows.find((row) => row.title.toLowerCase() === needle);
}
