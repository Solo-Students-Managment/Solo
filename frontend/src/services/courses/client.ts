import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const courseSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  subjectId: opaqueIdSchema,
  subjectName: z.string().min(1),
  status: z.enum(["draft", "active", "archived"]),
  classesCount: z.number().int().nonnegative(),
});
export type Course = z.infer<typeof courseSchema>;

export const classSchema = z.object({
  id: opaqueIdSchema,
  courseId: opaqueIdSchema,
  name: z.string().min(1),
  capacity: z.number().int().positive(),
  enrolledCount: z.number().int().nonnegative(),
  status: z.enum(["planned", "active", "completed"]),
});
export type ClassRoom = z.infer<typeof classSchema>;

export const coursesCollectionSchema = collectionSchema(courseSchema);
export const classesCollectionSchema = collectionSchema(classSchema);

export type CoursesClient = {
  listCourses(
    organizationId: string,
  ): Promise<z.infer<typeof coursesCollectionSchema>>;
  createCourse(
    organizationId: string,
    input: { name: string; subjectId: string; subjectName: string },
  ): Promise<Course>;
  listClasses(
    organizationId: string,
    courseId: string,
  ): Promise<z.infer<typeof classesCollectionSchema>>;
  createClass(
    organizationId: string,
    courseId: string,
    input: { name: string; capacity: number },
  ): Promise<ClassRoom>;
};

const courses = new Map<string, Course>();
const classes = new Map<string, ClassRoom[]>();

export function createHttpCoursesClient(): CoursesClient {
  return {
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
  };
}

export function createMockCoursesClient(): CoursesClient {
  return {
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
        classesCount: 0,
      });
      courses.set(id, course);
      classes.set(id, []);
      return course;
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
        status: "planned",
      });
      const next = [...(classes.get(courseId) ?? []), room];
      classes.set(courseId, next);
      courses.set(courseId, {
        ...course,
        classesCount: next.length,
        status: course.status === "draft" ? "active" : course.status,
      });
      return room;
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
  courses.clear();
  classes.clear();
  coursesClient = createMockCoursesClient();
}
