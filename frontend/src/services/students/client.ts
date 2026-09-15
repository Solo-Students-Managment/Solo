import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";
import { maskPhoneE164 } from "@/services/auth/phone";

export const managedStudentSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  displayName: z.string().min(1),
  phoneMasked: z.string().min(1),
  status: z.enum(["active", "invited", "inactive"]),
  guardiansCount: z.number().int().nonnegative(),
});
export type ManagedStudent = z.infer<typeof managedStudentSchema>;

export const studentGuardianSchema = z.object({
  id: opaqueIdSchema,
  displayName: z.string().min(1),
  phoneMasked: z.string().min(1),
  relationshipLabel: z.string().min(1),
  status: z.enum(["active", "pending"]),
});
export type StudentGuardian = z.infer<typeof studentGuardianSchema>;

export const managedStudentDetailSchema = managedStudentSchema.extend({
  guardians: z.array(studentGuardianSchema),
  activeSubjectsCount: z.number().int().nonnegative(),
});
export type ManagedStudentDetail = z.infer<typeof managedStudentDetailSchema>;

export const managedStudentsCollectionSchema =
  collectionSchema(managedStudentSchema);

export type CreateManagedStudentInput = {
  displayName: string;
  phoneE164: string;
};

type StudentRecord = ManagedStudentDetail & { phoneE164: string };

const students = new Map<string, StudentRecord>();

export type StudentsManageClient = {
  list(
    organizationId: string,
  ): Promise<z.infer<typeof managedStudentsCollectionSchema>>;
  get(organizationId: string, studentId: string): Promise<ManagedStudentDetail>;
  create(
    organizationId: string,
    input: CreateManagedStudentInput,
  ): Promise<ManagedStudent>;
  linkGuardian(
    organizationId: string,
    studentId: string,
    input: {
      displayName: string;
      phoneE164: string;
      relationshipLabel: string;
    },
  ): Promise<StudentGuardian>;
};

function toListItem(row: StudentRecord): ManagedStudent {
  return managedStudentSchema.parse({
    id: row.id,
    organizationId: row.organizationId,
    displayName: row.displayName,
    phoneMasked: row.phoneMasked,
    status: row.status,
    guardiansCount: row.guardians.length,
  });
}

function toDetail(row: StudentRecord): ManagedStudentDetail {
  return managedStudentDetailSchema.parse({
    id: row.id,
    organizationId: row.organizationId,
    displayName: row.displayName,
    phoneMasked: row.phoneMasked,
    status: row.status,
    guardiansCount: row.guardians.length,
    guardians: row.guardians,
    activeSubjectsCount: row.activeSubjectsCount,
  });
}

export function createHttpStudentsManageClient(): StudentsManageClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/students`,
        {
          parse: (data) => managedStudentsCollectionSchema.parse(data),
        },
      );
    },
    async get(organizationId, studentId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/students/${encodeURIComponent(studentId)}`,
        {
          parse: (data) => managedStudentDetailSchema.parse(data),
        },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/students`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => managedStudentSchema.parse(data),
        },
      );
    },
    async linkGuardian(organizationId, studentId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/students/${encodeURIComponent(studentId)}/guardians`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => studentGuardianSchema.parse(data),
        },
      );
    },
  };
}

export function createMockStudentsManageClient(): StudentsManageClient {
  return {
    async list(organizationId) {
      const data = [...students.values()]
        .filter((row) => String(row.organizationId) === organizationId)
        .map(toListItem);
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
    async get(organizationId, studentId) {
      const row = students.get(studentId);
      if (!row || String(row.organizationId) !== organizationId) {
        throw new Error("students.notFound");
      }
      return toDetail(row);
    },
    async create(organizationId, input) {
      const id = opaqueIdSchema.parse(
        `stu_${Math.random().toString(36).slice(2, 10)}`,
      );
      const record: StudentRecord = {
        id,
        organizationId: opaqueIdSchema.parse(organizationId),
        displayName: input.displayName.trim(),
        phoneMasked: maskPhoneE164(input.phoneE164),
        phoneE164: input.phoneE164,
        status: "invited",
        guardiansCount: 0,
        guardians: [],
        activeSubjectsCount: 0,
      };
      students.set(id, record);
      return toListItem(record);
    },
    async linkGuardian(organizationId, studentId, input) {
      const row = students.get(studentId);
      if (!row || String(row.organizationId) !== organizationId) {
        throw new Error("students.notFound");
      }
      const guardian = studentGuardianSchema.parse({
        id: opaqueIdSchema.parse(
          `grd_${Math.random().toString(36).slice(2, 10)}`,
        ),
        displayName: input.displayName.trim(),
        phoneMasked: maskPhoneE164(input.phoneE164),
        relationshipLabel: input.relationshipLabel.trim(),
        status: "pending",
      });
      const next = {
        ...row,
        guardians: [...row.guardians, guardian],
        guardiansCount: row.guardians.length + 1,
      };
      students.set(studentId, next);
      return guardian;
    },
  };
}

let studentsManageClient: StudentsManageClient =
  createMockStudentsManageClient();

export function getStudentsManageClient(): StudentsManageClient {
  return studentsManageClient;
}

export function setStudentsManageClient(client: StudentsManageClient): void {
  studentsManageClient = client;
}

export function __resetMockManagedStudents(): void {
  students.clear();
  studentsManageClient = createMockStudentsManageClient();
}

/** Used by MSW to share state with mock client when needed. */
export function __seedManagedStudent(record: StudentRecord): void {
  students.set(String(record.id), record);
}
