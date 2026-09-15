import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const sessionStatusSchema = z.enum([
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);

export const classSessionSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  classId: opaqueIdSchema,
  className: z.string().min(1),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  status: sessionStatusSchema,
  recurrenceLabel: z.string().optional(),
  conflictWarning: z.string().optional(),
});
export type ClassSession = z.infer<typeof classSessionSchema>;

export const studentEvaluationSchema = z.object({
  studentId: opaqueIdSchema,
  studentDisplayName: z.string().min(1),
  score: z.number().min(0).max(100).nullable(),
  comment: z.string(),
});
export type StudentEvaluation = z.infer<typeof studentEvaluationSchema>;

export const sessionDetailSchema = classSessionSchema.extend({
  reportStatus: z.enum(["draft", "published"]),
  evaluations: z.array(studentEvaluationSchema),
});
export type SessionDetail = z.infer<typeof sessionDetailSchema>;

export const sessionsCollectionSchema = collectionSchema(classSessionSchema);

export const attendanceStatusSchema = z.enum([
  "present",
  "absent",
  "late",
  "excused",
]);

export const attendanceRecordSchema = z.object({
  id: opaqueIdSchema,
  sessionId: opaqueIdSchema,
  studentId: opaqueIdSchema,
  studentDisplayName: z.string().min(1),
  status: attendanceStatusSchema,
});
export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;

export const attendanceReportSchema = z.object({
  present: z.number().int().nonnegative(),
  absent: z.number().int().nonnegative(),
  late: z.number().int().nonnegative(),
  excused: z.number().int().nonnegative(),
  records: z.array(attendanceRecordSchema),
});
export type AttendanceReport = z.infer<typeof attendanceReportSchema>;

export type SessionsClient = {
  list(
    organizationId: string,
  ): Promise<z.infer<typeof sessionsCollectionSchema>>;
  create(
    organizationId: string,
    input: {
      classId: string;
      className: string;
      startsAt: string;
      endsAt: string;
      recurrenceLabel?: string;
    },
  ): Promise<ClassSession>;
  get(organizationId: string, sessionId: string): Promise<SessionDetail>;
  saveEvaluation(
    organizationId: string,
    sessionId: string,
    evaluation: StudentEvaluation,
  ): Promise<SessionDetail>;
  publishReport(
    organizationId: string,
    sessionId: string,
  ): Promise<SessionDetail>;
  listAttendance(
    organizationId: string,
    sessionId: string,
  ): Promise<AttendanceReport>;
  setAttendance(
    organizationId: string,
    sessionId: string,
    input: {
      studentId: string;
      studentDisplayName: string;
      status: z.infer<typeof attendanceStatusSchema>;
    },
  ): Promise<AttendanceReport>;
};

const sessions = new Map<string, SessionDetail>();
const attendanceBySession = new Map<string, AttendanceRecord[]>();

function toReport(sessionId: string): AttendanceReport {
  const records = attendanceBySession.get(sessionId) ?? [];
  return attendanceReportSchema.parse({
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
    late: records.filter((r) => r.status === "late").length,
    excused: records.filter((r) => r.status === "excused").length,
    records,
  });
}

