import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const examSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  title: z.string().min(1),
  poolSize: z.number().int().positive(),
  randomize: z.boolean(),
  maxAttempts: z.number().int().positive(),
  timeLimitMinutes: z.number().int().positive().nullable(),
  status: z.enum(["draft", "published"]),
});
export type Exam = z.infer<typeof examSchema>;
export const examsCollectionSchema = collectionSchema(examSchema);

export const antiCheatSignalSchema = z.enum([
  "tab_blur",
  "fullscreen_exit",
  "copy_paste",
  "idle_timeout",
]);
export type AntiCheatSignal = z.infer<typeof antiCheatSignalSchema>;

export const examAttemptSchema = z.object({
  id: opaqueIdSchema,
  examId: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  studentDisplayName: z.string().min(1),
  startedAt: z.string().min(1),
  submittedAt: z.string().nullable(),
  remainingSeconds: z.number().int().nonnegative().nullable(),
  signals: z.array(antiCheatSignalSchema),
  status: z.enum(["in_progress", "submitted", "timed_out"]),
});
export type ExamAttempt = z.infer<typeof examAttemptSchema>;
export const examAttemptsCollectionSchema = collectionSchema(examAttemptSchema);

export const examGradeSchema = z.object({
  id: opaqueIdSchema,
  attemptId: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  score: z.number().min(0).max(100),
  rubricNotes: z.string(),
  placementRecommendation: z.string().nullable(),
  humanOverride: z.boolean(),
  history: z.array(
    z.object({
      score: z.number(),
      rubricNotes: z.string(),
      changedAt: z.string(),
    }),
  ),
});
export type ExamGrade = z.infer<typeof examGradeSchema>;
export const examGradesCollectionSchema = collectionSchema(examGradeSchema);

export type CreateExamInput = {
  title: string;
  poolSize: number;
  randomize: boolean;
  maxAttempts: number;
  timeLimitMinutes: number | null;
};

export type GradeAttemptInput = {
  attemptId: string;
  score: number;
  rubricNotes: string;
  placementRecommendation?: string | null;
  humanOverride?: boolean;
};

export type ExamsClient = {
  list(organizationId: string): Promise<z.infer<typeof examsCollectionSchema>>;
  create(organizationId: string, input: CreateExamInput): Promise<Exam>;
  publish(organizationId: string, examId: string): Promise<Exam>;
  listAttempts(
    organizationId: string,
    examId: string,
  ): Promise<z.infer<typeof examAttemptsCollectionSchema>>;
  startAttempt(
    organizationId: string,
    examId: string,
    input: { studentDisplayName: string },
  ): Promise<ExamAttempt>;
  recordSignal(
    organizationId: string,
    attemptId: string,
    signal: AntiCheatSignal,
  ): Promise<ExamAttempt>;
  submitAttempt(
    organizationId: string,
    attemptId: string,
  ): Promise<ExamAttempt>;
  listGrades(
    organizationId: string,
  ): Promise<z.infer<typeof examGradesCollectionSchema>>;
  gradeAttempt(
    organizationId: string,
    input: GradeAttemptInput,
  ): Promise<ExamGrade>;
  regradeAttempt(
    organizationId: string,
    gradeId: string,
    input: GradeAttemptInput,
  ): Promise<ExamGrade>;
};

const examsMemory = new Map<string, Exam[]>();
const attemptsMemory = new Map<string, ExamAttempt[]>();
const gradesMemory = new Map<string, ExamGrade[]>();

function meta<T>(data: T[]) {
  return {
    data,
    meta: {
      page: 1,
      pageSize: Math.max(data.length, 1),
      totalItems: data.length,
      totalPages: 1,
    },
  };
}

function findExam(organizationId: string, examId: string) {
  const rows = examsMemory.get(organizationId) ?? [];
  const idx = rows.findIndex((row) => String(row.id) === examId);
  if (idx < 0) return null;
  return { rows, idx, current: rows[idx]! };
}

