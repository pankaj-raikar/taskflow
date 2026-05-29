import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { notifications, type Notification } from "../db/schema";
import { authMiddleware, type AuthVariables } from "../middleware/auth";
import { createNotificationSchema, updateNotificationSchema } from "../validators/notifications";

function serializeNotification(notification: Notification) {
  return {
    id: notification.id,
    title: notification.title,
    content: notification.content,
    time: notification.time,
    read: notification.read,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt
  };
}

export const notificationRoutes = new Hono<{ Variables: AuthVariables }>()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    const rows = await db.select().from(notifications).where(eq(notifications.userId, c.get("userId")));
    return c.json({ data: rows.map(serializeNotification) });
  })
  .post(
    "/",
    zValidator("json", createNotificationSchema, (result, c) => {
      if (!result.success) return c.json({ error: "Invalid request body" }, 400);
    }),
    async (c) => {
      const [notification] = await db
        .insert(notifications)
        .values({ ...c.req.valid("json"), userId: c.get("userId") })
        .returning();

      if (!notification) return c.json({ error: "Unable to create notification" }, 500);

      return c.json({ data: serializeNotification(notification) }, 201);
    }
  )
  .patch(
    "/:id",
    zValidator("json", updateNotificationSchema, (result, c) => {
      if (!result.success) return c.json({ error: "Invalid request body" }, 400);
    }),
    async (c) => {
      const [notification] = await db
        .update(notifications)
        .set({ ...c.req.valid("json"), updatedAt: new Date() })
        .where(and(eq(notifications.id, c.req.param("id")), eq(notifications.userId, c.get("userId"))))
        .returning();

      if (!notification) return c.json({ error: "Notification not found" }, 404);
      return c.json({ data: serializeNotification(notification) });
    }
  )
  .delete("/:id", async (c) => {
    const [notification] = await db
      .delete(notifications)
      .where(and(eq(notifications.id, c.req.param("id")), eq(notifications.userId, c.get("userId"))))
      .returning();

    if (!notification) return c.json({ error: "Notification not found" }, 404);
    return c.json({ data: serializeNotification(notification) });
  });