export function createHttpSessionsClient(): SessionsClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/sessions`,
        { parse: (data) => sessionsCollectionSchema.parse(data) },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/sessions`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => classSessionSchema.parse(data),
        },
      );
    },
    async get(organizationId, sessionId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/sessions/${encodeURIComponent(sessionId)}`,
        { parse: (data) => sessionDetailSchema.parse(data) },
      );
    },
    async saveEvaluation(organizationId, sessionId, evaluation) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/sessions/${encodeURIComponent(sessionId)}/evaluations`,
        {
          method: "PUT",
          body: JSON.stringify(evaluation),
          parse: (data) => sessionDetailSchema.parse(data),
        },
      );
    },
    async publishReport(organizationId, sessionId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/sessions/${encodeURIComponent(sessionId)}/publish`,
        {
          method: "POST",
          parse: (data) => sessionDetailSchema.parse(data),
        },
      );
    },
    async listAttendance(organizationId, sessionId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/sessions/${encodeURIComponent(sessionId)}/attendance`,
        { parse: (data) => attendanceReportSchema.parse(data) },
      );
    },
    async setAttendance(organizationId, sessionId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/sessions/${encodeURIComponent(sessionId)}/attendance`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => attendanceReportSchema.parse(data),
        },
      );
    },
  };
}

export function createMockSessionsClient(): SessionsClient {
  return {
    async list(organizationId) {
      const data = [...sessions.values()]
        .filter((row) => String(row.organizationId) === organizationId)
        .map((row) => classSessionSchema.parse(row));
      return {
        data,
        meta: {
          page: 1,
          pageSize: Math.max(data.length, 1),
          totalItems: data.length,
          totalPages: 1,
        },
      };
    },
    async create(organizationId, input) {
      const id = opaqueIdSchema.parse(
        `ses_${Math.random().toString(36).slice(2, 10)}`,
      );
      const starts = new Date(input.startsAt);
      const ends = new Date(input.endsAt);
      const conflictWarning =
        ends.getTime() <= starts.getTime()
          ? "End time must be after start time"
          : undefined;
      const detail = sessionDetailSchema.parse({
        id,
        organizationId: opaqueIdSchema.parse(organizationId),
        classId: opaqueIdSchema.parse(input.classId),
        className: input.className,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        status: "scheduled",
        recurrenceLabel: input.recurrenceLabel,
        conflictWarning,
        reportStatus: "draft",
        evaluations: [
          {
            studentId: opaqueIdSchema.parse("stu_demo_1"),
            studentDisplayName: "Sara",
            score: null,
            comment: "",
          },
        ],
      });
      sessions.set(id, detail);
      attendanceBySession.set(id, []);
      return classSessionSchema.parse(detail);
    },
    async get(_organizationId, sessionId) {
      const row = sessions.get(sessionId);
      if (!row) throw new Error("sessions.notFound");
      return row;
    },
    async saveEvaluation(_organizationId, sessionId, evaluation) {
      const row = sessions.get(sessionId);
      if (!row) throw new Error("sessions.notFound");
      if (row.reportStatus === "published") {
        throw new Error("sessions.reportPublished");
      }
      const evaluations = row.evaluations.map((item) =>
        String(item.studentId) === String(evaluation.studentId)
          ? evaluation
          : item,
      );
      if (
        !evaluations.some(
          (item) => String(item.studentId) === String(evaluation.studentId),
        )
      ) {
        evaluations.push(evaluation);
      }
      const next = { ...row, evaluations };
      sessions.set(sessionId, next);
      return next;
    },
    async publishReport(_organizationId, sessionId) {
      const row = sessions.get(sessionId);
      if (!row) throw new Error("sessions.notFound");
      const next = {
        ...row,
        reportStatus: "published" as const,
        status: "completed" as const,
      };
      sessions.set(sessionId, next);
      return next;
    },
    async listAttendance(_organizationId, sessionId) {
      if (!sessions.has(sessionId)) throw new Error("sessions.notFound");
      return toReport(sessionId);
    },
    async setAttendance(_organizationId, sessionId, input) {
      if (!sessions.has(sessionId)) throw new Error("sessions.notFound");
      const records = attendanceBySession.get(sessionId) ?? [];
      const existing = records.findIndex(
        (row) => String(row.studentId) === input.studentId,
      );
      const record = attendanceRecordSchema.parse({
        id:
          existing >= 0
            ? records[existing]!.id
            : opaqueIdSchema.parse(
                `att_${Math.random().toString(36).slice(2, 10)}`,
              ),
        sessionId: opaqueIdSchema.parse(sessionId),
        studentId: opaqueIdSchema.parse(input.studentId),
        studentDisplayName: input.studentDisplayName,
        status: input.status,
      });
      const next =
        existing >= 0
          ? records.map((row, index) => (index === existing ? record : row))
          : [...records, record];
      attendanceBySession.set(sessionId, next);
      return toReport(sessionId);
    },
  };
}

let sessionsClient: SessionsClient = createMockSessionsClient();

export function getSessionsClient(): SessionsClient {
  return sessionsClient;
}

export function setSessionsClient(client: SessionsClient): void {
  sessionsClient = client;
}

export function __resetMockSessions(): void {
  sessions.clear();
  attendanceBySession.clear();
  sessionsClient = createMockSessionsClient();
}
