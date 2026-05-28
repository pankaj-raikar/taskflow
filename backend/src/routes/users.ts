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
  .get("/me", (c) => {
    const user = db.select().from(users).where(eq(users.id, c.get("userId"))).get();
    if (!user) return c.json({ error: "User not found" }, 404);
    return c.json({ data: serializeUser(user) });
  })
  .get("/", (c) => {
    const rows = db.select().from(users).all();
    return c.json({ data: rows.map(serializeUser) });
  })
  .get("/:id", (c) => {
    const user = db.select().from(users).where(eq(users.id, c.req.param("id"))).get();
    if (!user) return c.json({ error: "User not found" }, 404);
    return c.json({ data: serializeUser(user) });
  })
  .patch(
    "/me",
    zValidator("json", updateUserSchema, (result, c) => {
      if (!result.success) return c.json({ error: "Invalid request body" }, 400);
    }),
    (c) => {
      const user = db
        .update(users)
        .set({
          ...c.req.valid("json"),
          updatedAt: new Date().toISOString()
        })
        .where(eq(users.id, c.get("userId")))
        .returning()
        .get();

      if (!user) return c.json({ error: "User not found" }, 404);
      return c.json({ data: serializeUser(user) });
    }
  );
