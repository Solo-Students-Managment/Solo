import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "tasks.validation.title"),
  description: z.string().trim().min(1, "tasks.validation.description"),
  assigneeDisplayName: z.string().trim().min(1, "tasks.validation.assignee"),
  departmentName: z.string().trim().min(1, "tasks.validation.department"),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().trim().min(1, "tasks.validation.dueDate"),
});
export type CreateTaskValues = z.infer<typeof createTaskSchema>;
