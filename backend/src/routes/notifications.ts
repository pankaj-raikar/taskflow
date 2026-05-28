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
  .get("/", (c) => {
    const rows = db.select().from(notifications).where(eq(notifications.userId, c.get("userId"))).all();
    return c.json({ data: rows.map(serializeNotification) });
  })
  .post(
    "/",
    zValidator("json", createNotificationSchema, (result, c) => {
      if (!result.success) return c.json({ error: "Invalid request body" }, 400);
    }),
    (c) => {
      const notification = db
        .insert(notifications)
        .values({ ...c.req.valid("json"), userId: c.get("userId") })
        .returning()
        .get();

      return c.json({ data: serializeNotification(notification) }, 201);
    }
  )
  .patch(
    "/:id",
    zValidator("json", updateNotificationSchema, (result, c) => {
      if (!result.success) return c.json({ error: "Invalid request body" }, 400);
    }),
    (c) => {
      const notification = db
        .update(notifications)
        .set({ ...c.req.valid("json"), updatedAt: new Date().toISOString() })
        .where(and(eq(notifications.id, c.req.param("id")), eq(notifications.userId, c.get("userId"))))
        .returning()
        .get();

      if (!notification) return c.json({ error: "Notification not found" }, 404);
      return c.json({ data: serializeNotification(notification) });
    }
  )
  .delete("/:id", (c) => {
    const notification = db
      .delete(notifications)
      .where(and(eq(notifications.id, c.req.param("id")), eq(notifications.userId, c.get("userId"))))
      .returning()
      .get();

    if (!notification) return c.json({ error: "Notification not found" }, 404);
    return c.json({ data: serializeNotification(notification) });
  });
