import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const enrollmentStatusSchema = z.enum([
  "active",
  "completed",
  "withdrawn",
  "failed",
  "transferred",
]);
export type EnrollmentStatus = z.infer<typeof enrollmentStatusSchema>;

export const enrollmentSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  studentId: opaqueIdSchema,
  studentDisplayName: z.string().min(1),
  classId: opaqueIdSchema,
  className: z.string().min(1),
  courseName: z.string().min(1),
  status: enrollmentStatusSchema,
  enrolledAt: z.string().min(1),
  transferredFromEnrollmentId: opaqueIdSchema.nullable().optional(),
});
export type Enrollment = z.infer<typeof enrollmentSchema>;

export const enrollmentsCollectionSchema = collectionSchema(enrollmentSchema);

export type CreateEnrollmentInput = {
  studentId: string;
  studentDisplayName: string;
  classId: string;
  className: string;
  courseName: string;
};

export type TransferEnrollmentInput = {
  classId: string;
  className: string;
  courseName: string;
};

export type EnrollmentsClient = {
  list(
    organizationId: string,
  ): Promise<z.infer<typeof enrollmentsCollectionSchema>>;
  create(
    organizationId: string,
    input: CreateEnrollmentInput,
  ): Promise<Enrollment>;
  updateStatus(
    organizationId: string,
    enrollmentId: string,
    status: EnrollmentStatus,
  ): Promise<Enrollment>;
  transfer(
    organizationId: string,
    enrollmentId: string,
    input: TransferEnrollmentInput,
  ): Promise<Enrollment>;
};

const enrollments = new Map<string, Enrollment>();

function assertMutable(enrollment: Enrollment): void {
  if (enrollment.status === "completed") {
    throw new Error("enrollments.completedReadOnly");
  }
}

export function createHttpEnrollmentsClient(): EnrollmentsClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/enrollments`,
        { parse: (data) => enrollmentsCollectionSchema.parse(data) },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/enrollments`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => enrollmentSchema.parse(data),
        },
      );
    },
    async updateStatus(organizationId, enrollmentId, status) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/enrollments/${encodeURIComponent(enrollmentId)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
          parse: (data) => enrollmentSchema.parse(data),
        },
      );
    },
    async transfer(organizationId, enrollmentId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/enrollments/${encodeURIComponent(enrollmentId)}/transfer`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => enrollmentSchema.parse(data),
        },
      );
    },
  };
}

export function createMockEnrollmentsClient(): EnrollmentsClient {
  return {
    async list(organizationId) {
      const data = [...enrollments.values()].filter(
        (row) => String(row.organizationId) === organizationId,
      );
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
        `enr_${Math.random().toString(36).slice(2, 10)}`,
      );
      const enrollment = enrollmentSchema.parse({
        id,
        organizationId: opaqueIdSchema.parse(organizationId),
        studentId: opaqueIdSchema.parse(input.studentId),
        studentDisplayName: input.studentDisplayName,
        classId: opaqueIdSchema.parse(input.classId),
        className: input.className,
        courseName: input.courseName,
        status: "active",
        enrolledAt: new Date().toISOString(),
        transferredFromEnrollmentId: null,
      });
      enrollments.set(id, enrollment);
      return enrollment;
    },
    async updateStatus(_organizationId, enrollmentId, status) {
      const current = enrollments.get(enrollmentId);
      if (!current) throw new Error("enrollments.notFound");
      assertMutable(current);
      if (status === "transferred") {
        throw new Error("enrollments.useTransfer");
      }
      const next = { ...current, status };
      enrollments.set(enrollmentId, next);
      return next;
    },
    async transfer(_organizationId, enrollmentId, input) {
      const current = enrollments.get(enrollmentId);
      if (!current) throw new Error("enrollments.notFound");
      assertMutable(current);
      if (current.status !== "active") {
        throw new Error("enrollments.transferActiveOnly");
      }
      const transferred = {
        ...current,
        status: "transferred" as const,
      };
      enrollments.set(enrollmentId, transferred);
      const id = opaqueIdSchema.parse(
        `enr_${Math.random().toString(36).slice(2, 10)}`,
      );
      const next = enrollmentSchema.parse({
        id,
        organizationId: current.organizationId,
        studentId: current.studentId,
        studentDisplayName: current.studentDisplayName,
        classId: opaqueIdSchema.parse(input.classId),
        className: input.className,
        courseName: input.courseName,
        status: "active",
        enrolledAt: new Date().toISOString(),
        transferredFromEnrollmentId: current.id,
      });
      enrollments.set(id, next);
      return next;
    },
  };
}

let enrollmentsClient: EnrollmentsClient = createMockEnrollmentsClient();

export function getEnrollmentsClient(): EnrollmentsClient {
  return enrollmentsClient;
}

export function setEnrollmentsClient(client: EnrollmentsClient): void {
  enrollmentsClient = client;
}

export function __resetMockEnrollments(): void {
  enrollments.clear();
  enrollmentsClient = createMockEnrollmentsClient();
}

export function isActiveEnrollment(enrollment: Enrollment): boolean {
  return enrollment.status === "active";
}

export function isHistoryEnrollment(enrollment: Enrollment): boolean {
  return enrollment.status !== "active";
}
