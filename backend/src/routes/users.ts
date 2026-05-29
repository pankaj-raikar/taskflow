import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { users, type User } from "../db/schema";
import { authMiddleware, type AuthVariables } from "../middleware/auth";
import { updateUserSchema } from "../validators/users";

function serializeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export const userRoutes = new Hono<{ Variables: AuthVariables }>()
  .use("*", authMiddleware)
  .get("/me", async (c) => {
    const [user] = await db.select().from(users).where(eq(users.id, c.get("userId")));
    if (!user) return c.json({ error: "User not found" }, 404);
    return c.json({ data: serializeUser(user) });
  })
  .get("/", async (c) => {
    const rows = await db.select().from(users).where(eq(users.id, c.get("userId")));
    return c.json({ data: rows.map(serializeUser) });
  })
  .get("/:id", async (c) => {
    const requestedId = c.req.param("id");
    if (requestedId !== c.get("userId")) return c.json({ error: "User not found" }, 404);

    const [user] = await db.select().from(users).where(eq(users.id, requestedId));
    if (!user) return c.json({ error: "User not found" }, 404);
    return c.json({ data: serializeUser(user) });
  })
  .patch(
    "/me",
    zValidator("json", updateUserSchema, (result, c) => {
      if (!result.success) return c.json({ error: "Invalid request body" }, 400);
    }),
    async (c) => {
      const [user] = await db
        .update(users)
        .set({
          ...c.req.valid("json"),
          updatedAt: new Date()
        })
        .where(eq(users.id, c.get("userId")))
        .returning();

      if (!user) return c.json({ error: "User not found" }, 404);
      return c.json({ data: serializeUser(user) });
    }
  );
