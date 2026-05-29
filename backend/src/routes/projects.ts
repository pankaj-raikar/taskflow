import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { projects, type Project } from "../db/schema";
import { authMiddleware, type AuthVariables } from "../middleware/auth";
import { createProjectSchema, updateProjectSchema } from "../validators/projects";

function serializeProject(project: Project) {
  return {
    id: project.id,
    name: project.name,
    progress: project.progress,
    color: project.color,
    tasksCount: project.tasksCount,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}

export const projectRoutes = new Hono<{ Variables: AuthVariables }>()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    const rows = await db.select().from(projects).where(eq(projects.userId, c.get("userId")));
    return c.json({ data: rows.map(serializeProject) });
  })
  .get("/:id", async (c) => {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, c.req.param("id")), eq(projects.userId, c.get("userId"))));

    if (!project) return c.json({ error: "Project not found" }, 404);
    return c.json({ data: serializeProject(project) });
  })
  .post(
    "/",
    zValidator("json", createProjectSchema, (result, c) => {
      if (!result.success) return c.json({ error: "Invalid request body" }, 400);
    }),
    async (c) => {
      const [project] = await db
        .insert(projects)
        .values({ ...c.req.valid("json"), userId: c.get("userId") })
        .returning();

      if (!project) return c.json({ error: "Unable to create project" }, 500);

      return c.json({ data: serializeProject(project) }, 201);
    }
  )
  .patch(
    "/:id",
    zValidator("json", updateProjectSchema, (result, c) => {
      if (!result.success) return c.json({ error: "Invalid request body" }, 400);
    }),
    async (c) => {
      const [project] = await db
        .update(projects)
        .set({ ...c.req.valid("json"), updatedAt: new Date() })
        .where(and(eq(projects.id, c.req.param("id")), eq(projects.userId, c.get("userId"))))
        .returning();

      if (!project) return c.json({ error: "Project not found" }, 404);
      return c.json({ data: serializeProject(project) });
    }
  )
  .delete("/:id", async (c) => {
    const [project] = await db
      .delete(projects)
      .where(and(eq(projects.id, c.req.param("id")), eq(projects.userId, c.get("userId"))))
      .returning();

    if (!project) return c.json({ error: "Project not found" }, 404);
    return c.json({ data: serializeProject(project) });
  });
