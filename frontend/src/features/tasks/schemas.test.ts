import { describe, expect, it } from "vitest";
import { createTaskSchema } from "./schemas";

describe("createTaskSchema", () => {
  it("requires core task fields", () => {
    const result = createTaskSchema.safeParse({
      title: "",
      description: "",
      assigneeDisplayName: "",
      departmentName: "",
      priority: "medium",
      dueDate: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid create payload", () => {
    const result = createTaskSchema.safeParse({
      title: "Prep classroom",
      description: "Set up boards and materials",
      assigneeDisplayName: "Sara",
      departmentName: "Academics",
      priority: "high",
      dueDate: "2026-09-20",
    });
    expect(result.success).toBe(true);
  });
});
