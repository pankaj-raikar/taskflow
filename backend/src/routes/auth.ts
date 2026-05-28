import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { users, type User } from "../db/schema";
import { loginSchema, registerSchema } from "../validators/auth";

const sevenDaysInSeconds = 7 * 24 * 60 * 60;

function serializeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    role: user.role,
    status: user.status
  };
}

async function createToken(userId: string) {
  const now = Math.floor(Date.now() / 1000);
  return sign(
    {
      sub: userId,
      iat: now,
      exp: now + sevenDaysInSeconds
    },
    process.env.JWT_SECRET!,
    "HS256"
  );
}

export const authRoutes = new Hono()
  .post(
    "/register",
    zValidator("json", registerSchema, (result, c) => {
      if (!result.success) return c.json({ error: "Invalid request body" }, 400);
    }),
    async (c) => {
      const input = c.req.valid("json");
      const existing = db.select().from(users).where(eq(users.email, input.email)).get();

      if (existing) {
        return c.json({ error: "Email already registered" }, 409);
      }

      const passwordHash = await Bun.password.hash(input.password);
      const user = db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          passwordHash
        })
        .returning()
        .get();

      const token = await createToken(user.id);
      return c.json({ token, user: serializeUser(user) }, 201);
    }
  )
  .post(
    "/login",
    zValidator("json", loginSchema, (result, c) => {
      if (!result.success) return c.json({ error: "Invalid request body" }, 400);
    }),
    async (c) => {
      const input = c.req.valid("json");
      const user = db.select().from(users).where(eq(users.email, input.email)).get();

      if (!user || !(await Bun.password.verify(input.password, user.passwordHash))) {
        return c.json({ error: "Invalid email or password" }, 401);
      }

      const token = await createToken(user.id);
      return c.json({ token, user: serializeUser(user) });
    }
  );