export function createHttpExamsClient(): ExamsClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/exams`,
        { parse: (data) => examsCollectionSchema.parse(data) },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/exams`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => examSchema.parse(data),
        },
      );
    },
    async publish(organizationId, examId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/exams/${encodeURIComponent(examId)}/publish`,
        {
          method: "POST",
          body: JSON.stringify({}),
          parse: (data) => examSchema.parse(data),
        },
      );
    },
    async listAttempts(organizationId, examId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/exams/${encodeURIComponent(examId)}/attempts`,
        { parse: (data) => examAttemptsCollectionSchema.parse(data) },
      );
    },
    async startAttempt(organizationId, examId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/exams/${encodeURIComponent(examId)}/attempts`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => examAttemptSchema.parse(data),
        },
      );
    },
    async recordSignal(organizationId, attemptId, signal) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/exam-attempts/${encodeURIComponent(attemptId)}/signals`,
        {
          method: "POST",
          body: JSON.stringify({ signal }),
          parse: (data) => examAttemptSchema.parse(data),
        },
      );
    },
    async submitAttempt(organizationId, attemptId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/exam-attempts/${encodeURIComponent(attemptId)}/submit`,
        {
          method: "POST",
          body: JSON.stringify({}),
          parse: (data) => examAttemptSchema.parse(data),
        },
      );
    },
    async listGrades(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/exam-grades`,
        { parse: (data) => examGradesCollectionSchema.parse(data) },
      );
    },
    async gradeAttempt(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/exam-grades`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => examGradeSchema.parse(data),
        },
      );
    },
    async regradeAttempt(organizationId, gradeId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/exam-grades/${encodeURIComponent(gradeId)}/regrade`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => examGradeSchema.parse(data),
        },
      );
    },
  };
}

