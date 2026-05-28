import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";

export type AuthVariables = {
  userId: string;
};

type JwtPayload = {
  sub?: string;
  exp?: number;
};

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const authorization = c.req.header("Authorization") ?? c.req.header("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : null;

  if (!token) {
    return c.json({ error: "Missing bearer token" }, 401);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return c.json({ error: "JWT secret is not configured" }, 500);
  }

  try {
    const payload = (await verify(token, secret, "HS256")) as JwtPayload;
    if (!payload.sub) {
      return c.json({ error: "Invalid token" }, 401);
    }

    c.set("userId", payload.sub);
    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
});
