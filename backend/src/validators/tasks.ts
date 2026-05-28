import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "in-progress", "done"]);
export const taskCategorySchema = z.enum(["Design", "Development", "Work", "Meeting", "Bug", "Documentation"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().max(4000).default(""),
  status: taskStatusSchema,
  category: taskCategorySchema,
  priority: taskPrioritySchema,
  dueDate: z.iso.date(),
  assigneeId: z.string().min(1),
  starred: z.boolean().default(false)
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
