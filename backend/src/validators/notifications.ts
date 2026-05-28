import { z } from "zod";

export const createNotificationSchema = z.object({
  title: z.string().trim().min(1).max(160),
  content: z.string().trim().min(1).max(1000),
  time: z.string().trim().min(1).max(80),
  read: z.boolean().default(false)
});

export const updateNotificationSchema = createNotificationSchema.partial();

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
