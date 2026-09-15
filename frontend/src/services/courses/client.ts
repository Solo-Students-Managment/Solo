import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const courseStatusSchema = z.enum([
  "draft",
  "published",
  "paused",
  "archived",
]);
export type CourseStatus = z.infer<typeof courseStatusSchema>;

export const classStatusSchema = z.enum([
  "draft",
  "enrollment_open",
  "enrollment_closed",
  "active",
  "paused",
  "completed",
  "cancelled",
  "archived",
]);
export type ClassStatus = z.infer<typeof classStatusSchema>;

export const termSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  startsOn: z.string().min(1),
  endsOn: z.string().min(1),
});
export type Term = z.infer<typeof termSchema>;
export const termsCollectionSchema = collectionSchema(termSchema);

export const courseSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  subjectId: opaqueIdSchema,
  subjectName: z.string().min(1),
  status: courseStatusSchema,
  termId: opaqueIdSchema.nullable(),
  termName: z.string().nullable(),
  clonedFromId: opaqueIdSchema.nullable(),
  classesCount: z.number().int().nonnegative(),
});
export type Course = z.infer<typeof courseSchema>;

export const classSchema = z.object({
  id: opaqueIdSchema,
  courseId: opaqueIdSchema,
  name: z.string().min(1),
  capacity: z.number().int().positive(),
  enrolledCount: z.number().int().nonnegative(),
  status: classStatusSchema,
  continuedFromId: opaqueIdSchema.nullable(),
  midCourseEntry: z.boolean(),
});
export type ClassRoom = z.infer<typeof classSchema>;

export const coursesCollectionSchema = collectionSchema(courseSchema);
export const classesCollectionSchema = collectionSchema(classSchema);

export type CoursesClient = {
  listTerms(
    organizationId: string,
  ): Promise<z.infer<typeof termsCollectionSchema>>;
  createTerm(
    organizationId: string,
    input: { name: string; startsOn: string; endsOn: string },
  ): Promise<Term>;
  listCourses(
    organizationId: string,
  ): Promise<z.infer<typeof coursesCollectionSchema>>;
  createCourse(
    organizationId: string,
    input: {
      name: string;
      subjectId: string;
      subjectName: string;
      termId?: string | null;
    },
  ): Promise<Course>;
  cloneCourse(organizationId: string, courseId: string): Promise<Course>;
  listClasses(
    organizationId: string,
    courseId: string,
  ): Promise<z.infer<typeof classesCollectionSchema>>;
  createClass(
    organizationId: string,
    courseId: string,
    input: { name: string; capacity: number },
  ): Promise<ClassRoom>;
  continueClass(
    organizationId: string,
    courseId: string,
    classId: string,
  ): Promise<ClassRoom>;
  midCourseEntry(
    organizationId: string,
    courseId: string,
    classId: string,
  ): Promise<ClassRoom>;
};

const terms = new Map<string, Term[]>();
const courses = new Map<string, Course>();
const classes = new Map<string, ClassRoom[]>();

/** Clone/continuation never copies historical enrollment or grade records. */
export function preservesHistoryOnClone() {
  return false;
}

