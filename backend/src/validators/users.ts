import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(120),
  avatar: z.string().max(1000),
  bio: z.string().max(1000),
  role: z.string().trim().min(1).max(120),
  status: z.enum(["online", "offline", "away"])
}).partial();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
