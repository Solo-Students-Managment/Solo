import { describe, expect, it } from "vitest";
import { createMockAiAssistantClient, entryPointsForPersona } from "./client";

describe("ai assistant", () => {
  it("filters entry points by persona", async () => {
    const client = createMockAiAssistantClient();
    const teacher = await client.listEntryPoints("teacher");
    expect(teacher.every((e) => e.persona === "teacher")).toBe(true);
    expect(entryPointsForPersona(teacher, "student")).toHaveLength(0);
  });

  it("starts a thread with assistant draft requiring review", async () => {
    const client = createMockAiAssistantClient();
    const thread = await client.startThread({
      persona: "teacher",
      title: "Lesson help",
      firstMessage: "Outline a geometry lesson",
      entryPointId: "ai_ep_teacher_lesson",
    });
    expect(thread.messages).toHaveLength(2);
    expect(thread.messages[1]!.role).toBe("assistant");
    expect(thread.messages[1]!.content).toMatch(/human review/i);
    expect(thread.messages[1]!.sources.length).toBeGreaterThan(0);
  });
});
