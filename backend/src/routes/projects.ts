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
  .get("/", (c) => {
    const rows = db.select().from(projects).where(eq(projects.userId, c.get("userId"))).all();
    return c.json({ data: rows.map(serializeProject) });
  })
  .get("/:id", (c) => {
    const project = db
      .select()
      .from(projects)
      .where(and(eq(projects.id, c.req.param("id")), eq(projects.userId, c.get("userId"))))
      .get();

    if (!project) return c.json({ error: "Project not found" }, 404);
    return c.json({ data: serializeProject(project) });
  })
  .post(
    "/",
    zValidator("json", createProjectSchema, (result, c) => {
      if (!result.success) return c.json({ error: "Invalid request body" }, 400);
    }),
    (c) => {
      const project = db
        .insert(projects)
        .values({ ...c.req.valid("json"), userId: c.get("userId") })
        .returning()
        .get();

      return c.json({ data: serializeProject(project) }, 201);
    }
  )
  .patch(
    "/:id",
    zValidator("json", updateProjectSchema, (result, c) => {
      if (!result.success) return c.json({ error: "Invalid request body" }, 400);
    }),
    (c) => {
      const project = db
        .update(projects)
        .set({ ...c.req.valid("json"), updatedAt: new Date().toISOString() })
        .where(and(eq(projects.id, c.req.param("id")), eq(projects.userId, c.get("userId"))))
        .returning()
        .get();

      if (!project) return c.json({ error: "Project not found" }, 404);
      return c.json({ data: serializeProject(project) });
    }
  )
  .delete("/:id", (c) => {
    const project = db
      .delete(projects)
      .where(and(eq(projects.id, c.req.param("id")), eq(projects.userId, c.get("userId"))))
      .returning()
      .get();

    if (!project) return c.json({ error: "Project not found" }, 404);
    return c.json({ data: serializeProject(project) });
  });
