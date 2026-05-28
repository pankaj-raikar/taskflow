import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(160),
  progress: z.number().int().min(0).max(100).default(0),
  color: z.string().trim().min(1).max(64),
  tasksCount: z.number().int().min(0).default(0)
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
