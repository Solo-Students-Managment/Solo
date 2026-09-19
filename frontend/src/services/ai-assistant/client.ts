import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const aiPersonaSchema = z.enum([
  "teacher",
  "student",
  "guardian",
  "organization",
  "personal",
]);
export type AiPersona = z.infer<typeof aiPersonaSchema>;

export const aiEntryPointSchema = z.object({
  id: opaqueIdSchema,
  persona: aiPersonaSchema,
  titleKey: z.string().min(1),
  descriptionKey: z.string().min(1),
  promptPreset: z.string().min(1),
  requiresOnline: z.boolean(),
});
export type AiEntryPoint = z.infer<typeof aiEntryPointSchema>;

export const aiMessageRoleSchema = z.enum(["user", "assistant", "system"]);
export const aiMessageSchema = z.object({
  id: opaqueIdSchema,
  role: aiMessageRoleSchema,
  content: z.string().min(1),
  createdAt: z.string(),
  sources: z.array(z.string()).default([]),
});
export type AiMessage = z.infer<typeof aiMessageSchema>;

export const aiThreadSchema = z.object({
  id: opaqueIdSchema,
  persona: aiPersonaSchema,
  title: z.string().min(1),
  entryPointId: opaqueIdSchema.nullable(),
  messages: z.array(aiMessageSchema),
  updatedAt: z.string(),
});
export type AiThread = z.infer<typeof aiThreadSchema>;

export function entryPointsForPersona(
  all: AiEntryPoint[],
  persona: AiPersona,
): AiEntryPoint[] {
  return all.filter((e) => e.persona === persona);
}

export type AiAssistantClient = {
  listEntryPoints(persona: AiPersona): Promise<AiEntryPoint[]>;
  listThreads(persona: AiPersona): Promise<AiThread[]>;
  getThread(id: string): Promise<AiThread>;
  startThread(input: {
    persona: AiPersona;
    entryPointId?: string | null;
    title: string;
    firstMessage: string;
  }): Promise<AiThread>;
  sendMessage(threadId: string, content: string): Promise<AiThread>;
};

const ENTRY_POINTS: AiEntryPoint[] = [
  aiEntryPointSchema.parse({
    id: "ai_ep_teacher_lesson",
    persona: "teacher",
    titleKey: "entry.teacherLesson",
    descriptionKey: "entry.teacherLessonDesc",
    promptPreset: "Help me outline a lesson plan.",
    requiresOnline: true,
  }),
  aiEntryPointSchema.parse({
    id: "ai_ep_teacher_feedback",
    persona: "teacher",
    titleKey: "entry.teacherFeedback",
    descriptionKey: "entry.teacherFeedbackDesc",
    promptPreset: "Draft constructive student feedback.",
    requiresOnline: true,
  }),
  aiEntryPointSchema.parse({
    id: "ai_ep_student_study",
    persona: "student",
    titleKey: "entry.studentStudy",
    descriptionKey: "entry.studentStudyDesc",
    promptPreset: "Explain this topic simply.",
    requiresOnline: true,
  }),
  aiEntryPointSchema.parse({
    id: "ai_ep_guardian_summary",
    persona: "guardian",
    titleKey: "entry.guardianSummary",
    descriptionKey: "entry.guardianSummaryDesc",
    promptPreset: "Summarize my child's recent progress.",
    requiresOnline: true,
  }),
  aiEntryPointSchema.parse({
    id: "ai_ep_org_ops",
    persona: "organization",
    titleKey: "entry.orgOps",
    descriptionKey: "entry.orgOpsDesc",
    promptPreset: "Suggest an operations checklist.",
    requiresOnline: true,
  }),
];

export function createHttpAiAssistantClient(): AiAssistantClient {
  return {
    async listEntryPoints(persona) {
      return apiRequest(
        `/ai/entry-points?persona=${encodeURIComponent(persona)}`,
        {
          parse: (d) => z.array(aiEntryPointSchema).parse(d),
        },
      );
    },
    async listThreads(persona) {
      return apiRequest(`/ai/threads?persona=${encodeURIComponent(persona)}`, {
        parse: (d) => z.array(aiThreadSchema).parse(d),
      });
    },
    async getThread(id) {
      return apiRequest(`/ai/threads/${encodeURIComponent(id)}`, {
        parse: (d) => aiThreadSchema.parse(d),
      });
    },
    async startThread(input) {
      return apiRequest("/ai/threads", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (d) => aiThreadSchema.parse(d),
      });
    },
    async sendMessage(threadId, content) {
      return apiRequest(
        `/ai/threads/${encodeURIComponent(threadId)}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content }),
          parse: (d) => aiThreadSchema.parse(d),
        },
      );
    },
  };
}

export function createMockAiAssistantClient(): AiAssistantClient {
  const threads = new Map<string, AiThread>();
  let seq = 1;

  function assistantReply(userContent: string): AiMessage {
    return aiMessageSchema.parse({
      id: `aim_${seq++}`,
      role: "assistant",
      content: `Draft suggestion (requires human review): ${userContent.slice(0, 120)}`,
      createdAt: new Date().toISOString(),
      sources: ["solo-policy", "curriculum-context"],
    });
  }

  return {
    async listEntryPoints(persona) {
      return entryPointsForPersona(ENTRY_POINTS, persona);
    },
    async listThreads(persona) {
      return Array.from(threads.values()).filter((t) => t.persona === persona);
    },
    async getThread(id) {
      const row = threads.get(id);
      if (!row) throw new Error("not_found");
      return row;
    },
    async startThread(input) {
      const userMsg = aiMessageSchema.parse({
        id: `aim_${seq++}`,
        role: "user",
        content: input.firstMessage,
        createdAt: new Date().toISOString(),
        sources: [],
      });
      const row = aiThreadSchema.parse({
        id: `ait_${seq++}`,
        persona: input.persona,
        title: input.title,
        entryPointId: input.entryPointId ?? null,
        messages: [userMsg, assistantReply(input.firstMessage)],
        updatedAt: new Date().toISOString(),
      });
      threads.set(String(row.id), row);
      return row;
    },
    async sendMessage(threadId, content) {
      const row = threads.get(threadId);
      if (!row) throw new Error("not_found");
      const userMsg = aiMessageSchema.parse({
        id: `aim_${seq++}`,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
        sources: [],
      });
      const next = aiThreadSchema.parse({
        ...row,
        messages: [...row.messages, userMsg, assistantReply(content)],
        updatedAt: new Date().toISOString(),
      });
      threads.set(threadId, next);
      return next;
    },
  };
}

let active: AiAssistantClient = createMockAiAssistantClient();
export function setAiAssistantClient(c: AiAssistantClient) {
  active = c;
}
export function getAiAssistantClient() {
  return active;
}