export function createMockExamsClient(): ExamsClient {
  return {
    async list(organizationId) {
      return meta(examsMemory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const row = examSchema.parse({
        id: opaqueIdSchema.parse(
          `exm_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        title: input.title.trim(),
        poolSize: input.poolSize,
        randomize: input.randomize,
        maxAttempts: input.maxAttempts,
        timeLimitMinutes: input.timeLimitMinutes,
        status: "draft",
      });
      examsMemory.set(organizationId, [
        ...(examsMemory.get(organizationId) ?? []),
        row,
      ]);
      return row;
    },
    async publish(organizationId, examId) {
      const found = findExam(organizationId, examId);
      if (!found) throw new Error("NOT_FOUND");
      const updated = examSchema.parse({
        ...found.current,
        status: "published",
      });
      examsMemory.set(
        organizationId,
        found.rows.map((row, i) => (i === found.idx ? updated : row)),
      );
      return updated;
    },
    async listAttempts(organizationId, examId) {
      const data = (attemptsMemory.get(organizationId) ?? []).filter(
        (row) => String(row.examId) === examId,
      );
      return meta(data);
    },
    async startAttempt(organizationId, examId, input) {
      const found = findExam(organizationId, examId);
      if (!found) throw new Error("NOT_FOUND");
      if (found.current.status !== "published") {
        throw new Error("exams.notPublished");
      }
      const existing = (attemptsMemory.get(organizationId) ?? []).filter(
        (row) =>
          String(row.examId) === examId &&
          row.studentDisplayName === input.studentDisplayName.trim(),
      );
      if (existing.length >= found.current.maxAttempts) {
        throw new Error("exams.attemptLimit");
      }
      const attempt = examAttemptSchema.parse({
        id: opaqueIdSchema.parse(
          `exa_${Math.random().toString(36).slice(2, 10)}`,
        ),
        examId: found.current.id,
        organizationId: opaqueIdSchema.parse(organizationId),
        studentDisplayName: input.studentDisplayName.trim(),
        startedAt: new Date().toISOString(),
        submittedAt: null,
        remainingSeconds:
          found.current.timeLimitMinutes == null
            ? null
            : found.current.timeLimitMinutes * 60,
        signals: [],
        status: "in_progress",
      });
      attemptsMemory.set(organizationId, [
        ...(attemptsMemory.get(organizationId) ?? []),
        attempt,
      ]);
      return attempt;
    },
    async recordSignal(organizationId, attemptId, signal) {
      const rows = attemptsMemory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === attemptId);
      if (idx < 0) throw new Error("NOT_FOUND");
      const current = rows[idx]!;
      const updated = examAttemptSchema.parse({
        ...current,
        signals: [...current.signals, signal],
      });
      attemptsMemory.set(
        organizationId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      return updated;
    },
    async submitAttempt(organizationId, attemptId) {
      const rows = attemptsMemory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === attemptId);
      if (idx < 0) throw new Error("NOT_FOUND");
      const current = rows[idx]!;
      const updated = examAttemptSchema.parse({
        ...current,
        submittedAt: new Date().toISOString(),
        remainingSeconds: 0,
        status: "submitted",
      });
      attemptsMemory.set(
        organizationId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      return updated;
    },
    async listGrades(organizationId) {
      return meta(gradesMemory.get(organizationId) ?? []);
    },
    async gradeAttempt(organizationId, input) {
      const attempt = (attemptsMemory.get(organizationId) ?? []).find(
        (row) => String(row.id) === input.attemptId,
      );
      if (!attempt) throw new Error("NOT_FOUND");
      const now = new Date().toISOString();
      const grade = examGradeSchema.parse({
        id: opaqueIdSchema.parse(
          `exg_${Math.random().toString(36).slice(2, 10)}`,
        ),
        attemptId: attempt.id,
        organizationId: opaqueIdSchema.parse(organizationId),
        score: input.score,
        rubricNotes: input.rubricNotes.trim(),
        placementRecommendation: input.placementRecommendation?.trim() || null,
        humanOverride: Boolean(input.humanOverride),
        history: [
          {
            score: input.score,
            rubricNotes: input.rubricNotes.trim(),
            changedAt: now,
          },
        ],
      });
      gradesMemory.set(organizationId, [
        ...(gradesMemory.get(organizationId) ?? []),
        grade,
      ]);
      return grade;
    },
    async regradeAttempt(organizationId, gradeId, input) {
      const rows = gradesMemory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === gradeId);
      if (idx < 0) throw new Error("NOT_FOUND");
      const current = rows[idx]!;
      const updated = examGradeSchema.parse({
        ...current,
        score: input.score,
        rubricNotes: input.rubricNotes.trim(),
        placementRecommendation: input.placementRecommendation?.trim() || null,
        humanOverride: Boolean(input.humanOverride),
        history: [
          ...current.history,
          {
            score: current.score,
            rubricNotes: current.rubricNotes,
            changedAt: new Date().toISOString(),
          },
        ],
      });
      gradesMemory.set(
        organizationId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      return updated;
    },
  };
}

let client: ExamsClient = createMockExamsClient();
export function getExamsClient() {
  return client;
}
export function setExamsClient(next: ExamsClient) {
  client = next;
}
export function __resetMockExams() {
  examsMemory.clear();
  attemptsMemory.clear();
  gradesMemory.clear();
  client = createMockExamsClient();
}

export function isExamPublishable(exam: Pick<Exam, "poolSize" | "status">) {
  return exam.status === "draft" && exam.poolSize > 0;
}

export function canStartAttempt(
  exam: Pick<Exam, "status" | "maxAttempts">,
  priorAttempts: number,
) {
  return exam.status === "published" && priorAttempts < exam.maxAttempts;
}

export function suggestPlacement(score: number): string {
  if (score >= 85) return "advanced";
  if (score >= 70) return "intermediate";
  return "foundational";
}