export function createHttpCoursesClient(): CoursesClient {
  return {
    async listTerms(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/terms`,
        { parse: (data) => termsCollectionSchema.parse(data) },
      );
    },
    async createTerm(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/terms`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => termSchema.parse(data),
        },
      );
    },
    async listCourses(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/courses`,
        { parse: (data) => coursesCollectionSchema.parse(data) },
      );
    },
    async createCourse(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/courses`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => courseSchema.parse(data),
        },
      );
    },
    async cloneCourse(organizationId, courseId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/courses/${encodeURIComponent(courseId)}/clone`,
        {
          method: "POST",
          body: JSON.stringify({}),
          parse: (data) => courseSchema.parse(data),
        },
      );
    },
    async listClasses(organizationId, courseId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/courses/${encodeURIComponent(courseId)}/classes`,
        { parse: (data) => classesCollectionSchema.parse(data) },
      );
    },
    async createClass(organizationId, courseId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/courses/${encodeURIComponent(courseId)}/classes`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => classSchema.parse(data),
        },
      );
    },
    async continueClass(organizationId, courseId, classId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/courses/${encodeURIComponent(courseId)}/classes/${encodeURIComponent(classId)}/continue`,
        {
          method: "POST",
          body: JSON.stringify({}),
          parse: (data) => classSchema.parse(data),
        },
      );
    },
    async midCourseEntry(organizationId, courseId, classId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/courses/${encodeURIComponent(courseId)}/classes/${encodeURIComponent(classId)}/mid-course-entry`,
        {
          method: "POST",
          body: JSON.stringify({}),
          parse: (data) => classSchema.parse(data),
        },
      );
    },
  };
}

export function createMockCoursesClient(): CoursesClient {
  return {
    async listTerms(organizationId) {
      const data = terms.get(organizationId) ?? [];
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
    async createTerm(organizationId, input) {
      const row = termSchema.parse({
        id: opaqueIdSchema.parse(
          `trm_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        startsOn: input.startsOn,
        endsOn: input.endsOn,
      });
      terms.set(organizationId, [...(terms.get(organizationId) ?? []), row]);
      return row;
    },
    async listCourses(organizationId) {
      const data = [...courses.values()].filter(
        (c) => String(c.organizationId) === organizationId,
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
    async createCourse(organizationId, input) {
      const term =
        input.termId != null
          ? (terms.get(organizationId) ?? []).find(
              (row) => String(row.id) === input.termId,
            )
          : null;
      const id = opaqueIdSchema.parse(
        `crs_${Math.random().toString(36).slice(2, 10)}`,
      );
      const course = courseSchema.parse({
        id,
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        subjectId: opaqueIdSchema.parse(input.subjectId),
        subjectName: input.subjectName,
        status: "draft",
        termId: term?.id ?? null,
        termName: term?.name ?? null,
        clonedFromId: null,
        classesCount: 0,
      });
      courses.set(id, course);
      classes.set(id, []);
      return course;
    },
    async cloneCourse(organizationId, courseId) {
      const source = courses.get(courseId);
      if (!source || String(source.organizationId) !== organizationId) {
        throw new Error("courses.notFound");
      }
      const id = opaqueIdSchema.parse(
        `crs_${Math.random().toString(36).slice(2, 10)}`,
      );
      const cloned = courseSchema.parse({
        ...source,
        id,
        name: `${source.name} (clone)`,
        status: "draft",
        clonedFromId: source.id,
        classesCount: 0,
      });
      courses.set(id, cloned);
      classes.set(id, []);
      return cloned;
    },
    async listClasses(_organizationId, courseId) {
      const data = classes.get(courseId) ?? [];
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
    async createClass(_organizationId, courseId, input) {
      const course = courses.get(courseId);
      if (!course) throw new Error("courses.notFound");
      const id = opaqueIdSchema.parse(
        `cls_${Math.random().toString(36).slice(2, 10)}`,
      );
      const room = classSchema.parse({
        id,
        courseId: opaqueIdSchema.parse(courseId),
        name: input.name.trim(),
        capacity: input.capacity,
        enrolledCount: 0,
        status: "draft",
        continuedFromId: null,
        midCourseEntry: false,
      });
      const next = [...(classes.get(courseId) ?? []), room];
      classes.set(courseId, next);
      courses.set(courseId, {
        ...course,
        classesCount: next.length,
        status: course.status === "draft" ? "published" : course.status,
      });
      return room;
    },
    async continueClass(_organizationId, courseId, classId) {
      const course = courses.get(courseId);
      if (!course) throw new Error("courses.notFound");
      const source = (classes.get(courseId) ?? []).find(
        (row) => String(row.id) === classId,
      );
      if (!source) throw new Error("courses.notFound");
      const id = opaqueIdSchema.parse(
        `cls_${Math.random().toString(36).slice(2, 10)}`,
      );
      const continued = classSchema.parse({
        ...source,
        id,
        name: `${source.name} (continued)`,
        enrolledCount: 0,
        status: "draft",
        continuedFromId: source.id,
        midCourseEntry: false,
      });
      const next = [...(classes.get(courseId) ?? []), continued];
      classes.set(courseId, next);
      courses.set(courseId, { ...course, classesCount: next.length });
      return continued;
    },
    async midCourseEntry(_organizationId, courseId, classId) {
      const rows = classes.get(courseId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === classId);
      if (idx < 0) throw new Error("courses.notFound");
      const updated = classSchema.parse({
        ...rows[idx]!,
        midCourseEntry: true,
        status:
          rows[idx]!.status === "draft" ? "enrollment_open" : rows[idx]!.status,
      });
      classes.set(
        courseId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      return updated;
    },
  };
}

let coursesClient: CoursesClient = createMockCoursesClient();

export function getCoursesClient(): CoursesClient {
  return coursesClient;
}

export function setCoursesClient(client: CoursesClient): void {
  coursesClient = client;
}

export function __resetMockCourses(): void {
  terms.clear();
  courses.clear();
  classes.clear();
  coursesClient = createMockCoursesClient();
}
