import { z } from "zod";

import { apiRequest, opaqueIdSchema } from "@/services/api";
import type { Persona } from "@/services/auth";
import { personaSchema } from "@/services/auth";

export const availablePersonaSchema = z.object({
  persona: personaSchema,
  activated: z.boolean(),
  labelKey: z.string(),
});
export type AvailablePersona = z.infer<typeof availablePersonaSchema>;

export const availableContextSchema = z.object({
  id: opaqueIdSchema.nullable(),
  kind: z.enum(["personal", "organization"]),
  label: z.string(),
  organizationId: opaqueIdSchema.nullable(),
});
export type AvailableContext = z.infer<typeof availableContextSchema>;

export const teacherDashboardSchema = z.object({
  plan: z.literal("teacher_free"),
  studentsCount: z.number().int().nonnegative(),
  classesCount: z.number().int().nonnegative(),
  upcomingSessionsCount: z.number().int().nonnegative(),
});
export type TeacherDashboard = z.infer<typeof teacherDashboardSchema>;

export type HomeClient = {
  listPersonas(): Promise<AvailablePersona[]>;
  listContexts(): Promise<AvailableContext[]>;
  activateTeacher(): Promise<{ persona: Persona }>;
  getTeacherDashboard(): Promise<TeacherDashboard>;
};

let memoryPersonas: AvailablePersona[] = [
  {
    persona: "teacher",
    activated: true,
    labelKey: "home.persona.teacher",
  },
  {
    persona: "student",
    activated: false,
    labelKey: "home.persona.student",
  },
  {
    persona: "guardian",
    activated: false,
    labelKey: "home.persona.guardian",
  },
];

let memoryContexts: AvailableContext[] = [
  {
    id: null,
    kind: "personal",
    label: "Personal",
    organizationId: null,
  },
];

let memoryTeacherDash: TeacherDashboard = {
  plan: "teacher_free",
  studentsCount: 0,
  classesCount: 0,
  upcomingSessionsCount: 0,
};

export function createHttpHomeClient(): HomeClient {
  return {
    async listPersonas() {
      return apiRequest("/auth/personas", {
        parse: (data) => z.array(availablePersonaSchema).parse(data),
      });
    },
    async listContexts() {
      return apiRequest("/auth/contexts", {
        parse: (data) => z.array(availableContextSchema).parse(data),
      });
    },
    async activateTeacher() {
      return apiRequest("/auth/personas/teacher/activate", {
        method: "POST",
        parse: (data) => z.object({ persona: personaSchema }).parse(data),
      });
    },
    async getTeacherDashboard() {
      return apiRequest("/teacher/dashboard", {
        parse: (data) => teacherDashboardSchema.parse(data),
      });
    },
  };
}

export function createMockHomeClient(): HomeClient {
  return {
    async listPersonas() {
      return memoryPersonas;
    },
    async listContexts() {
      return memoryContexts;
    },
    async activateTeacher() {
      memoryPersonas = memoryPersonas.map((p) =>
        p.persona === "teacher" ? { ...p, activated: true } : p,
      );
      if (!memoryPersonas.some((p) => p.persona === "teacher")) {
        memoryPersonas = [
          ...memoryPersonas,
          {
            persona: "teacher",
            activated: true,
            labelKey: "home.persona.teacher",
          },
        ];
      }
      memoryTeacherDash = {
        plan: "teacher_free",
        studentsCount: 2,
        classesCount: 1,
        upcomingSessionsCount: 1,
      };
      return { persona: "teacher" };
    },
    async getTeacherDashboard() {
      return memoryTeacherDash;
    },
  };
}

let homeClient: HomeClient = createMockHomeClient();

export function getHomeClient(): HomeClient {
  return homeClient;
}

export function setHomeClient(client: HomeClient): void {
  homeClient = client;
}

export function __resetMockHome(): void {
  memoryPersonas = [
    {
      persona: "teacher",
      activated: true,
      labelKey: "home.persona.teacher",
    },
    {
      persona: "student",
      activated: false,
      labelKey: "home.persona.student",
    },
    {
      persona: "guardian",
      activated: false,
      labelKey: "home.persona.guardian",
    },
  ];
  memoryContexts = [
    {
      id: null,
      kind: "personal",
      label: "Personal",
      organizationId: null,
    },
  ];
  memoryTeacherDash = {
    plan: "teacher_free",
    studentsCount: 0,
    classesCount: 0,
    upcomingSessionsCount: 0,
  };
  homeClient = createMockHomeClient();
}

export function __addMockOrgContext(orgId: string, label: string): void {
  memoryContexts = [
    ...memoryContexts.filter((c) => c.organizationId !== orgId),
    {
      id: opaqueIdSchema.parse(orgId),
      kind: "organization",
      label,
      organizationId: opaqueIdSchema.parse(orgId),
    },
  ];
}

export function __activateMockStudentPersona(): void {
  memoryPersonas = memoryPersonas.map((p) =>
    p.persona === "student" ? { ...p, activated: true } : p,
  );
}

export function __activateMockGuardianPersona(): void {
  memoryPersonas = memoryPersonas.map((p) =>
    p.persona === "guardian" ? { ...p, activated: true } : p,
  );
}
